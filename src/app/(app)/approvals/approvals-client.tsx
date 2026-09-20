'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { approveEmail, rejectEmail } from '@/actions/approvals';
import { Check, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalClientProps {
  initialEmails: any[];
}

export function ApprovalsClient({ initialEmails }: ApprovalClientProps) {
  const [emails, setEmails] = useState(initialEmails);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const selectedEmail = emails.find(e => e.id === selectedId) || null;

  const [subject, setSubject] = useState(selectedEmail?.subject || '');
  const [body, setBody] = useState(selectedEmail?.body || '');

  // Reset editor when selection changes
  const handleSelect = (id: string) => {
    const email = emails.find(e => e.id === id);
    setSelectedId(id);
    setSubject(email?.subject || '');
    setBody(email?.body || '');
  };

  const handleApprove = async () => {
    if (!selectedId) return;
    try {
      await approveEmail(selectedId, subject, body);
      toast.success('Email approved and queued for sending!');
      setEmails(emails.filter(e => e.id !== selectedId));
      setSelectedId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    try {
      await rejectEmail(selectedId);
      toast.success('Email rejected');
      setEmails(emails.filter(e => e.id !== selectedId));
      setSelectedId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject');
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Left Sidebar - List */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r border-border bg-muted/20 flex flex-col">
        <div className="p-4 border-b border-border bg-card">
          <h2 className="font-semibold">Approval Queue ({emails.length})</h2>
        </div>
        <ScrollArea className="flex-1">
          {emails.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Mail className="w-8 h-8 opacity-20" />
              <p>No pending emails to review!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {emails.map(email => (
                <button
                  key={email.id}
                  onClick={() => handleSelect(email.id)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-accent/50 transition-colors flex gap-3",
                    selectedId === email.id && "bg-accent"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {email.investor?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <div className="font-medium text-sm truncate">
                      {email.investor?.name || email.toEmail}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mb-1">
                      {email.investor?.firm || email.toEmail}
                    </div>
                    <div className="text-xs font-medium text-foreground truncate">
                      {email.subject}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Generated {formatDistanceToNow(new Date(email.createdAt))} ago
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Editor */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedEmail ? (
          <>
            <div className="p-4 border-b border-border bg-card flex justify-between items-center">
              <div>
                <h3 className="font-medium">{selectedEmail.investor?.name || selectedEmail.toEmail}</h3>
                <p className="text-sm text-muted-foreground">To: {selectedEmail.toEmail}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReject} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <X className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button size="sm" onClick={handleApprove}>
                  <Check className="w-4 h-4 mr-1" /> Approve & Queue
                </Button>
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
                <Input 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  className="font-medium"
                />
              </div>
              
              <div className="space-y-1 flex-1 flex flex-col">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Body</label>
                <Textarea 
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="flex-1 min-h-[300px] resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select an email from the queue to review
          </div>
        )}
      </div>
    </div>
  );
}
