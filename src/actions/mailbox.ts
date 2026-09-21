"use server";

import { auth } from '@/lib/auth';
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { encrypt, decrypt } from "@/lib/encryption";
import { gmailProvider } from "@/lib/email/gmail";
import { headers } from "next/headers";

async function getWorkspaceId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const workspace = await db.workspace.findUnique({
    where: { clerkUserId: userId },
  });
  if (!workspace) throw new Error("Workspace not found");
  return workspace.id;
}

export async function getMailboxes() {
  const workspaceId = await getWorkspaceId();

  const mailboxes = await db.mailboxConnection.findMany({
    where: { workspaceId },
    select: {
      id: true,
      provider: true,
      email: true,
      displayName: true,
      isActive: true,
      lastSyncAt: true,
      syncError: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return mailboxes;
}

export async function getGoogleAuthUrl(state: string = "settings") {
  const origin = (await headers()).get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${origin}/api/auth/callback/google`;
  return gmailProvider.getAuthUrl(redirectUri, state);
}

export async function disconnectMailbox(id: string) {
  const workspaceId = await getWorkspaceId();

  const mailbox = await db.mailboxConnection.findFirst({
    where: { id, workspaceId },
  });
  if (!mailbox) throw new Error("Mailbox not found");

  // Check if any active campaigns use this mailbox
  const activeCampaigns = await db.campaign.count({
    where: {
      mailboxId: id,
      status: "ACTIVE",
      deletedAt: null,
    },
  });

  if (activeCampaigns > 0) {
    throw new Error(
      `Cannot disconnect mailbox with ${activeCampaigns} active campaign(s). Pause them first.`,
    );
  }

  await db.mailboxConnection.delete({ where: { id } });

  await db.auditLog.create({
    data: {
      workspaceId,
      action: "mailbox_disconnected",
      entityType: "mailbox",
      entityId: id,
      details: { email: mailbox.email, provider: mailbox.provider },
      performedBy: "user",
    },
  });

  revalidatePath("/settings/mailbox");
  revalidatePath("/onboarding");
  return { success: true };
}

export async function saveMailboxConnection(data: {
  provider: string;
  email: string;
  displayName?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
  scopes: string[];
}) {
  const workspaceId = await getWorkspaceId();

  const mailbox = await db.mailboxConnection.upsert({
    where: {
      workspaceId_email: {
        workspaceId,
        email: data.email,
      },
    },
    update: {
      provider: data.provider,
      displayName: data.displayName,
      accessToken: encrypt(data.accessToken),
      refreshToken: data.refreshToken ? encrypt(data.refreshToken) : null,
      tokenExpiresAt: data.tokenExpiresAt,
      scopes: data.scopes,
      isActive: true,
      syncError: null,
    },
    create: {
      workspaceId,
      provider: data.provider,
      email: data.email,
      displayName: data.displayName,
      accessToken: encrypt(data.accessToken),
      refreshToken: encrypt(data.refreshToken),
      tokenExpiresAt: data.tokenExpiresAt,
      scopes: data.scopes,
      isActive: true,
    },
  });

  await db.auditLog.create({
    data: {
      workspaceId,
      action: "mailbox_connected",
      entityType: "mailbox",
      entityId: mailbox.id,
      details: { email: data.email, provider: data.provider },
      performedBy: "user",
    },
  });

  revalidatePath("/settings/mailbox");
  revalidatePath("/onboarding");
  return mailbox;
}

export async function saveSmtpConnection(data: {
  email: string;
  displayName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  imapHost?: string;
  imapPort?: number;
  imapUsername?: string;
  imapPassword?: string;
}) {
  const workspaceId = await getWorkspaceId();

  // Validate the credentials using the smtp provider before saving
  const { smtpProvider } = await import("@/lib/email/smtp");
  // Google app passwords are 16 chars but often copied with spaces. Strip all spaces for Gmail.
  const isGmail = data.smtpHost.toLowerCase().includes("gmail.com") || data.smtpHost.toLowerCase().includes("google.com");
  const cleanPassword = isGmail ? data.smtpPassword.replace(/\s+/g, "") : data.smtpPassword.trim();

  const validation = await smtpProvider.validateConnection({
    smtpHost: data.smtpHost,
    smtpPort: data.smtpPort,
    smtpUsername: data.smtpUsername,
    smtpPassword: cleanPassword,
  });

  if (!validation.isValid) {
    throw new Error(validation.error || "Failed to connect to SMTP server");
  }

  const cleanImapPassword = data.imapPassword ? (isGmail ? data.imapPassword.replace(/\s+/g, "") : data.imapPassword.trim()) : undefined;

  const mailbox = await db.mailboxConnection.upsert({
    where: {
      workspaceId_email: { workspaceId, email: data.email },
    },
    create: {
      workspaceId,
      provider: 'smtp',
      email: data.email,
      displayName: data.displayName,
      accessToken: '',
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUsername: data.smtpUsername,
      smtpPassword: encrypt(cleanPassword),
      imapHost: data.imapHost,
      imapPort: data.imapPort,
      imapUsername: data.imapUsername,
      imapPassword: cleanImapPassword ? encrypt(cleanImapPassword) : undefined,
      isActive: true,
    },
    update: {
      provider: 'smtp',
      displayName: data.displayName,
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
      smtpUsername: data.smtpUsername,
      smtpPassword: encrypt(cleanPassword),
      imapHost: data.imapHost,
      imapPort: data.imapPort,
      imapUsername: data.imapUsername,
      imapPassword: cleanImapPassword ? encrypt(cleanImapPassword) : undefined,
      isActive: true,
      syncError: null,
    },
  });

  revalidatePath("/settings/mailboxes");
  revalidatePath("/onboarding");
  return mailbox;
}

export async function requestBetaAccess(data: { email: string; mobile: string }) {
  const workspaceId = await getWorkspaceId().catch(() => undefined);
  
  const request = await db.betaAccessRequest.create({
    data: {
      email: data.email,
      mobile: data.mobile,
      workspaceId,
    }
  });

  // Try to send email to founders using SMTP if configured
  if (process.env.ADMIN_EMAIL_SMTP_URL) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport(process.env.ADMIN_EMAIL_SMTP_URL);
      await transporter.sendMail({
        from: '"Doodle System" <system@nexaworks.tech>',
        to: 'sahilghewari00@gmail.com',
        subject: `New Beta Access Request: ${data.email}`,
        text: `A new user has requested beta access to the Google Workspace integration.\n\nEmail: ${data.email}\nMobile: ${data.mobile}\nWorkspace ID: ${workspaceId || 'Unknown'}\n\nPlease add them as a Test User in Google Cloud Console.`
      });
    } catch (error) {
      console.error("Failed to send beta request email:", error);
      // Fail silently for the user, request is still saved in DB
    }
  }

  return request;
}
