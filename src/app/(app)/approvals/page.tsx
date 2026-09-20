import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';
import { ApprovalsClient } from './approvals-client';

export const metadata = {
  title: 'Approvals - NexaWorks',
};

export default async function ApprovalsPage() {
  const { workspace } = await requireWorkspace();
  const workspaceId = workspace.id;

  const pendingEmails = await db.emailMessage.findMany({
    where: {
      workspaceId,
      status: 'PENDING_APPROVAL',
      direction: 'OUTBOUND'
    },
    include: {
      investor: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Approval Queue</h2>
      </div>
      <ApprovalsClient initialEmails={pendingEmails} />
    </div>
  );
}
