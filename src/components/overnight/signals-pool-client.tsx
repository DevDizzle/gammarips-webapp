'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { type OvernightSignal } from '@/lib/firebase-admin';
import { SignalsTable } from '@/components/overnight/signals-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';
import { AgentQuickConnect } from '@/components/account/agent-quick-connect';

interface SignalsPoolClientProps {
  queryDate: string;
  previewSignals: OvernightSignal[];
  totalCount: number;
}

export function SignalsPoolClient({
  queryDate,
  previewSignals,
  totalCount,
}: SignalsPoolClientProps) {
  const { user, isPro, loading: authLoading } = useAuth();
  const [fullSignals, setFullSignals] = useState<OvernightSignal[] | null>(null);
  const [fetchingFull, setFetchingFull] = useState(false);

  useEffect(() => {
    if (!user || !isPro) {
      setFullSignals(null);
      return;
    }

    let cancelled = false;
    const loadFullPool = async () => {
      setFetchingFull(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch(
          `/api/signals/pool?date=${encodeURIComponent(queryDate)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data?.signals)) {
            setFullSignals(data.signals);
          }
        }
      } catch {
        // fallback to preview if network fails
      } finally {
        if (!cancelled) setFetchingFull(false);
      }
    };

    void loadFullPool();
    return () => {
      cancelled = true;
    };
  }, [user, isPro, queryDate]);

  if (isPro) {
    const displayed = fullSignals && fullSignals.length > 0 ? fullSignals : previewSignals;
    return (
      <div className="grid gap-8">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <Badge variant="default" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Pro Subscription Active · Full Pool Unlocked ({displayed.length} of {totalCount} Contracts)
            </Badge>
            {fetchingFull && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading full pool…
              </span>
            )}
          </div>
          <SignalsTable
            title={`Today's Full Combo A Pool (${displayed.length} Contracts)`}
            signals={displayed}
          />
          <p className="mt-3 text-xs text-muted-foreground max-w-3xl">
            Showing all {displayed.length} bullish call candidates passing today&apos;s Combo A filter (<code className="text-foreground">Mid &gt;= $1.00</code>, <code className="text-foreground">OI &gt;= 500</code>, <code className="text-foreground">Delta 0.22–0.48</code>, <code className="text-foreground">DTE 10–45</code>). Descriptive scores are point-in-time context, not a forecast or recommendation.
          </p>
        </div>

        <AgentQuickConnect compact />
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div>
        <SignalsTable
          title="Today's Pool Preview (Top 3 Contracts)"
          signals={previewSignals}
        />
        <p className="mt-3 text-xs text-muted-foreground max-w-3xl">
          The preview table shows 3 contracts from today&apos;s scan. Descriptive scores are point-in-time context, not a forecast or recommendation.
        </p>
      </div>

      {!authLoading && (
        <Card className="border-primary/40 bg-card/80">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Lock className="h-3.5 w-3.5" />
                Pro MCP Dataset
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-headline">
                Showing {previewSignals.length} of {totalCount} contracts that passed today&apos;s Combo A filter
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Unlock the full nightly pool on the web and in your AI agent—complete with exact contract specs, <code className="text-xs text-foreground">rv_iv_ratio</code>, grounded catalysts, 10-minute intraday liquidity snapshots, and 3-day MFE/MAE outcome surfaces. Start with a {TRIAL_DAYS}-day free trial.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
              <Button asChild size="lg">
                <Link href="/pricing">
                  Unlock Full Pool ({PRICE_MONTHLY}/mo) <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/#connect">Connect Free Preview</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
