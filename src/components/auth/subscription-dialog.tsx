'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Zap } from 'lucide-react';

type SubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: () => void;
  loading: boolean;
};

const features = [
    { 
        title: "Daily Top-Rated Call Contracts",
        description: "Delivered to your dashboard & inbox" 
    },
    { 
        title: "AI Chat",
        description: "Ask questions about any ticker, setup, or strategy — instant analysis"
    },
    {
        title: "Full-Market Coverage",
        description: "~5,230-ticker overnight scan for momentum, flow, and opportunity"
    },
    {
        title: "Full Confluence Dashboard",
        description: "Where stock conviction meets options flow"
    },
    {
        title: "MCP Server Access",
        description: "Connect your preferred AI agent for in-depth analysis"
    }
];

export function SubscriptionDialog({ open, onOpenChange, onSubscribe, loading }: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Zap className="text-primary" />
            Unlock the Full Playbook
          </DialogTitle>
          <DialogDescription>
            You've seen what the signals can do. Now get the whole picture. Upgrade for daily contracts, AI analysis, and the tools to trade smarter.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <h3 className="mb-4 font-semibold text-foreground">What You Get:</h3>
            <ul className="space-y-4">
                {features.map((feature) => (
                    <li key={feature.title} className="flex items-start gap-3">
                        <CheckIcon /> 
                        <div>
                            <p className="font-semibold text-foreground/90">{feature.title}</p>
                            {feature.description && <p className="text-sm text-muted-foreground">{feature.description}</p>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        
        <DialogFooter className="flex-col items-center gap-2 text-center">
            <Button onClick={onSubscribe} className="w-full" disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Let's Rip
            </Button>
            <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Get started today. Secure your edge.</p>
                <p className="text-[10px] text-muted-foreground/60">Options trading involves significant risk. For educational purposes only.</p>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 mt-0.5 shrink-0">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
)
