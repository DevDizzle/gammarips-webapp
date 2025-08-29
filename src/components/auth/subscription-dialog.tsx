
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
    "Unlimited Buy / Hold / Sell ratings across the Russell 1000",
    "Daily AI Top Picks with concise reasons and a 90-day chart",
    "Clear highlights from price action, news, earnings, and fundamentals",
    "Priority access to new features and improvements"
]

export function SubscriptionDialog({ open, onOpenChange, onSubscribe, loading }: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Star className="text-primary" />
            Upgrade to Pro
          </DialogTitle>
          <DialogDescription>
            You’ve used your free analyses. Unlock unlimited access and stay on top of today’s opportunities.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <h3 className="mb-2 text-sm font-semibold uppercase text-muted-foreground">What you get</h3>
            <ul className="space-y-2">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckIcon /> 
                        <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
        
        <DialogFooter className="flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">$8/month · cancel anytime</p>
            <Button onClick={onSubscribe} className="w-full" disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upgrade for $8/month
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 mt-0.5 shrink-0">
        <path d="m9 12 2 2 4-4" />
    </svg>
)
