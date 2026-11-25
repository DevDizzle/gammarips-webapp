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
import { PRICE_ANNUAL, PRICE_MONTHLY, TOOL_COUNT, TRIAL_DAYS } from '@/lib/constants';

type SubscriptionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: () => void;
  loading: boolean;
};

const features = [
  {
    title: 'Full Nightly Market Pool (40–50 Setups)',
    description: 'Pre-filtered for real liquidity and mapped to stocks, 2x/inverse ETFs, and liquid options with news catalysts',
  },
  {
    title: 'Live Morning Liquidity & Earnings Checks',
    description: 'Updated every 10 minutes during market hours so your AI verifies active volume and avoids surprise earnings',
  },
  {
    title: '3-Day Historical Move Data & Price Replay',
    description: 'See how far past setups ran up and pulled back so your AI can set realistic targets and stops',
  },
  {
    title: `All ${TOOL_COUNT} MCP Tools in Your Preferred AI`,
    description: 'One-click browser login or API key for Claude, ChatGPT, Cursor, Codex, or the open-source harness',
  },
];

export function SubscriptionDialog({ open, onOpenChange, onSubscribe, loading }: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <Zap className="text-primary" />
            Get Pro MCP Access
          </DialogTitle>
          <DialogDescription>
            Start your {TRIAL_DAYS}-day free trial ({PRICE_MONTHLY}/mo or {PRICE_ANNUAL}/yr after). Full access from minute one; cancel anytime before day {TRIAL_DAYS} at $0.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <h3 className="mb-4 font-semibold text-foreground">Included in Pro MCP:</h3>
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
            Start {TRIAL_DAYS}-Day Free Trial ({PRICE_MONTHLY}/mo)
          </Button>
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground/70">
              Educational market data and historical research only. Not investment advice.
            </p>
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
);
