import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface RejectionEmailData {
  campName: string;
  campEmail: string;
  ownerName: string;
  rejectionReason: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { campName, campEmail, ownerName, rejectionReason }: RejectionEmailData = await req.json();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FB923C 0%, #C2410C 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Camp Submission Update</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin: 0 0 20px 0;">Hello ${ownerName},</p>

          <p style="font-size: 16px; margin: 0 0 20px 0;">
            Thank you for submitting <strong>"${campName}"</strong> to our platform. After careful review, we are unable to approve your camp submission at this time.
          </p>

          <div style="background: #FEF7EE; padding: 20px; border-radius: 8px; border-left: 4px solid #FB923C; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px; color: #C2410C; font-weight: bold;">Reason for Rejection:</p>
            <p style="margin: 0; font-size: 15px; color: #292524; white-space: pre-wrap;">${rejectionReason}</p>
          </div>

          <p style="font-size: 16px; margin: 20px 0;">
            If you have any questions or would like to discuss this decision, please don't hesitate to reach out to us. We're here to help and would be happy to guide you through any necessary changes.
          </p>

          <p style="font-size: 16px; margin: 20px 0;">
            You're welcome to submit an updated version of your camp that addresses the feedback provided above.
          </p>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="font-size: 14px; color: #64748b; margin: 0;">
              Basketball Camps Platform<br>
              Building the future of basketball training
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Basketball Camps <onboarding@resend.dev>',
        to: [campEmail],
        subject: `Update on ${campName} Submission`,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});