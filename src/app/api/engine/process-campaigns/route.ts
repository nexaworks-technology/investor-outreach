import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Client } from "@upstash/qstash";

const qstash = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN, baseUrl: process.env.QSTASH_URL || "https://qstash.upstash.io" }) : null;

export const maxDuration = 300; 

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!qstash) {
      console.error("[Engine] QSTASH_TOKEN is missing. Cannot dispatch emails.");
      return NextResponse.json({ error: 'QSTASH_TOKEN missing' }, { status: 500 });
    }

    const host = req.headers.get('host') || process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const workerUrl = `${protocol}://${host}/api/engine/process-single-email`;

    console.log(`[Engine] Starting campaign dispatcher... Target worker: ${workerUrl}`);
    
    // Find active campaigns
    const campaigns = await db.campaign.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null
      },
      include: {
        campaignInvestors: {
          where: {
            status: { in: ["PENDING", "IN_PROGRESS"] },
            OR: [
              { nextSendAt: null },
              { nextSendAt: { lte: new Date() } }
            ]
          }
        }
      }
    });

    console.log(`[Engine] Found ${campaigns.length} active campaigns to process.`);
    let dispatchedCount = 0;

    for (const campaign of campaigns) {
      const dailyLimit = campaign.dailySendLimit || 20;
      
      // Calculate how many emails have already been queued/sent today for this campaign
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const emailsSentToday = await db.emailMessage.count({
        where: {
          workspaceId: campaign.workspaceId,
          campaignInvestorId: { not: null },
          createdAt: { gte: startOfToday }
        }
      });

      const remainingToSend = Math.max(0, dailyLimit - emailsSentToday);
      if (remainingToSend === 0) continue;

      const toProcess = campaign.campaignInvestors.slice(0, remainingToSend);

      for (const campInv of toProcess) {
        // Dispatch to QStash
        await qstash.publishJSON({
          url: workerUrl,
          body: { campaignInvestorId: campInv.id },
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`
          }
        });
        dispatchedCount++;
      }
    }

    console.log(`[Engine] Successfully dispatched ${dispatchedCount} tasks to QStash.`);
    return NextResponse.json({ success: true, dispatchedCount });
  } catch (error: any) {
    console.error("[Engine] process-campaigns error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
