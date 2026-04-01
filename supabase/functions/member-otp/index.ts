import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, email, code } = await req.json();
    const normalizedEmail = email.toLowerCase().trim();

    if (action === "send") {
      const otp = String(Math.floor(10000 + Math.random() * 90000));

      await supabase
        .from("member_otp_codes")
        .delete()
        .eq("email", normalizedEmail);

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const { error: insertError } = await supabase
        .from("member_otp_codes")
        .insert({ email: normalizedEmail, code: otp, expires_at: expiresAt });

      if (insertError) throw insertError;

      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Ecliptica <notifications@updates.ecliptica-ops.com>",
          to: [normalizedEmail],
          subject: "Your Ecliptica Access Code",
          html: `
            <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #F7F5F0;">
              <div style="text-align: center; margin-bottom: 32px;">
                <p style="font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #C9A84C; margin: 0 0 8px;">Ecliptica Members</p>
                <h1 style="font-size: 28px; color: #1B2340; margin: 0; font-weight: 300;">Your Access Code</h1>
              </div>
              <div style="background: #ffffff; border: 1px solid rgba(201, 168, 76, 0.3); padding: 40px; text-align: center; margin-bottom: 32px;">
                <p style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(27,35,64,0.5); margin: 0 0 16px;">One-Time Code</p>
                <p style="font-size: 52px; letter-spacing: 16px; color: #1B2340; margin: 0; font-weight: 700;">${otp}</p>
                <p style="font-size: 11px; color: rgba(27,35,64,0.5); margin: 20px 0 0;">Expires in 10 minutes</p>
              </div>
              <p style="font-size: 11px; color: rgba(27,35,64,0.5); text-align: center; margin: 0;">If you did not request this code, you can safely ignore this email.</p>
            </div>
          `,
          text: `Your Ecliptica access code is: ${otp}\n\nThis code expires in 10 minutes.`,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        throw new Error(`Failed to send email: ${errText}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const { data: record } = await supabase
        .from("member_otp_codes")
        .select()
        .eq("email", normalizedEmail)
        .eq("code", code)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!record) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("member_otp_codes")
        .update({ used: true })
        .eq("id", record.id);

      const { error: createError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
      });

      if (createError && !createError.message.toLowerCase().includes("already")) {
        throw createError;
      }

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email: normalizedEmail,
      });

      if (linkError) throw linkError;

      return new Response(
        JSON.stringify({ success: true, hashed_token: linkData.properties.hashed_token }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
