"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getWorkspaceSettings, updateSendingLimits } from "@/actions/settings";

export function SendingSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    dailySendLimit: 50,
    sendOnWeekends: false,
    sendWindowStart: "09:00",
    sendWindowEnd: "17:00",
  });

  useEffect(() => {
    getWorkspaceSettings().then((res) => {
      if (res) {
        setSettings({
          dailySendLimit: res.dailySendLimit,
          sendOnWeekends: res.sendOnWeekends,
          sendWindowStart: res.sendWindowStart,
          sendWindowEnd: res.sendWindowEnd,
        });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSendingLimits(settings);
      toast.success("Sending limits updated!");
    } catch (err) {
      toast.error("Failed to update sending limits");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-10 text-center text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-medium">Sending Limits</h3>
        <p className="text-sm text-muted-foreground">Configure how many emails you send per day to protect your domain reputation.</p>
      </div>
      
      <div className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label>Max Emails per Day (per mailbox)</Label>
          <Input type="number" value={settings.dailySendLimit} onChange={(e) => setSettings({...settings, dailySendLimit: parseInt(e.target.value) || 0})} />
        </div>
      </div>

      <div className="border-b pb-4 pt-6">
        <h3 className="text-lg font-medium">Sending Schedule</h3>
        <p className="text-sm text-muted-foreground">When should emails be sent out.</p>
      </div>

      <div className="space-y-6 max-w-md">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Send on Weekends</Label>
            <p className="text-sm text-muted-foreground">Allow campaigns to run on Saturday and Sunday.</p>
          </div>
          <Switch checked={settings.sendOnWeekends} onCheckedChange={(c) => setSettings({...settings, sendOnWeekends: c})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Time</Label>
            <Input type="time" value={settings.sendWindowStart} onChange={(e) => setSettings({...settings, sendWindowStart: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label>End Time</Label>
            <Input type="time" value={settings.sendWindowEnd} onChange={(e) => setSettings({...settings, sendWindowEnd: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Settings
        </Button>
      </div>
    </div>
  );
}
