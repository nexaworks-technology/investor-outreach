import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Client } from "@upstash/qstash";

export const maxDuration = 300; // Allow 5 minutes on Vercel

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("[Sender Dispatcher] Looking for QUEUED emails to send...");
    
    // Fetch up to 500 queued emails
    const queuedEmailsRaw = await db.emailMessage.findMany({
      where: { status: "QUEUED" },
      select: { id: true, workspaceId: true },
      take: 500,
      orderBy: { createdAt: 'asc' }
    });

    console.log(`[Sender Dispatcher] Found ${queuedEmailsRaw.length} queued emails globally.`);

    if (queuedEmailsRaw.length === 0) {
      return NextResponse.json({ success: true, dispatchedCount: 0 });
    }

    // Group by workspace
    const byWorkspace = queuedEmailsRaw.reduce((acc, email) => {
      if (!acc[email.workspaceId]) acc[email.workspaceId] = [];
      acc[email.workspaceId].push(email.id);
      return acc;
    }, {} as Record<string, string[]>);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const approvedEmailIds: string[] = [];

    // Filter by daily sending limits
    for (const [workspaceId, emailIds] of Object.entries(byWorkspace)) {
      const settings = await db.workspaceSettings.findUnique({
        where: { workspaceId },
        select: { dailySendLimit: true }
      });
      
      const dailyLimit = settings?.dailySendLimit ?? 50;

      const sentTodayCount = await db.emailMessage.count({
        where: {
          workspaceId,
          status: 'SENT',
          sentAt: { gte: startOfDay }
        }
      });

      const allowedRemaining = Math.max(0, dailyLimit - sentTodayCount);
      console.log(`[Sender Dispatcher] Workspace ${workspaceId}: limit ${dailyLimit}, sent today ${sentTodayCount}. Allowed remaining: ${allowedRemaining}`);

      const idsToApprove = emailIds.slice(0, allowedRemaining);
      approvedEmailIds.push(...idsToApprove);
    }

    if (approvedEmailIds.length === 0) {
      console.log(`[Sender Dispatcher] All workspaces have hit their daily limits. Skipping dispatch.`);
      return NextResponse.json({ success: true, dispatchedCount: 0, message: "Hit limits" });
    }

    // Mark them as SENDING so they don't get picked up by the next cron run
    await db.emailMessage.updateMany({
      where: { id: { in: approvedEmailIds } },
      data: { status: "SENDING" }
    });

    const host = req.headers.get('host') || process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const workerUrl = `${protocol}://${host}/api/engine/send-single-email`;

    const qstashClient = new Client({
      baseUrl: process.env.QSTASH_URL,
      token: process.env.QSTASH_TOKEN!,
    });

    console.log(`[Sender Dispatcher] Dispatching ${approvedEmailIds.length} emails to ${workerUrl}`);

    let dispatchedCount = 0;

    for (const emailId of approvedEmailIds) {
      try {
        await qstashClient.publishJSON({
          url: workerUrl,
          body: {
            emailMessageId: emailId,
          },
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`
          }
        });
        dispatchedCount++;
      } catch (error) {
        console.error(`[Sender Dispatcher] Failed to publish ${emailId} to QStash:`, error);
        // Revert to QUEUED if QStash fails
        await db.emailMessage.update({
          where: { id: emailId },
          data: { status: "QUEUED" }
        });
      }
    }

    return NextResponse.json({ success: true, dispatchedCount });
  } catch (error: any) {
    console.error("[Sender Dispatcher] error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
