import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TokenRequest {
  redirect_url?: string;
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createHmacSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = new Uint8Array(signature);
  const signatureString = Array.from(signatureArray)
    .map(byte => String.fromCharCode(byte))
    .join('');

  return base64UrlEncode(signatureString);
}

async function createToolToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;
  const signature = await createHmacSignature(dataToSign, secret);
  return `${dataToSign}.${signature}`;
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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const toolTokenSecret = Deno.env.get("TOOL_TOKEN_SECRET");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    if (!toolTokenSecret || toolTokenSecret.length < 32) {
      console.error("TOOL_TOKEN_SECRET is missing or too short");
      return new Response(
        JSON.stringify({
          success: false,
          error: "server_configuration_error",
          message: "Token signing is not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "missing_auth",
          message: "Authorization header is required",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const sessionToken = authHeader.replace("Bearer ", "");

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${sessionToken}` },
      },
    });

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser();

    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid_session",
          message: "Invalid or expired session",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userEmail = userData.user.email;
    if (!userEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "no_email",
          message: "User email not found",
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: memberData, error: memberError } = await supabaseAdmin
      .from("registered_members")
      .select("id, email, first_name, last_name")
      .ilike("email", userEmail.toLowerCase().trim())
      .maybeSingle();

    if (memberError) {
      console.error("Error checking member status:", memberError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "database_error",
          message: "Error verifying membership",
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
          success: false,
          error: "not_member",
          message: "You must be a registered member to access tools",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + (5 * 60);

    const tokenPayload = {
      sub: memberData.id,
      email: memberData.email.toLowerCase(),
      name: `${memberData.first_name} ${memberData.last_name}`.trim(),
      iat: now,
      exp: exp,
      iss: "ecliptica-tool-bridge",
      aud: "ecliptica-tools",
    };

    const token = await createToolToken(tokenPayload, toolTokenSecret);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        expires_at: exp,
        expires_in: 300,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in issue-tool-token:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "server_error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
