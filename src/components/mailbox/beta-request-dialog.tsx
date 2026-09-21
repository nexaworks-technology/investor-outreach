"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestBetaAccess } from "@/actions/mailbox";

export function BetaRequestDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await requestBetaAccess({
        email: formData.email,
        mobile: formData.mobile,
      });

      toast.success("Request sent successfully! The team will reach out soon.");
      setIsOpen(false);
      setFormData({ email: "", mobile: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request Beta Access</DialogTitle>
            <DialogDescription>
              Submit your details to get early access to the direct Google Inbox integration. We'll add you to our verified test users list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="beta-email">Google Workspace Email Address</Label>
              <Input 
                id="beta-email" 
                name="email" 
                type="email" 
                placeholder="you@yourdomain.com" 
                required 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="beta-mobile">Mobile Number</Label>
              <Input 
                id="beta-mobile" 
                name="mobile" 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                required 
                value={formData.mobile} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
        <div className="mt-4 pt-4 border-t text-center text-sm">
          <p className="text-muted-foreground mb-2">Already approved as a beta tester?</p>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/90 underline-offset-4 hover:underline"
            onClick={async () => {
              try {
                const { getGoogleAuthUrl } = await import("@/actions/mailbox");
                const url = await getGoogleAuthUrl("onboarding/mailbox");
                window.location.href = url;
              } catch (e) {
                toast.error("Failed to redirect to Google");
              }
            }}
          >
            Connect directly via Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
