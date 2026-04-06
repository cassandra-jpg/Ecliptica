import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ValidateRequest {
  token: string;
  tool_slug?: string;
  token_type?: "session" | "tool_token";
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function verifyHmacSignature(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  let sigBase64 = signature.replace(/-/g, '+').replace(/_/g, '/');
  while (sigBase64.length % 4) {
    sigBase64 += '=';
  }
  const sigBytes = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0));

  return await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, messageData);
}

async function verifyToolToken(token: string, secret: string): Promise<{ valid: boolean; payload?: Record<string, unknown>; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: "invalid_token_format" };
    }

    const [headerEncoded, payloadEncoded, signature] = parts;
    const dataToVerify = `${headerEncoded}.${payloadEncoded}`;

    const isValid = await verifyHmacSignature(dataToVerify, signature, secret);
    if (!isValid) {
      return { valid: false, error: "invalid_signature" };
    }

    const payload = JSON.parse(base64UrlDecode(payloadEncoded));

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "token_expired" };
    }

    if (payload.iss !== "ecliptica-tool-bridge") {
      return { valid: false, error: "invalid_issuer" };
    }

    if (payload.aud !== "ecliptica-tools") {
      return { valid: false, error: "invalid_audience" };
    }

    return { valid: true, payload };
  } catch (e) {
    console.error("Token verification error:", e);
    return { valid: false, error: "verification_failed" };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const toolTokenSecret = Deno.env.get("TOOL_TOKEN_SECRET");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }

    let token: string;
    let toolSlug: string;
    let tokenType: "session" | "tool_token" = "tool_token";

    if (req.method === "GET") {
      const url = new URL(req.url);
      token = url.searchParams.get("token") || "";
      toolSlug = url.searchParams.get("tool_slug") || "";
      tokenType = (url.searchParams.get("token_type") as "session" | "tool_token") || "tool_token";
    } else {
      const body: ValidateRequest = await req.json();
      token = body.token;
      toolSlug = body.tool_slug || "";
      tokenType = body.token_type || "tool_token";
    }

    if (!token) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "missing_token",
          message: "No authentication token provided",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let userEmail: string;
    let userName: string | undefined;

    if (tokenType === "tool_token") {
      if (!toolTokenSecret || toolTokenSecret.length < 32) {
        return new Response(
          JSON.stringify({
            valid: false,
            reason: "server_error",
            message: "Token validation not configured",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const verification = await verifyToolToken(token, toolTokenSecret);

      if (!verification.valid) {
        const errorMessages: Record<string, string> = {
          invalid_token_format: "Invalid token format",
          invalid_signature: "Token signature verification failed",
          token_expired: "Token has expired",
          invalid_issuer: "Token issuer is invalid",
          invalid_audience: "Token audience is invalid",
          verification_failed: "Token verification failed",
        };

        return new Response(
          JSON.stringify({
            valid: false,
            reason: verification.error || "invalid_token",
            message: errorMessages[verification.error || ""] || "Invalid token",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      userEmail = verification.payload?.email as string;
      userName = verification.payload?.name as string;

      if (!userEmail) {
        return new Response(
          JSON.stringify({
            valid: false,
            reason: "invalid_token_payload",
            message: "Token missing required claims",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      });

      const { data: userData, error: userError } = await supabaseAuth.auth.getUser();

      if (userError || !userData.user) {
        return new Response(
          JSON.stringify({
            valid: false,
            reason: "invalid_session",
            message: "Invalid or expired session token",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      userEmail = userData.user.email || "";

      if (!userEmail) {
        return new Response(
          JSON.stringify({
            valid: false,
            reason: "no_email",
            message: "User email not found",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: memberData, error: memberError } = await supabaseAdmin
      .from("registered_members")
      .select("id, email, first_name, last_name, company")
      .ilike("email", userEmail.toLowerCase().trim())
      .maybeSingle();

    if (memberError) {
      console.error("Error checking member status:", memberError);
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "database_error",
          message: "Error verifying membership status",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!memberData) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: "not_member",
          message: "User is not a registered member",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (toolSlug) {
      const { data: toolData, error: toolError } = await supabaseAdmin
        .from("member_tools")
        .select("id, name, url, slug")
        .eq("slug", toolSlug)
        .eq("is_visible", true)
        .eq("status", "active")
        .maybeSingle();

      if (toolError) {
        console.error("Error checking tool:", toolError);
        return new Response(
          JSON.stringify({
            valid: false,
            reason: "database_error",
            message: "Error verifying tool access",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!toolData) {
        return new Response(
          JSON.stringify({
            valid: false,
            reason: "tool_not_found",
            message: "Tool not found or not accessible",
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          valid: true,
          user: {
            email: memberData.email,
            first_name: memberData.first_name,
            last_name: memberData.last_name,
            company: memberData.company,
          },
          tool: {
            id: toolData.id,
            name: toolData.name,
            slug: toolData.slug,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        user: {
          email: memberData.email,
          first_name: memberData.first_name,
          last_name: memberData.last_name,
          company: memberData.company,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in validate-tool-access:", error);
    return new Response(
      JSON.stringify({
        valid: false,
        reason: "server_error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
