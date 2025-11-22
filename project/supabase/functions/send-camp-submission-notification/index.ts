import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_EMAIL = 'basketballcamps2025@gmail.com';

interface CampSubmission {
  campName: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  campEmail: string;
  location: string;
  country: string;
  description: string;
  ageMin: number;
  ageMax: number;
  gender: string;
  capacity: number;
  campDates: Array<{
    startDate: string;
    endDate: string;
    price: string;
    days: number;
  }>;
  imageUrls: string[];
  profileImageUrl?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const submission: CampSubmission = await req.json();

    const datesHtml = submission.campDates.map(date => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${date.startDate}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${date.endDate}</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">${date.days} days</td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">€${date.price}</td>
      </tr>
    `).join('');

    const imagesHtml = submission.imageUrls.map((url, index) => {
      const isProfile = submission.profileImageUrl === url;
      return `
        <div style="display: inline-block; margin: 10px;">
          <img src="${url}" alt="Camp image ${index + 1}" style="max-width: 200px; border-radius: 8px; border: ${isProfile ? '3px solid #FB923C' : '1px solid #e2e8f0'};" />
          ${isProfile ? '<p style="text-align: center; font-size: 12px; color: #FB923C; font-weight: bold;">Profile Photo</p>' : ''}
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FB923C 0%, #C2410C 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🏀 New Camp Submission</h1>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <h2 style="color: #C2410C; border-bottom: 2px solid #FB923C; padding-bottom: 10px;">${submission.campName}</h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #475569;">Camp Owner Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 150px;">Name:</td>
                <td style="padding: 8px;">${submission.ownerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Email:</td>
                <td style="padding: 8px;"><a href="mailto:${submission.ownerEmail}">${submission.ownerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Phone:</td>
                <td style="padding: 8px;">${submission.ownerPhone}</td>
              </tr>
            </table>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #475569;">Camp Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; width: 150px;">Location:</td>
                <td style="padding: 8px;">${submission.location}, ${submission.country}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Camp Email:</td>
                <td style="padding: 8px;"><a href="mailto:${submission.campEmail}">${submission.campEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Age Range:</td>
                <td style="padding: 8px;">${submission.ageMin} - ${submission.ageMax} years</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Gender:</td>
                <td style="padding: 8px;">${submission.gender.charAt(0).toUpperCase() + submission.gender.slice(1)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold;">Capacity:</td>
                <td style="padding: 8px;">${submission.capacity} participants</td>
              </tr>
            </table>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #475569;">Description</h3>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${submission.description}</div>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #475569;">Camp Dates & Pricing</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Start Date</th>
                  <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">End Date</th>
                  <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Duration</th>
                  <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${datesHtml}
              </tbody>
            </table>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #475569;">Camp Images</h3>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
              ${imagesHtml}
            </div>
          </div>

          <div style="margin-top: 30px; padding: 20px; background: #FEF7EE; border-left: 4px solid #FB923C; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #C2410C;">⚠️ Action Required</p>
            <p style="margin: 10px 0 0 0; color: #C2410C;">Please review this submission and approve or reject it in the admin panel.</p>
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
        to: [ADMIN_EMAIL],
        subject: `New Camp Submission: ${submission.campName}`,
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