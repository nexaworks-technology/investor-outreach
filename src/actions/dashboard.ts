'use server';

import { db } from '@/lib/db';
import { requireWorkspace } from '@/lib/auth';

export async function getDashboardData() {
  const { workspace } = await requireWorkspace();
  const workspaceId = workspace.id;
  
  // Get counts for each pipeline status
  const pipelineCounts = await db.investor.groupBy({
    by: ['pipelineStatus'],
    where: { workspaceId, deletedAt: null },
    _count: true,
  });
  
  // Get email stats
  const totalSent = await db.emailMessage.count({
    where: { workspaceId, direction: 'OUTBOUND', status: 'SENT' },
  });
  
  const totalReplies = await db.emailMessage.count({
    where: { workspaceId, direction: 'INBOUND' },
  });
  
  const positiveReplies = await db.emailMessage.count({
    where: {
      workspaceId,
      direction: 'INBOUND',
      replyClassification: { in: ['INTERESTED', 'WANTS_DECK', 'WANTS_MEETING'] },
    },
  });
  
  const bounces = await db.emailMessage.count({
    where: { workspaceId, status: 'BOUNCED' },
  });
  
  const totalOpens = await db.emailMessage.count({
    where: { workspaceId, direction: 'OUTBOUND', openCount: { gt: 0 } },
  });

  // Active campaigns
  const activeCampaigns = await db.campaign.count({
    where: { workspaceId, status: 'ACTIVE', deletedAt: null },
  });
  
  // Pending approvals
  const pendingApprovals = await db.emailMessage.count({
    where: { workspaceId, status: 'PENDING_APPROVAL' },
  });
  
  // Investors needing response
  const tasksNeedingAction = await db.task.count({
    where: { workspaceId, status: 'pending' },
  });
  
  // Total investors
  const totalInvestors = await db.investor.count({
    where: { workspaceId, deletedAt: null },
  });
  
  // Recent activity (timeline events)
  const recentActivity = await db.auditLog.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  
  // Upcoming follow-ups
  const upcomingFollowUps = await db.campaignInvestor.findMany({
    where: {
      campaign: { workspaceId },
      status: 'IN_PROGRESS',
      nextSendAt: { not: null },
    },
    include: { investor: true, campaign: true },
    orderBy: { nextSendAt: 'asc' },
    take: 5,
  });

  // Campaign specific metrics
  const activeCampaignList = await db.campaign.findMany({
    where: { workspaceId, deletedAt: null, status: 'ACTIVE' },
    select: { id: true, name: true }
  });

  const campaignMetrics = await Promise.all(activeCampaignList.map(async (c) => {
    const sent = await db.emailMessage.count({
      where: { workspaceId, direction: 'OUTBOUND', status: 'SENT', campaignInvestor: { campaignId: c.id } }
    });
    const opens = await db.emailMessage.count({
      where: { workspaceId, direction: 'OUTBOUND', openCount: { gt: 0 }, campaignInvestor: { campaignId: c.id } }
    });
    const replies = await db.emailMessage.count({
      where: { workspaceId, direction: 'INBOUND', campaignInvestor: { campaignId: c.id } }
    });
    
    return {
      id: c.id,
      name: c.name,
      sent,
      opens,
      replies,
      openRate: sent > 0 ? Math.round((opens / sent) * 100) : 0,
      replyRate: sent > 0 ? Math.round((replies / sent) * 100) : 0,
    };
  }));
  
  return {
    metrics: {
      totalInvestors,
      totalSent,
      totalOpens,
      totalReplies,
      positiveReplies,
      openRate: totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0,
      replyRate: totalSent > 0 ? Math.round((totalReplies / totalSent) * 100) : 0,
      positiveReplyRate: totalSent > 0 ? Math.round((positiveReplies / totalSent) * 100) : 0,
      bounceRate: totalSent > 0 ? Math.round((bounces / totalSent) * 100) : 0,
      activeCampaigns,
      pendingApprovals,
      tasksNeedingAction,
      meetingsBooked: pipelineCounts.find(p => p.pipelineStatus === 'MEETING_BOOKED')?._count ?? 0,
      passes: pipelineCounts.find(p => p.pipelineStatus === 'PASSED')?._count ?? 0,
    },
    pipelineCounts: pipelineCounts.map(p => ({
      status: p.pipelineStatus,
      count: p._count,
    })),
    recentActivity,
    upcomingFollowUps,
    campaignMetrics,
  };
}
