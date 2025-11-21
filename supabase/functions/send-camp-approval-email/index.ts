import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

interface ApprovalEmailData {
  campName: string;
  campEmail: string;
  ownerName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { campName, campEmail, ownerName }: ApprovalEmailData = await req.json();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FB923C 0%, #C2410C 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Your Camp Has Been Approved!</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin: 0 0 20px 0;">Hello ${ownerName},</p>

          <p style="font-size: 16px; margin: 0 0 20px 0;">
            Great news! Your basketball camp <strong style="color: #C2410C;">"${campName}"</strong> has been approved and is now live on our platform.
          </p>

          <div style="background: #FEF7EE; padding: 20px; border-radius: 8px; border-left: 4px solid #FB923C; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #C2410C; font-weight: bold;">What's Next?</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #292524;">
              <li style="margin-bottom: 8px;">Your camp is now visible to all users browsing our platform</li>
              <li style="margin-bottom: 8px;">Parents and players can book spots directly</li>
              <li style="margin-bottom: 8px;">You can manage your camp details from your dashboard</li>
            </ul>
          </div>

          <p style="font-size: 16px; margin: 20px 0;">
            Thank you for being part of our basketball community. We're excited to help you reach more players!
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
        subject: `Congratulations! ${campName} is Now Live`,
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