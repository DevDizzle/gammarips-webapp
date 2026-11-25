import Link from 'next/link';
import { ArrowRight, Check, Sparkles, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Disclosure } from '@/components/ui/disclosure';
import {
  AGENT_CARE_PRICE,
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
  TOOL_COUNT,
  TRIAL_DAYS,
} from '@/lib/constants';
import { ProAwareCta } from '@/components/account/agent-quick-connect';

// Mid-page dual-path routing: "Two Speeds of the Same Outcome" (DIY Pro MCP vs.
// Done-For-You $1,000 Custom Agent Build), paired with Layer-3 progressive
// disclosure for technical filter specifications.

export function PoolRule() {
  return (
    <section id="how" className="scroll-mt-24 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">
          Two ways to put GammaRips to work
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Connect the nightly market feed to the AI assistant you already use, or have us build a
          safety-hardened automated trading agent around your own written rules.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {/* Path 1: DIY Pro MCP */}
        <div className="rounded-2xl border border-primary/40 bg-card/70 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4" />
              <span>DIY · Connect in 2 Minutes</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-foreground">
              Pro MCP Data Access
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Best if you already research or build trade plans in Claude, ChatGPT, Cursor, or
              Codex and want clean nightly market setups without building data pipelines.
            </p>
            <p className="text-2xl font-bold text-foreground pt-1">
              {PRICE_MONTHLY}
              <span className="text-sm font-normal text-muted-foreground">
                /mo · or {PRICE_ANNUAL}/yr ({TRIAL_DAYS}-day free trial)
              </span>
            </p>
            <ul className="space-y-2 text-sm text-foreground/90 pt-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>40–50 nightly liquid setups mapped to stocks, 2x/inverse ETFs, and options</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>10-minute live morning liquidity checks &amp; earnings verification</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>3-day move history &amp; price replay across all {TOOL_COUNT} MCP tools</span>
              </li>
            </ul>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <ProAwareCta size="lg" freeLabel={`Start ${TRIAL_DAYS}-Day Free Trial`} className="w-full font-semibold" />
            <Link
              href="/pricing"
              className="text-xs text-center text-muted-foreground hover:text-primary"
            >
              Compare Free vs. Pro pricing &rarr;
            </Link>
          </div>
        </div>

        {/* Path 2: Done-For-You Custom Agent Build */}
        <div className="rounded-2xl border border-border bg-card/50 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary">
              <Terminal className="h-4 w-4" />
              <span>Done-For-You · {BUILD_TURNAROUND_DAYS}-Day Delivery</span>
            </div>
            <h3 className="text-xl font-bold font-headline text-foreground">
              Custom Trading Agent Build
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Best if you have written trading rules for stocks, 2x ETFs, or options and want a
              production-safe Python bot delivered to your private GitHub repo.
            </p>
            <p className="text-2xl font-bold text-foreground pt-1">
              {BUILD_STANDARD_PRICE}
              <span className="text-sm font-normal text-muted-foreground">
                {' '}one-time · optional {AGENT_CARE_PRICE}/mo care
              </span>
            </p>
            <ul className="space-y-2 text-sm text-foreground/90 pt-2">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Limit-only order protection, fill-based stops &amp; crash-safe duplicate guards</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Works with Alpaca, Robinhood MCP, Tradier, or Interactive Brokers</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Verified in Paper Mode first · 100% your code &amp; broker keys</span>
              </li>
            </ul>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild variant="outline" size="lg" className="w-full font-semibold">
              <Link href="/build">
                Request Free 24h Scope Check <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Link
              href="/xtrader"
              className="text-xs text-center text-muted-foreground hover:text-primary"
            >
              Inspect our live paper benchmark agent first &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Layer 3: Expandable Technical Filter Specs (searchable via Ctrl+F & Googlebot) */}
      <div className="max-w-4xl mx-auto">
        <Disclosure
          label="How the nightly filter works (exact specs & research numbers)"
          hint="Combo A liquidity floors, volatility enrichment & walk-forward audit"
        >
          <div className="space-y-3 pt-1 leading-relaxed">
            <p>
              <strong className="text-foreground">1. Nightly Liquidity Scan (23:00 ET):</strong>{' '}
              Starts from ~3,500 optionable US stocks, keeps the top 100 most liquid names (3M+
              session shares, 25+ listed strikes), and selects bullish setups passing hard contract
              floors (<code className="text-xs text-foreground">Mid &gt;= $1.00</code>,{' '}
              <code className="text-xs text-foreground">OI &gt;= 500</code>,{' '}
              <code className="text-xs text-foreground">Delta 0.22–0.48</code>,{' '}
              <code className="text-xs text-foreground">DTE 10–45</code>).
            </p>
            <p>
              <strong className="text-foreground">2. Morning Enrichment (05:30 ET):</strong>{' '}
              Computes Realized-vs-Implied Volatility (<code className="text-xs text-foreground">rv_iv_ratio = (ATR_14 / Price × √252) / IV</code>),
              maps multi-instrument execution vehicles (stock, 2x long ETFs, inverse ETFs, and
              option contract), and attaches grounded news catalysts.
            </p>
            <p>
              <strong className="text-foreground">3. Live Market Checks (09:02–16:52 ET):</strong>{' '}
              Captures 10-minute intraday liquidity snapshots so your AI verifies morning volume and
              earnings dates before sizing any plan. In walk-forward research across{' '}
              <strong className="text-foreground">N = 5,575 enriched contracts (66 scan dates)</strong>,
              requiring <code className="text-xs text-foreground">OI &gt;= 500</code> lifted
              5-minute open fills from 30.3% to 50.1%, and Delta 0.22–0.48 / DTE 10–45 lifted
              3-day +40% touches from 27.6% to 35.4%. Historical paper research only; not investment advice.
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-xs">
              <Link href="/how-it-works" className="text-primary hover:underline font-medium">
                Read How It Works &rarr;
              </Link>
              <Link href="/methodology" className="text-primary hover:underline font-medium">
                Full Methodology &rarr;
              </Link>
              <Link href="/lab" className="text-primary hover:underline font-medium">
                Research Lab Audits &rarr;
              </Link>
            </div>
          </div>
        </Disclosure>
      </div>
    </section>
  );
}
