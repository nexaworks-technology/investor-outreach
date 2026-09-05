import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { gmailProvider } from '@/lib/email/gmail';
import { smtpProvider } from '@/lib/email/smtp';
import { ConnectionCredentials } from '@/lib/email/provider';
import { decrypt } from '@/lib/encryption';

export const maxDuration = 300; // 5 minutes

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("[Engine] Starting email synchronization...");

    // Find all active mailboxes
    const mailboxes = await db.mailboxConnection.findMany({
      where: {
        isActive: true,
      },
      include: {
        workspace: true,
      }
    });

    console.log(`[Engine] Found ${mailboxes.length} active mailboxes to sync.`);
    
    for (const mailbox of mailboxes) {
      console.log(`[Engine] Syncing mailbox: ${mailbox.email} (${mailbox.provider})`);
      try {
        let credentials: ConnectionCredentials = {};
        let providerInstance = null;

        if (mailbox.provider === 'google' || mailbox.provider === 'gmail') {
          providerInstance = gmailProvider;
          credentials = {
            accessToken: mailbox.accessToken ? decrypt(mailbox.accessToken) : undefined,
            refreshToken: mailbox.refreshToken ? decrypt(mailbox.refreshToken) : undefined,
          };
        } else if (mailbox.provider === 'smtp') {
          providerInstance = smtpProvider;
          credentials = {
            smtpHost: mailbox.smtpHost || undefined,
            smtpPort: mailbox.smtpPort || undefined,
            smtpUsername: mailbox.smtpUsername || undefined,
            smtpPassword: mailbox.smtpPassword ? decrypt(mailbox.smtpPassword) : undefined,
            imapHost: mailbox.imapHost || undefined,
            imapPort: mailbox.imapPort || undefined,
            imapUsername: mailbox.imapUsername || undefined,
            imapPassword: mailbox.imapPassword ? decrypt(mailbox.imapPassword) : undefined,
          };
        } else {
          continue;
        }

        const historyId = mailbox.historyId || '';
        const { messages, newHistoryId } = await providerInstance.getNewMessages(credentials, historyId);
        
        console.log(`[Engine] Mailbox ${mailbox.email}: Found ${messages.length} new messages.`);

        let processedReplies = 0;

        for (const msg of messages) {
          // Check if this is a reply by looking for In-Reply-To header
          if (!msg.inReplyTo) continue;

          // Find the original outbound message this is replying to
          const originalMessage = await db.emailMessage.findFirst({
            where: {
              OR: [
                { messageIdHeader: msg.inReplyTo },
                { messageIdHeader: `<${msg.inReplyTo}>` },
                { gmailThreadId: msg.threadId }
              ],
              direction: 'OUTBOUND'
            },
            include: {
              campaignInvestor: true
            }
          });

          if (originalMessage) {
            console.log(`[Engine] Found reply from ${msg.from} for investor ${originalMessage.investorId}`);
            
            const existingMsg = await db.emailMessage.findUnique({
              where: { gmailMessageId: msg.messageId }
            });

            if (!existingMsg) {
              // Save the inbound message
              await db.emailMessage.create({
                data: {
                  workspaceId: mailbox.workspaceId,
                  investorId: originalMessage.investorId,
                  campaignInvestorId: originalMessage.campaignInvestorId,
                  mailboxId: mailbox.id,
                  direction: 'INBOUND',
                  status: 'SENT',
                  fromEmail: msg.from,
                  toEmail: msg.to,
                  subject: msg.subject,
                  body: msg.bodyHtml || msg.body || '',
                  messageIdHeader: msg.messageIdHeader,
                  inReplyToHeader: msg.inReplyTo,
                  gmailMessageId: msg.messageId,
                  gmailThreadId: msg.threadId,
                  sentAt: msg.date
                }
              });
            }

            // Update the campaign investor status to REPLIED to halt follow-ups if this was part of a campaign
            if (originalMessage.campaignInvestor && originalMessage.campaignInvestor.status !== 'REPLIED') {
              await db.campaignInvestor.update({
                where: { id: originalMessage.campaignInvestorId! },
                data: {
                  status: 'REPLIED'
                }
              });
              console.log(`[Engine] Marked investor ${originalMessage.investorId} as REPLIED. Follow-ups halted.`);
            }

            processedReplies++;
          }
        }

        // Update the mailbox sync state
        await db.mailboxConnection.update({
          where: { id: mailbox.id },
          data: {
            historyId: newHistoryId,
            lastSyncAt: new Date(),
            syncError: null
          }
        });

        console.log(`[Engine] Mailbox ${mailbox.email} synced successfully. Processed ${processedReplies} replies.`);

      } catch (error: any) {
        console.error(`[Engine] Error syncing mailbox ${mailbox.email}:`, error);
        await db.mailboxConnection.update({
          where: { id: mailbox.id },
          data: {
            syncError: error.message || "Unknown error during sync",
            lastSyncAt: new Date()
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: "Email sync completed" });

  } catch (error: any) {
    console.error("[Engine] Sync job failed:", error);
    return NextResponse.json({ error: error.message || "Failed to sync emails" }, { status: 500 });
  }
}
