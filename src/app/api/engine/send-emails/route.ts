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
    
    // We can dispatch more at once now since we're just hitting QStash
    const queuedEmails = await db.emailMessage.findMany({
      where: { status: "QUEUED" },
      select: { id: true },
      take: 200 
    });

    console.log(`[Sender Dispatcher] Found ${queuedEmails.length} queued emails.`);

    if (queuedEmails.length === 0) {
      return NextResponse.json({ success: true, dispatchedCount: 0 });
    }

    // Mark them as SENDING so they don't get picked up by the next cron run
    await db.emailMessage.updateMany({
      where: { id: { in: queuedEmails.map(e => e.id) } },
      data: { status: "SENDING" }
    });

    const host = req.headers.get('host') || process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '').replace('http://', '');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const workerUrl = `${protocol}://${host}/api/engine/send-single-email`;

    const qstashClient = new Client({
      baseUrl: process.env.QSTASH_URL,
      token: process.env.QSTASH_TOKEN!,
    });

    console.log(`[Sender Dispatcher] Dispatching to ${workerUrl}`);

    let dispatchedCount = 0;

    for (const email of queuedEmails) {
      try {
        await qstashClient.publishJSON({
          url: workerUrl,
          body: {
            emailMessageId: email.id,
          },
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`
          }
        });
        dispatchedCount++;
      } catch (error) {
        console.error(`[Sender Dispatcher] Failed to publish ${email.id} to QStash:`, error);
        // Revert to QUEUED if QStash fails
        await db.emailMessage.update({
          where: { id: email.id },
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
