"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2 } from "lucide-react";
import { updateWorkspaceSettings, getWorkspaceSettings } from "@/actions/company";
import { toast } from "sonner";

const PRESETS = {
  VC_INVESTOR: `You are a world-class startup founder sending a highly personalized cold/warm email to a VC/Angel investor.
Your goal is to write a 1-2 sentence personalization hook based on their "Recent Milestone", "Personal Connection", or "Sector Thesis".
Replace the {{ai_hook}} variable in the provided template with your hook, but LEAVE THE REST OF THE TEMPLATE EXACTLY INTACT.
Make it sound natural, concise, and professional (not robotic).
Output MUST be valid JSON containing exactly two keys: 'subject' (string) and 'body' (string).`,
  B2B_SALES: `You are a top-performing B2B Sales Executive reaching out to a potential client.
Your goal is to write a 1-2 sentence personalization hook based on their recent company news, sector, or portfolio.
Replace the {{ai_hook}} variable in the provided template with your hook, but LEAVE THE REST OF THE TEMPLATE EXACTLY INTACT.
Make it sound natural, concise, and professional (not robotic).
Output MUST be valid JSON containing exactly two keys: 'subject' (string) and 'body' (string).`,
  RECRUITING: `You are a startup founder reaching out to a top-tier candidate on LinkedIn/Email.
Your goal is to write a 1-2 sentence personalization hook based on their recent work, GitHub, or background.
Replace the {{ai_hook}} variable in the provided template with your hook, but LEAVE THE REST OF THE TEMPLATE EXACTLY INTACT.
Make it sound natural, concise, and professional (not robotic).
Output MUST be valid JSON containing exactly two keys: 'subject' (string) and 'body' (string).`,
  CUSTOM: ""
};

export function AISettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [outreachType, setOutreachType] = useState("VC_INVESTOR");
  const [customSystemPrompt, setCustomSystemPrompt] = useState(PRESETS.VC_INVESTOR);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getWorkspaceSettings();
      if (settings) {
        if (settings.outreachType) setOutreachType(settings.outreachType);
        if (settings.customSystemPrompt) {
          setCustomSystemPrompt(settings.customSystemPrompt);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (value: string | null) => {
    if (!value) return;
    setOutreachType(value);
    if (value !== "CUSTOM") {
      setCustomSystemPrompt(PRESETS[value as keyof typeof PRESETS]);
    } else {
      setCustomSystemPrompt("");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateWorkspaceSettings({
        outreachType,
        customSystemPrompt
      });
      toast.success("AI Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium">AI Personalization Engine</h3>
        <p className="text-sm text-muted-foreground">Configure the core instructions used by the 120B AI model when it personalizes your outreach.</p>
      </div>

      <div className="space-y-4 max-w-3xl">
        <div className="space-y-2">
          <Label>Campaign / Outreach Type</Label>
          <Select value={outreachType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select campaign type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VC_INVESTOR">VC / Investor Pitch (Default)</SelectItem>
              <SelectItem value="B2B_SALES">B2B Sales Outreach</SelectItem>
              <SelectItem value="RECRUITING">Recruiting / Hiring</SelectItem>
              <SelectItem value="CUSTOM">Custom Campaign</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>System Prompt Override</Label>
          <p className="text-sm text-muted-foreground mb-2">This is the exact instruction fed to the AI. You can freely edit this to change how the AI writes your opening lines.</p>
          <Textarea 
            className="min-h-[200px] font-mono text-sm" 
            value={customSystemPrompt} 
            onChange={(e) => setCustomSystemPrompt(e.target.value)} 
            placeholder="Enter custom instructions for the AI..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save AI Settings
        </Button>
      </div>
    </div>
  );
}
