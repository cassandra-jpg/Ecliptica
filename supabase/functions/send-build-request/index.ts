import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BuildRequestPayload {
  tier: string;
  firstName: string;
  lastName: string;
  company: string;
  title: string;
  email: string;
  phone: string;
  industry: string;
  teamSizeAndTools: string;
  goals: string;
  knownIssues: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: BuildRequestPayload = await req.json();

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not configured");

    const emailBody = `
New Build Request: ${payload.tier}

CONTACT INFORMATION
-------------------
Name: ${payload.firstName} ${payload.lastName}
Email: ${payload.email}
Phone: ${payload.phone}
Company: ${payload.company}
Title: ${payload.title}

BUSINESS DETAILS
----------------
Industry: ${payload.industry}

Team Size and Current Tools:
${payload.teamSizeAndTools}

GOALS (Next 12 Months)
----------------------
${payload.goals}

KNOWN ISSUES
------------
${payload.knownIssues}

---
This request was submitted via the Ecliptica website.
    `.trim();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Ecliptica Build Requests <onboarding@resend.dev>", to: ["sales@ecliptica-ops.com", "info@ecliptica-ops.com"], subject: `New Build Request: ${payload.tier}`, text: emailBody }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      console.error("Resend API error:", errorData);
      throw new Error(`Failed to send email: ${errorData}`);
    }

    const resendData = await resendResponse.json();
    return new Response(JSON.stringify({ success: true, id: resendData.id }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error sending build request email:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to send build request" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
