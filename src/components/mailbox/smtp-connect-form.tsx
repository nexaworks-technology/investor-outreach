"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { saveSmtpConnection } from '@/actions/mailbox';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SmtpConnectForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState("gmail");

  const [formData, setFormData] = useState({
    email: "",
    displayName: "",
    smtpHost: "smtp.gmail.com",
    smtpPort: "465",
    smtpUsername: "",
    smtpPassword: "",
  });

  const handleProviderChange = (val: string | null) => {
    if (!val) return;
    setProvider(val);
    if (val === "gmail") {
      setFormData(p => ({ ...p, smtpHost: "smtp.gmail.com", smtpPort: "465" }));
    } else if (val === "zoho") {
      setFormData(p => ({ ...p, smtpHost: "smtp.zoho.in", smtpPort: "465" }));
    } else if (val === "outlook") {
      setFormData(p => ({ ...p, smtpHost: "smtp.office365.com", smtpPort: "587" }));
    } else {
      setFormData(p => ({ ...p, smtpHost: "", smtpPort: "465" }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-fill smtp username if email is typed and username is empty
    if (name === 'email' && !formData.smtpUsername) {
      setFormData((prev) => ({ ...prev, smtpUsername: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imapHost = formData.smtpHost.replace('smtp', 'imap');
      let imapPort = 993; // standard IMAPS port

      if (provider === 'outlook') {
        imapHost = 'outlook.office365.com';
      }
      
      const res = await saveSmtpConnection({
        email: formData.email,
        displayName: formData.displayName || formData.email.split('@')[0],
        smtpHost: formData.smtpHost,
        smtpPort: parseInt(formData.smtpPort),
        smtpUsername: formData.smtpUsername || formData.email,
        smtpPassword: formData.smtpPassword,
        imapHost,
        imapPort,
        imapUsername: formData.smtpUsername || formData.email,
        imapPassword: formData.smtpPassword
      });

      if (res && 'error' in res) {
        toast.error(res.error);
        setIsLoading(false);
        return;
      }

      toast.success('Mailbox connected successfully!');
      router.refresh(); // Refresh the page to show connected state
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect mailbox. Check your App Password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left w-full max-w-md mx-auto">
      <div className="grid gap-2">
        <Label>Provider</Label>
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gmail">Google Workspace / Gmail</SelectItem>
            <SelectItem value="outlook">Microsoft Outlook / 365</SelectItem>
            <SelectItem value="zoho">Zoho Mail</SelectItem>
            <SelectItem value="other">Other / Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="you@yourdomain.com" required value={formData.email} onChange={handleChange} disabled={isLoading} />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input id="displayName" name="displayName" type="text" placeholder="John Doe" required value={formData.displayName} onChange={handleChange} disabled={isLoading} />
      </div>
      
      {provider === 'other' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="smtpHost">SMTP Host</Label>
            <Input id="smtpHost" name="smtpHost" placeholder="smtp.mail.com" required value={formData.smtpHost} onChange={handleChange} disabled={isLoading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="smtpPort">SMTP Port</Label>
            <Input id="smtpPort" name="smtpPort" type="number" placeholder="465" required value={formData.smtpPort} onChange={handleChange} disabled={isLoading} />
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="smtpPassword">App Password</Label>
          {provider === 'gmail' && (
            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">
              How to get this?
            </a>
          )}
        </div>
        <Input id="smtpPassword" name="smtpPassword" type="password" placeholder="16-character code" required value={formData.smtpPassword} onChange={handleChange} disabled={isLoading} />
        <p className="text-[10px] text-muted-foreground mt-1">
          Do not use your regular password. You must generate an App Password.
        </p>
      </div>

      <Button type="submit" className="w-full mt-4" disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Connection...</>
        ) : (
          "Connect Mailbox"
        )}
      </Button>
    </form>
  );
}
