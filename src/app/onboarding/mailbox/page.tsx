import { requireWorkspace } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { SmtpConnectForm } from '@/components/mailbox/smtp-connect-form';
import { getGoogleAuthUrl } from '@/actions/mailbox';
import { BetaRequestDialog } from '@/components/mailbox/beta-request-dialog';

export default async function OnboardingMailboxPage() {
  const { workspace } = await requireWorkspace();
  
  // Check if they already have a mailbox connected
  const mailboxes = await db.mailboxConnection.findMany({
    where: { workspaceId: workspace.id, isActive: true }
  });

  async function handleConnectGoogle() {
    'use server';
    const url = await getGoogleAuthUrl('onboarding/mailbox');
    redirect(url);
  }

  async function handleFinish() {
    'use server';
    const { workspace } = await requireWorkspace();
    await db.workspace.update({
      where: { id: workspace.id },
      data: { isOnboarded: true }
    });
    redirect('/dashboard');
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Connect Mailbox</CardTitle>
          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">Step 3 of 3</span>
        </div>
        <CardDescription>
          Connect a sending address so our system can send personalized emails on your behalf.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {mailboxes.length > 0 ? (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{mailboxes[0].email}</p>
                <p className="text-sm text-zinc-500">Connected successfully</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="text-center mb-6">
                <Mail className="mx-auto h-8 w-8 text-zinc-400 mb-3" />
                <h3 className="font-medium text-lg mb-1">Connect your Email Account</h3>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  Securely connect Gmail, Outlook, or Zoho using an App Password. We use direct SMTP/IMAP for maximum deliverability and stability.
                </p>
              </div>
              <SmtpConnectForm />
            </div>
            
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col items-center text-center">
              <p className="text-sm font-medium mb-1">Directly connect your Google Inbox (Beta)</p>
              <p className="text-xs text-zinc-500 mb-3 max-w-sm">
                Our Google OAuth integration is in private beta. Please contact the team to request early access before attempting to sign in.
              </p>
              <BetaRequestDialog>
                <Button type="button" variant="outline" size="sm">
                  Sign in with Google (Request Access)
                </Button>
              </BetaRequestDialog>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
        <Link href="/onboarding/profile" className={buttonVariants({ variant: 'ghost' })}>
          Back
        </Link>
        <form action={handleFinish}>
          <Button type="submit" variant={mailboxes.length > 0 ? "default" : "secondary"}>
            {mailboxes.length > 0 ? "Complete Onboarding" : "Skip for now"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
