"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Loader2, Plus } from "lucide-react";
import { saveSmtpConnection } from "@/actions/mailbox";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SmtpConnectDialog({ onConnect }: { onConnect: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleProviderChange = (val: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imapHost = formData.smtpHost.replace('smtp', 'imap');
      let imapPort = 993; // standard IMAPS port

      if (provider === 'outlook') {
        imapHost = 'outlook.office365.com';
      }
      
      await saveSmtpConnection({
        email: formData.email,
        displayName: formData.displayName,
        smtpHost: formData.smtpHost,
        smtpPort: parseInt(formData.smtpPort),
        smtpUsername: formData.smtpUsername || formData.email,
        smtpPassword: formData.smtpPassword,
        imapHost,
        imapPort,
        imapUsername: formData.smtpUsername || formData.email,
        imapPassword: formData.smtpPassword
      });

      toast.success("Mailbox connected successfully!");
      setIsOpen(false);
      onConnect();
    } catch (error: any) {
      toast.error(error.message || "Failed to connect mailbox");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button className="gap-2" onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4" /> Connect Mailbox
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Connect Mailbox (App Password)</DialogTitle>
              <DialogDescription>
                We use standard SMTP/IMAP to connect securely without Google OAuth restrictions. 
                <br/><strong className="text-foreground">You must use an App Password, not your main login password.</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                <Input id="email" name="email" type="email" placeholder="you@yourdomain.com" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" name="displayName" placeholder="John Doe" required value={formData.displayName} onChange={handleChange} />
              </div>
              
              {provider === 'other' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" name="smtpHost" placeholder="smtp.mail.com" required value={formData.smtpHost} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" name="smtpPort" type="number" placeholder="465" required value={formData.smtpPort} onChange={handleChange} />
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
                <Input id="smtpPassword" name="smtpPassword" type="password" placeholder="16-character code" required value={formData.smtpPassword} onChange={handleChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
