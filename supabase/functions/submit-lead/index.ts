import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NOTIFICATION_EMAILS = ["sales@ecliptica-ops.com", "info@ecliptica-ops.com"];

interface LeadSubmission {
  formType: string;
  sourcePage: string;
  sourceSection?: string;
  name?: string;
  email?: string;
  businessName?: string;
  role?: string;
  companySize?: string;
  revenueRange?: string;
  industry?: string;
  primaryGoal?: string;
  timeline?: string;
  linkedinUrl?: string;
  schedulingUrl?: string;
  message?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
  honeypot?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function sanitizeString(str: string | undefined): string | null {
  if (!str) return null;
  return str.trim().slice(0, 5000);
}

function generateEmailSubject(formType: string, businessName?: string): string {
  const name = businessName || "Unknown";
  switch (formType) {
    case "demo_request":
      return `New Live Demo Request — ${name}`;
    case "build_request":
      return `New Build Request — ${name}`;
    case "contact":
      return `New Contact Form Submission — ${name}`;
    case "newsletter":
      return `New Newsletter Signup`;
    default:
      return `New Form Submission — ${name}`;
  }
}

function generateEmailHtml(data: LeadSubmission): string {
  const fields = [
    { label: "Name", value: data.name },
    { label: "Email", value: data.email },
    { label: "Business Name", value: data.businessName },
    { label: "Role / Title", value: data.role },
    { label: "Company Size", value: data.companySize },
    { label: "Revenue Range", value: data.revenueRange },
    { label: "Industry", value: data.industry },
    { label: "Goal", value: data.primaryGoal },
    { label: "Timeline", value: data.timeline },
    { label: "Phone", value: data.phone },
    { label: "LinkedIn", value: data.linkedinUrl },
    { label: "Scheduling Link", value: data.schedulingUrl },
    { label: "Message", value: data.message },
    { label: "Source Page", value: data.sourcePage },
    { label: "Source Section", value: data.sourceSection },
    { label: "Submitted At", value: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }) },
  ];

  const rows = fields
    .filter((f) => f.value)
    .map(
      (f) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #112840; width: 150px; vertical-align: top;">${f.label}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; color: #333;">${f.value}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f5f0;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #112840; padding: 24px; text-align: center;">
          <h1 style="margin: 0; color: #C9A84C; font-size: 24px; font-weight: 400; letter-spacing: 2px;">ECLIPTICA</h1>
        </div>
        <div style="background-color: #ffffff; padding: 32px;">
          <h2 style="margin: 0 0 24px 0; color: #112840; font-size: 20px; font-weight: 400; border-bottom: 2px solid #C9A84C; padding-bottom: 12px;">
            ${data.formType === "demo_request" ? "New Live Demo Request" : "New Form Submission"}
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${rows}
          </table>
        </div>
        <div style="padding: 16px; text-align: center; color: #888; font-size: 12px;">
          This is an automated notification from Ecliptica.
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendNotificationEmail(data: LeadSubmission): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Ecliptica <notifications@updates.ecliptica-ops.com>",
        to: NOTIFICATION_EMAILS,
        reply_to: data.email || undefined,
        subject: generateEmailSubject(data.formType, data.businessName),
        html: generateEmailHtml(data),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to send notification email:", error);
    return false;
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
    const data: LeadSubmission = await req.json();

    if (data.honeypot) {
      console.log("Honeypot triggered, ignoring submission");
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!data.formType || !data.sourcePage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: formType and sourcePage" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (data.email && !validateEmail(data.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (data.linkedinUrl && !validateUrl(data.linkedinUrl)) {
      return new Response(
        JSON.stringify({ error: "Invalid LinkedIn URL format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (data.schedulingUrl && !validateUrl(data.schedulingUrl)) {
      return new Response(
        JSON.stringify({ error: "Invalid scheduling URL format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: dbError } = await supabase.from("lead_submissions").insert({
      form_type: sanitizeString(data.formType),
      source_page: sanitizeString(data.sourcePage),
      source_section: sanitizeString(data.sourceSection),
      name: sanitizeString(data.name),
      email: sanitizeString(data.email),
      business_name: sanitizeString(data.businessName),
      role: sanitizeString(data.role),
      company_size: sanitizeString(data.companySize),
      revenue_range: sanitizeString(data.revenueRange),
      industry: sanitizeString(data.industry),
      primary_goal: sanitizeString(data.primaryGoal),
      timeline: sanitizeString(data.timeline),
      linkedin_url: sanitizeString(data.linkedinUrl),
      scheduling_url: sanitizeString(data.schedulingUrl),
      message: sanitizeString(data.message),
      phone: sanitizeString(data.phone),
      metadata: data.metadata || null,
      status: "new",
    });

    if (dbError) {
      console.error("Database insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save submission" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const emailSent = await sendNotificationEmail(data);
    if (!emailSent) {
      console.warn("Email notification failed but submission was saved");
    }

    return new Response(
      JSON.stringify({ success: true, emailSent }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing submission:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
