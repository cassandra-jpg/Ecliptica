import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MemberSignupPayload {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  phone?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: MemberSignupPayload = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const emailBody = `
New Member Active!

MEMBER DETAILS
--------------
Name: ${payload.firstName} ${payload.lastName}
Email: ${payload.email}
Company: ${payload.company}
Title: ${payload.title}
Phone: ${payload.phone || 'Not provided'}

---
This member registered via the Ecliptica website.
    `.trim();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Ecliptica Build Requests <notifications@updates.ecliptica-ops.com>",
        to: ["sales@ecliptica-ops.com", "info@ecliptica-ops.com"],
        reply_to: payload.email,
        subject: "New Member Active!",
        text: emailBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const resendData = await resendResponse.json();

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending member signup notification:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send notification",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
