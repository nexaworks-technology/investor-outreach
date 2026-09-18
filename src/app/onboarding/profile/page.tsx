import { requireWorkspace } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default async function OnboardingProfilePage() {
  const { workspace } = await requireWorkspace();

  async function updateProfile(formData: FormData) {
    'use server';
    const { workspace } = await requireWorkspace();
    
    const companyName = formData.get('companyName') as string;
    const url = formData.get('url') as string;
    const oneLinePitch = formData.get('oneLinePitch') as string;

    const data = {
      companyName,
      url,
      oneLinePitch,
      // Generic defaults for fields we no longer strictly need but schema requires
      industry: 'Unknown',
      stage: 'Unknown',
      amountRaising: '',
      valuationTarget: '',
      location: 'Global',
      traction: '',
      founderBio: '',
    };

    if (workspace.companyProfile) {
      await db.companyProfile.update({
        where: { id: workspace.companyProfile.id },
        data
      });
    } else {
      await db.companyProfile.create({
        data: {
          ...data,
          workspaceId: workspace.id
        }
      });
    }

    redirect('/onboarding/mailbox');
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Sender Profile</CardTitle>
          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">Step 2 of 3</span>
        </div>
        <CardDescription>
          Tell us about the product or company you are representing. The AI uses this context to write your emails.
        </CardDescription>
      </CardHeader>
      <form action={updateProfile}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company / Product Name</Label>
              <Input 
                id="companyName" 
                name="companyName" 
                defaultValue={workspace.companyProfile?.companyName || ''}
                placeholder="e.g. Acme Corp" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input 
                id="url" 
                name="url" 
                type="url"
                defaultValue={workspace.companyProfile?.url || ''}
                placeholder="https://acme.com" 
                required 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oneLinePitch">One-Line Pitch / Description</Label>
            <Textarea 
              id="oneLinePitch" 
              name="oneLinePitch" 
              rows={3}
              defaultValue={workspace.companyProfile?.oneLinePitch || ''}
              placeholder="We provide an AI-powered CRM that helps sales teams close 3x more deals by automating follow-ups." 
              required 
            />
            <p className="text-xs text-zinc-500 mt-1">
              Keep it concise. The AI will weave this naturally into your emails.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <Button variant="ghost" asChild>
            <Link href="/onboarding">Back</Link>
          </Button>
          <Button type="submit">Continue to Connect Email</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
