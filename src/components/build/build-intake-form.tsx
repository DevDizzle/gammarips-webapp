'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  captureAttributionFromUrl,
  generateEventId,
  getAttributionPayload,
  trackBeginCheckoutConversion,
  trackLeadConversion,
} from '@/lib/attribution';
import {
  AGENT_CARE_MCP_PRICE,
  AGENT_CARE_PRICE,
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
} from '@/lib/constants';

const ASSET_OPTIONS = [
  '2x / Inverse Single-Stock ETFs',
  'US Equities (1x Shares)',
  'US Options (Single-Leg)',
  'Multi-Instrument (Stocks + ETFs + Options)',
];

const DATA_SOURCES = [
  'GammaRips Pro MCP (Daily Pool + Liquidity + Move History)',
  'Polygon / Massive Real-Time Quotes',
  'Alpaca Market Data API',
  'TradingView Alert Webhooks',
  'Custom REST / Database Feed',
];

const BROKER_TARGETS = [
  'Robinhood MCP (Limit-Only + Paper First)',
  'Alpaca (Paper + Live)',
  'Tradier Brokerage API',
  'Interactive Brokers (IBKR Gateway)',
  'Paper Mode Simulator Only',
];

const HOSTING_TARGETS = [
  'My Own Cloud VPS (GCP / DigitalOcean / AWS)',
  'My Local Linux / macOS Machine (systemd / Docker)',
  'Need VPS Setup Guidance Included in Handoff',
];

export function BuildIntakeForm() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const paidSuccess = searchParams?.get('paid') === '1';
  const paidRequestId = searchParams?.get('request_id');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [assetClasses, setAssetClasses] = useState<string[]>([
    'Multi-Instrument (Stocks + ETFs + Options)',
  ]);
  const [dataSource, setDataSource] = useState(DATA_SOURCES[0]);
  const [brokerTarget, setBrokerTarget] = useState(BROKER_TARGETS[0]);
  const [hostingTarget, setHostingTarget] = useState(HOSTING_TARGETS[0]);
  const [rulesSummary, setRulesSummary] = useState('');
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [submittingMode, setSubmittingMode] = useState<'checkout' | 'scope' | null>(null);
  const [scopeSubmittedId, setScopeSubmittedId] = useState<string | null>(null);
  const [attribution, setAttribution] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;
    captureAttributionFromUrl();
    setAttribution(getAttributionPayload());
  }, []);

  const toggleAssetClass = (item: string) => {
    setAssetClasses((prev) =>
      prev.includes(item)
        ? prev.length > 1
          ? prev.filter((x) => x !== item)
          : prev
        : [...prev, item]
    );
  };

  async function handleSubmit(mode: 'checkout' | 'scope') {
    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Name and email required',
        description: 'Enter your name and email so we can send your spec confirmation.',
        variant: 'destructive',
      });
      return;
    }
    if (rulesSummary.trim().length < 20) {
      toast({
        title: 'Add your strategy rules',
        description:
          'Briefly describe your entry trigger, stop/exit rule, position sizing, and trading schedule.',
        variant: 'destructive',
      });
      return;
    }
    if (!complianceAccepted) {
      toast({
        title: 'Scope agreement required',
        description:
          'Confirm the work-for-hire software engineering agreement before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setSubmittingMode(mode);
    try {
      const leadEventId = generateEventId('build_lead');
      const liveAttribution = { ...attribution, ...getAttributionPayload() };
      const intakeRes = await fetch('/api/build-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          assetClasses,
          dataSource,
          brokerTarget,
          hostingTarget,
          rulesSummary,
          complianceAccepted: true,
          fastTrackCheckout: mode === 'checkout',
          attribution: liveAttribution,
          eventId: leadEventId,
        }),
      });
      const intakeJson = await intakeRes.json();
      if (!intakeRes.ok || !intakeJson.requestId) {
        throw new Error(intakeJson.error || 'Could not submit specification.');
      }

      const requestId: string = intakeJson.requestId;

      trackLeadConversion({
        eventId: leadEventId,
        value: mode === 'checkout' ? 1000 : 250,
        leadType: mode === 'checkout' ? 'agent_build_fast_track' : 'agent_build_scope_check',
      });

      if (mode === 'scope') {
        setScopeSubmittedId(requestId);
        setSubmittingMode(null);
        return;
      }

      const gaClientId =
        typeof window !== 'undefined' ? localStorage.getItem('ga_client_id') : null;
      const gaSessionId =
        typeof window !== 'undefined' ? localStorage.getItem('ga_session_id') : null;

      trackBeginCheckoutConversion({
        eventId: generateEventId('build_checkout'),
        value: 1000,
        plan: 'agent_build_standard',
      });

      const checkoutRes = await fetch('/api/checkout/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          email,
          name,
          attribution: liveAttribution,
          ...(gaClientId ? { gaClientId } : {}),
          ...(gaSessionId ? { gaSessionId } : {}),
        }),
      });
      const checkoutJson = await checkoutRes.json();
      if (!checkoutRes.ok || !checkoutJson.url) {
        throw new Error(checkoutJson.error || 'Could not start Stripe Checkout.');
      }

      window.location.href = checkoutJson.url;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Please try again or email evan@gammarips.com.';
      toast({
        title: 'Submission failed',
        description: message,
        variant: 'destructive',
      });
      setSubmittingMode(null);
    }
  }

  if (paidSuccess) {
    return (
      <Card className="border-emerald-500/50 bg-emerald-500/5">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <CheckCircle2 className="h-6 w-6 shrink-0" />
            <h3 className="text-xl font-bold font-headline text-foreground">
              {BUILD_STANDARD_PRICE} Build Slot Confirmed
            </h3>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            Your custom trading agent build is queued{paidRequestId ? ` (Ref: ${paidRequestId})` : ''}. Check your inbox for your kickoff email from{' '}
            <span className="font-mono text-primary">evan@gammarips.com</span> and reply with your GitHub username so we can provision your private repository.
          </p>
          <p className="text-xs text-muted-foreground">
            Delivery target: {BUILD_TURNAROUND_DAYS} business days in Paper Mode with full Docker + systemd files. If anything in your spec exceeds standard fixed scope, you are covered by our 24-hour 100% refund guarantee.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (scopeSubmittedId) {
    return (
      <Card className="border-primary/50 bg-card/70">
        <CardContent className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5 text-primary">
            <Sparkles className="h-6 w-6 shrink-0" />
            <h3 className="text-xl font-bold font-headline text-foreground">
              Spec Received — 24-Hour Engineering Review Started
            </h3>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            Reference ID: <code className="text-xs font-mono text-primary">{scopeSubmittedId}</code>. We sent a copy to <span className="font-medium">{email}</span>. Evan reviews every spec within 24 hours and replies with confirmation + your direct {BUILD_STANDARD_PRICE} checkout link (or a custom quote if your system requires multi-agent / multi-leg scope).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="spec-intake" className="border-primary/40 bg-card/70">
      <CardHeader className="border-b border-border/70 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="bg-primary/20 text-primary border-primary/40">
            Step-by-Step Spec Intake
          </Badge>
          <span className="text-xs font-mono text-muted-foreground">
            {BUILD_TURNAROUND_DAYS}-Business-Day Turnaround · Paper-First Delivery
          </span>
        </div>
        <CardTitle className="text-2xl font-bold font-headline mt-2">
          Submit Your Trading Agent Specification
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Lock in your {BUILD_STANDARD_PRICE} build slot immediately (backed by a 24-hour 100% out-of-scope refund guarantee), or request a free 24-hour engineering feasibility check first.
        </p>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="build-name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Name
            </label>
            <input
              id="build-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="build-email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address (for Repo Handoff &amp; Receipt)
            </label>
            <input
              id="build-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            1. Execution Vehicles (Select One or More)
          </span>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {ASSET_OPTIONS.map((opt) => {
              const active = assetClasses.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleAssetClass(opt)}
                  className={`rounded-lg border px-3.5 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-background/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="build-data" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              2. Intelligence / Data Feed
            </label>
            <select
              id="build-data"
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {DATA_SOURCES.map((ds) => (
                <option key={ds} value={ds}>
                  {ds}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="build-broker" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              3. Broker Adapter
            </label>
            <select
              id="build-broker"
              value={brokerTarget}
              onChange={(e) => setBrokerTarget(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {BROKER_TARGETS.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="build-hosting" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              4. Where You Will Run It
            </label>
            <select
              id="build-hosting"
              value={hostingTarget}
              onChange={(e) => setHostingTarget(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {HOSTING_TARGETS.map((ht) => (
                <option key={ht} value={ht}>
                  {ht}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="build-rules" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            5. Your Written Trading Rules (Plain English Is Fine)
          </label>
          <textarea
            id="build-rules"
            rows={5}
            value={rulesSummary}
            onChange={(e) => setRulesSummary(e.target.value)}
            placeholder="Example: At 10:05 ET each market day, check today's GammaRips pool, skip any stock with earnings within 7 days, buy the mapped 2x long ETF (or regular stock shares) using a limit order sized at $1,000 per trade (max 2 open positions), place a -8% stop loss, and close any open position on Day 2 at 3:45 PM ET."
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-border/80 bg-background/50 p-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={complianceAccepted}
            onChange={(e) => setComplianceAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 accent-primary shrink-0"
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Work-for-hire software engineering acknowledgment:</strong>{' '}
            I confirm that I am supplying and owning the trading rules, risk parameters, server, and broker API credentials. GammaRips provides custom software engineering and market data only (not investment advice), delivers all agents in <code className="text-foreground">PAPER</code> mode first, and makes no guarantee of trading performance. Optional maintenance ({AGENT_CARE_PRICE}/mo Care or {AGENT_CARE_MCP_PRICE}/mo Care + Pro MCP) is only offered after delivery.
          </span>
        </label>

        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            size="lg"
            onClick={() => handleSubmit('checkout')}
            disabled={submittingMode !== null}
            className="w-full font-semibold"
          >
            {submittingMode === 'checkout' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Stripe…
              </>
            ) : (
              `Lock In ${BUILD_STANDARD_PRICE} Build Slot Now →`
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => handleSubmit('scope')}
            disabled={submittingMode !== null}
            className="w-full"
          >
            {submittingMode === 'scope' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Spec…
              </>
            ) : (
              'Request Free 24h Scope Check First'
            )}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground text-center">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          <span>
            100% scope protection: if you pay now and your spec requires custom multi-agent scope, we refund your {BUILD_STANDARD_PRICE} in full within 24 hours.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
