
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
import { Loader2, Star } from 'lucide-react';

type SubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: () => void;
  loading: boolean;
};

const features = [
    "Unlimited AI-Powered Stock Analysis",
    "Daily Top-Rated Call & Put Setups",
    "Access to the Winners Dashboard",
    "Full Interactive Dashboards on Any Stock"
];

export function SubscriptionDialog({ open, onOpenChange, onSubscribe, loading }: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Star className="text-primary" />
            Keep Your Winning Edge
          </DialogTitle>
          <DialogDescription>
            Don't lose your momentum. Upgrade to Pro and continue getting unlimited access to the AI tools that help you find your next winning trade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <h3 className="mb-4 font-semibold text-foreground">What You Get with Pro:</h3>
            <ul className="space-y-3">
                {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                        <CheckIcon /> 
                        <p className="font-semibold text-foreground/90">{feature}</p>
                    </li>
                ))}
            </ul>
        </div>
        
        <DialogFooter className="flex-col items-center gap-2">
            <Button onClick={onSubscribe} className="w-full" disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Yes, Keep My AI Edge - $99/month
            </Button>
            <p className="text-xs text-muted-foreground">Cancel anytime.</p>
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
