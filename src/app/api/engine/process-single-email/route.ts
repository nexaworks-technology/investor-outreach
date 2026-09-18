import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generatePersonalizedEmail } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignInvestorId } = await req.json();

    if (!campaignInvestorId) {
      return NextResponse.json({ error: 'Missing campaignInvestorId' }, { status: 400 });
    }

    console.log(`[Worker] Processing email for CampaignInvestor: ${campaignInvestorId}`);

    const campInv = await db.campaignInvestor.findUnique({
      where: { id: campaignInvestorId },
      include: {
        investor: true,
        campaign: {
          include: {
            mailbox: true,
            workspace: {
              include: {
                settings: true,
                companyProfile: {
                  include: { fundraisingBrief: true }
                }
              }
            },
            sequenceSteps: { orderBy: { order: "asc" } }
          }
        }
      }
    });

    if (!campInv || !campInv.campaign) {
      return NextResponse.json({ error: 'Invalid campaign or mailbox missing' }, { status: 404 });
    }

    const campaign = campInv.campaign;
    const mailbox = campaign.mailbox;
    if (!mailbox) return NextResponse.json({ error: 'Mailbox missing' }, { status: 404 });
    const currentStepOrder = campInv.currentStepOrder;
    const step = campaign.sequenceSteps.find(s => s.order === currentStepOrder);
    
    if (!step) {
      // Campaign finished for this investor
      await db.campaignInvestor.update({
        where: { id: campInv.id },
        data: { status: "COMPLETED" }
      });
      return NextResponse.json({ success: true, message: "No step found, marked completed." });
    }

    const toEmail = campInv.investor.email;
    if (!toEmail) {
      return NextResponse.json({ error: 'Investor missing email' }, { status: 400 });
    }

    let rawSubject = step.subjectTemplate || "";
    let rawBody = step.bodyTemplate || "";
    let templateAttachments: string[] = [];

    if (step.templateId) {
      const template = await db.emailTemplate.findUnique({ where: { id: step.templateId } });
      if (template) {
        rawSubject = template.subject || rawSubject;
        rawBody = template.body || rawBody;
        templateAttachments = template.attachments || [];
      }
    }

    if (!rawSubject && !rawBody) {
      console.warn(`[Worker] Skipping investor ${campInv.id} - No template found for step ${currentStepOrder}`);
      await db.campaignInvestor.update({
        where: { id: campInv.id },
        data: { 
          status: "ERROR", 
          skipReason: "No template provided for this step" 
        }
      });
      return NextResponse.json({ error: 'No template provided' }, { status: 400 });
    }

    // AI Personalization
    const apiKeys = campaign.workspace.settings?.llmApiKeys as string[] || [];
    const provider = campaign.workspace.settings?.llmProvider || "groq";
    const model = campaign.workspace.settings?.llmModel || "llama-3.3-70b-versatile";

    const { subject, body } = await generatePersonalizedEmail(apiKeys, {
      investorName: campInv.investor.name || "",
      investorFirm: campInv.investor.firm || "",
      investorThesis: campInv.investor.sectorThesis || "",
      investorStagePreference: campInv.investor.stagePreference || "",
      investorNotes: campInv.investor.notes || "",
      recentMilestone: campInv.investor.recentMilestone || "",
      personalConnection: campInv.investor.personalConnection || "",
      customIcebreaker: campInv.investor.customIcebreaker || "",
      portfolioCompanies: campInv.investor.portfolioCompanies || "",
      location: campInv.investor.location || "",
      linkedinUrl: campInv.investor.linkedinUrl || "",
      website: campInv.investor.website || "",
      typicalCheckSize: campInv.investor.typicalCheckSize || "",
      warmIntroSource: campInv.investor.warmIntroSource || "",
      relationshipStatus: campInv.investor.relationshipStatus || "",
      partnerTitle: campInv.investor.partnerTitle || "",
      systemPrompt: campaign.workspace.settings?.customSystemPrompt || undefined,
      companyName: campaign.workspace.companyProfile?.companyName || "Our Startup",
      oneLinePitch: campaign.workspace.companyProfile?.oneLinePitch || "",
      fundraisingProblem: campaign.workspace.companyProfile?.fundraisingBrief?.problem || "",
      fundraisingSolution: campaign.workspace.companyProfile?.fundraisingBrief?.solution || "",
      senderName: mailbox.displayName || mailbox.email,
      baseSubjectTemplate: rawSubject,
      baseBodyTemplate: rawBody,
    }, provider, model);

    // Determine if approval required
    const requireApproval = step.requiresApproval || campaign.mode === "REVIEW_BEFORE_SEND";
    
    await db.emailMessage.create({
      data: {
        workspaceId: campaign.workspaceId,
        investorId: campInv.investor.id,
        campaignInvestorId: campInv.id,
        sequenceStepId: step.id,
        mailboxId: campaign.mailboxId,
        direction: "OUTBOUND",
        status: requireApproval ? "PENDING_APPROVAL" : "QUEUED",
        fromEmail: mailbox.email,
        toEmail,
        subject,
        body,
        attachments: templateAttachments,
      }
    });

    // Determine next send date based on the NEXT step's delay
    const nextStep = campaign.sequenceSteps.find(s => s.order === currentStepOrder + 1);
    
    await db.campaignInvestor.update({
      where: { id: campInv.id },
      data: {
        status: "IN_PROGRESS",
        currentStepOrder: currentStepOrder + 1,
        // If there's a next step, add its delay. If no next step, set to null (finished).
        nextSendAt: nextStep 
          ? new Date(Date.now() + (nextStep.delayDays * 24 * 60 * 60 * 1000))
          : null
      }
    });
    
    console.log(`[Worker] Successfully processed email for CampaignInvestor: ${campaignInvestorId}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Worker] process-single-email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
