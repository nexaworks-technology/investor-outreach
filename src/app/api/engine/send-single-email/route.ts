import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gmailProvider } from '@/lib/email/gmail';
import { smtpProvider } from '@/lib/email/smtp';
import { decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailMessageId } = await req.json();

    if (!emailMessageId) {
      return NextResponse.json({ error: 'Missing emailMessageId' }, { status: 400 });
    }

    console.log(`[Sender Worker] Processing email: ${emailMessageId}`);

    const email = await db.emailMessage.findUnique({
      where: { id: emailMessageId },
      include: {
        mailbox: true
      }
    });

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    if (!email.mailbox) {
      await db.emailMessage.update({
        where: { id: email.id },
        data: { status: "FAILED", failureReason: "No mailbox attached" }
      });
      return NextResponse.json({ error: 'No mailbox attached' }, { status: 400 });
    }

    // Only process SENDING emails to avoid duplicates if queued manually
    if (email.status !== 'SENDING' && email.status !== 'QUEUED') {
        console.warn(`[Sender Worker] Email ${email.id} has status ${email.status}, skipping.`);
        return NextResponse.json({ success: true, message: 'Skipped non-sending email' });
    }

    try {
      const credentials = {
        accessToken: email.mailbox.accessToken ? decrypt(email.mailbox.accessToken) : undefined,
        refreshToken: email.mailbox.refreshToken ? decrypt(email.mailbox.refreshToken) : undefined,
        smtpHost: email.mailbox.smtpHost ?? undefined,
        smtpPort: email.mailbox.smtpPort ?? undefined,
        smtpUsername: email.mailbox.smtpUsername ?? undefined,
        smtpPassword: email.mailbox.smtpPassword ? decrypt(email.mailbox.smtpPassword) : undefined,
      };
      
      const provider = email.mailbox.provider === 'smtp' ? smtpProvider : gmailProvider;
      const result = await provider.sendEmail(credentials, {
        to: email.toEmail,
        subject: email.subject || "No Subject",
        body: email.body || "",
        inReplyTo: email.inReplyToHeader ?? undefined,
        trackingId: email.id,
        attachments: email.attachments,
      });

      await db.emailMessage.update({
        where: { id: email.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          gmailMessageId: result.messageId,
          gmailThreadId: result.threadId,
          messageIdHeader: result.messageIdHeader
        }
      });

      console.log(`[Sender Worker] Successfully sent email: ${email.id}`);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error(`[Sender Worker] Failed to send email ${email.id}:`, error);
      await db.emailMessage.update({
        where: { id: email.id },
        data: {
          status: "FAILED",
          failureReason: error.message || "Unknown error",
          retryCount: email.retryCount + 1
        }
      });
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[Sender Worker] send-single-email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
