'use server';

import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function approveEmail(id: string, editedSubject?: string, editedBody?: string) {
  const { workspace } = await requireWorkspace();
  const workspaceId = workspace.id;

  const email = await db.emailMessage.findUnique({
    where: { id, workspaceId }
  });

  if (!email || email.status !== 'PENDING_APPROVAL') {
    throw new Error('Email not found or not pending approval');
  }

  await db.emailMessage.update({
    where: { id },
    data: {
      status: 'QUEUED',
      subject: editedSubject ?? email.subject,
      body: editedBody ?? email.body
    }
  });

  revalidatePath('/approvals');
  return { success: true };
}

export async function rejectEmail(id: string) {
  const { workspace } = await requireWorkspace();
  const workspaceId = workspace.id;

  const email = await db.emailMessage.findUnique({
    where: { id, workspaceId }
  });

  if (!email || email.status !== 'PENDING_APPROVAL') {
    throw new Error('Email not found or not pending approval');
  }

  await db.emailMessage.update({
    where: { id },
    data: {
      status: 'FAILED',
      failureReason: 'Rejected by user'
    }
  });
  
  if (email.campaignInvestorId) {
    await db.campaignInvestor.update({
      where: { id: email.campaignInvestorId },
      data: { status: 'SKIPPED', skipReason: 'Rejected in approval queue' }
    });
  }

  revalidatePath('/approvals');
  return { success: true };
}
