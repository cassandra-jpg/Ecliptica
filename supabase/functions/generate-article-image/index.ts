import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestPayload {
  title: string;
  category?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { title, category }: RequestPayload = await req.json();

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) throw new Error("Supabase environment variables are not configured");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const prompt = `Create a stunning, ultra-premium abstract photograph for a high-end business article titled "${title}"${category ? ` about ${category}` : ''}.

Style: Cinematic, architectural, minimalist photography with dramatic lighting and sophisticated composition.
Color palette: Deep navy blue, charcoal black, warm gold metallic accents, subtle ivory highlights.
Visual elements: Abstract geometric forms, clean lines, subtle textures, depth through lighting.
Mood: Exclusive, powerful, intelligent, forward-thinking, premium.
Technical: Professional photography aesthetic, shallow depth of field, dramatic contrast.
Avoid: Text, people, obvious corporate imagery, literal interpretations, busy compositions, bright colors.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "dall-e-3", prompt, n: 1, size: "1792x1024", quality: "standard", style: "natural" }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorData}`);
    }

    const openaiData = await openaiResponse.json();
    if (!openaiData.data?.[0]?.url) throw new Error("Invalid response from OpenAI API");

    const tempImageUrl = openaiData.data[0].url;
    const imageResponse = await fetch(tempImageUrl);
    if (!imageResponse.ok) throw new Error("Failed to download image from OpenAI");

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const fileName = `generated-${Date.now()}-${Math.random().toString(36).substring(2)}.png`;

    const { error: uploadError } = await supabase.storage.from("article-images").upload(fileName, imageBuffer, { contentType: "image/png", cacheControl: "3600", upsert: false });
    if (uploadError) throw new Error(`Failed to upload image: ${uploadError.message}`);

    const { data: publicUrlData } = supabase.storage.from("article-images").getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    return new Response(JSON.stringify({ imageUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate image" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
