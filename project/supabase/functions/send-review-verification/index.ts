import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { reviewId } = await req.json();

    if (!reviewId) {
      return new Response(
        JSON.stringify({ error: "Missing reviewId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: review, error: fetchError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .maybeSingle();

    if (fetchError || !review) {
      return new Response(
        JSON.stringify({ error: "Review not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const verificationUrl = `${Deno.env.get("VITE_SUPABASE_URL")}/verify-review?token=${review.verification_token}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "noreply@basketballcamps.com",
        to: review.participant_email,
        subject: "Verify Your Basketball Camp Review",
        html: `
          <h2>Verify Your Review</h2>
          <p>Thank you for attending our basketball camp! Please verify your review to publish it.</p>
          <p><a href="${verificationUrl}">Click here to verify your review</a></p>
          <p>Or paste this link in your browser: ${verificationUrl}</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});