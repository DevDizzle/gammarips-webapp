
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
    {
        title: "Unlimited AI-Powered Market Outlooks",
        description: "Get our complete five-tier analysis (from \"Strongly Bullish\" to \"Strongly Bearish\") for every stock we cover, updated daily."
    },
    {
        title: "Daily Top-Rated Options Setups",
        description: "Access a curated list of the highest-scoring Call and Put options, so you can instantly find actionable trade ideas backed by our data-driven models."
    },
    {
        title: "The \"Winners Dashboard\"",
        description: "See the best of both worlds: our daily list of stocks that have both a strong market outlook and a top-rated options setup, giving you the highest-conviction ideas."
    },
    {
        title: "Full Access to Interactive Dashboards",
        description: "Dive deep into any stock with advanced charts, real-time momentum signals, and the complete AI analysis behind every outlook."
    },
    {
        title: "Priority Access",
        description: "Be the first to use new features, tools, and platform improvements as they are released."
    }
]

export function SubscriptionDialog({ open, onOpenChange, onSubscribe, loading }: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Star className="text-primary" />
            Unlock Your Full Trading Potential
          </DialogTitle>
          <DialogDescription>
            You’ve reached your limit of free analyses. Upgrade to ProfitScout Pro to get unlimited access to our full suite of AI-powered tools and find your next winning trade.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <h3 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">What You Get with Pro:</h3>
            <ul className="space-y-4">
                {features.map((feature) => (
                    <li key={feature.title} className="flex items-start gap-3">
                        <CheckIcon /> 
                        <div>
                            <p className="font-semibold text-foreground/90">{feature.title}</p>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        
        <DialogFooter className="flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">$19/month · Cancel Anytime</p>
            <Button onClick={onSubscribe} className="w-full" disabled={loading} size="lg">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upgrade for $19/month
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
