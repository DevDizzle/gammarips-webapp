
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
    "Unlimited AI Stock Outlooks",
    "Daily Top-Rated Options Setups",
    "The \"Winners Dashboard\"",
    "Full Interactive Dashboards"
];

export function SubscriptionDialog({ open, onOpenChange, onSubscribe, loading }: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Star className="text-primary" />
            Your Free Trial Has Ended
          </DialogTitle>
          <DialogDescription>
            Upgrade to keep your AI edge and continue using all ProfitScout Pro features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
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
                Upgrade to Pro
            </Button>
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

