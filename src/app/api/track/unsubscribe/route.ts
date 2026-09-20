import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const emailId = searchParams.get('emailId');
    const investorId = searchParams.get('investorId');

    if (!investorId) {
      return new NextResponse("Invalid request. Missing parameters.", { status: 400 });
    }

    // Mark the investor as opted out
    await db.investor.update({
      where: { id: investorId },
      data: {
        isOptedOut: true,
        pipelineStatus: 'DO_NOT_CONTACT'
      }
    });

    if (emailId) {
      // Optional: Log it in the timeline or somewhere, or mark CampaignInvestor as OPTED_OUT
      const email = await db.emailMessage.findUnique({
        where: { id: emailId },
        select: { campaignInvestorId: true }
      });
      if (email?.campaignInvestorId) {
        await db.campaignInvestor.update({
          where: { id: email.campaignInvestorId },
          data: { status: 'OPTED_OUT' }
        });
      }
    }

    // Return a nice HTML page indicating success
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; color: #111827; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center; max-width: 400px; }
          h1 { margin-top: 0; font-size: 24px; color: #374151; }
          p { color: #6b7280; line-height: 1.5; }
          .icon { font-size: 48px; margin-bottom: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Successfully Unsubscribed</h1>
          <p>You have been removed from this mailing list and will no longer receive emails from us.</p>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" }
    });

  } catch (error) {
    console.error("[Unsubscribe Error]", error);
    return new NextResponse("An error occurred while unsubscribing.", { status: 500 });
  }
}
