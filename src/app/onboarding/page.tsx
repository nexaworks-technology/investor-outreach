import { requireWorkspace } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default async function OnboardingWorkspacePage() {
  const { workspace } = await requireWorkspace();

  async function updateWorkspace(formData: FormData) {
    'use server';
    const { workspace } = await requireWorkspace();
    
    const name = formData.get('name') as string;
    const outreachType = formData.get('outreachType') as string;

    await db.workspace.update({
      where: { id: workspace.id },
      data: { name }
    });

    await db.workspaceSettings.update({
      where: { workspaceId: workspace.id },
      data: { outreachType }
    });

    redirect('/onboarding/profile');
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle>Workspace Details</CardTitle>
          <span className="text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">Step 1 of 3</span>
        </div>
        <CardDescription>
          Give your workspace a name and tell us how you plan to use it.
        </CardDescription>
      </CardHeader>
      <form action={updateWorkspace}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={workspace.name !== 'My Workspace' ? workspace.name : ''}
              placeholder="e.g. Acme Corp Sales" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outreachType">Primary Use Case</Label>
            <Select name="outreachType" defaultValue={workspace.settings?.outreachType || 'b2b_sales'} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a use case" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="b2b_sales">B2B Sales / Lead Gen</SelectItem>
                <SelectItem value="investor_pitch">Investor Fundraising</SelectItem>
                <SelectItem value="recruiting">Recruiting / Talent Sourcing</SelectItem>
                <SelectItem value="pr_media">PR & Media Outreach</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500 mt-1">
              This helps us automatically tune the AI personalization engine for your specific needs.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <Button type="submit">Continue to Profile</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
