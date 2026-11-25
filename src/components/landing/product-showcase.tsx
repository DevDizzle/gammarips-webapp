'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Layers, Code2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlossaryTip } from '@/components/ui/glossary-tip';

type TabId = 'chat' | 'vehicles' | 'specs';

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'chat', label: 'Ask Your AI', icon: MessageSquare },
  { id: 'vehicles', label: 'Stocks, 2x ETFs & Options', icon: Layers },
  { id: 'specs', label: 'Under the Hood (Specs & JSON)', icon: Code2 },
];

const SAMPLE_JSON = `{
  "ticker": "NVDA",
  "direction": "BULLISH",
  "rv_iv_ratio": 1.12,
  "morning_open_interest": 8420,
  "earnings_in_window": false,
  "execution_vehicles": {
    "underlying_stock": "NVDA",
    "long_2x_etfs": ["NVDL", "NVDX"],
    "inverse_etfs": ["NVD", "NVDS"],
    "option_contract": "NVDA 2026-12-18 $145 Call (Delta 0.36)"
  }
}`;

export function ProductShowcase() {
  const [active, setActive] = useState<TabId>('chat');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    chat: null,
    vehicles: null,
    specs: null,
  });

  // Sync active tab when browser Find-in-Page matches text inside a hidden="until-found" panel.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onBeforeMatch = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const matchedId = target?.getAttribute('data-tab-panel') as TabId | null;
      if (matchedId && TABS.some((t) => t.id === matchedId)) {
        setActive(matchedId);
      }
    };
    el.addEventListener('beforematch', onBeforeMatch);
    return () => el.removeEventListener('beforematch', onBeforeMatch);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = TABS.length - 1;

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = TABS[nextIndex].id;
      setActive(nextTab);
      const btn = tabRefs.current[nextTab];
      btn?.focus();
      btn?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };

  return (
    <section aria-labelledby="showcase-heading" className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 id="showcase-heading" className="text-2xl md:text-3xl font-bold font-headline">
          See what your AI actually gets every morning
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2">
          Instead of guessing from web search, your AI reads clean nightly setups, live morning liquidity, and 3-day move history — then builds a plan around your risk budget.
        </p>
      </div>

      <div ref={containerRef} className="rounded-2xl border border-primary/30 bg-card/60 overflow-hidden">
        {/* Single-row horizontal scroll tablist with non-color underline indicator */}
        <div
          role="tablist"
          aria-label="GammaRips interactive product preview"
          className="gr-tablist-scroll border-b border-border/70 bg-background/50 px-2"
        >
          {TABS.map((tab, idx) => {
            const Icon = tab.icon;
            const isSelected = active === tab.id;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                id={`showcase-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={(e) => {
                  setActive(tab.id);
                  e.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                }}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`inline-flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel 1: Plain-English AI Chat (padding & borders live on inner wrapper for hidden="until-found") */}
        <div
          role="tabpanel"
          aria-labelledby="showcase-tab-chat"
          data-tab-panel="chat"
          tabIndex={active === 'chat' ? 0 : undefined}
          {...(active !== 'chat' ? ({ hidden: 'until-found' } as Record<string, string>) : {})}
        >
          <div className="p-5 sm:p-6 space-y-4">
            <div className="rounded-lg border border-border/70 bg-background/85 p-4 font-mono text-xs sm:text-sm space-y-3 leading-relaxed">
              <p className="text-foreground">
                <span className="text-primary font-semibold">you</span>
                <span className="text-muted-foreground"> ▸ </span>
                Check today&apos;s GammaRips pool. Max risk $300. Skip anything with upcoming earnings and show me stock, 2x ETF, and option choices.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['get_pool()', 'get_signal(earnings)', 'get_liquidity()', 'query_outcomes()'].map((tool) => (
                  <code
                    key={tool}
                    className="text-[11px] px-2 py-0.5 rounded bg-card border border-border/80 text-primary"
                  >
                    {tool}
                  </code>
                ))}
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p className="text-foreground">
                  <span className="text-primary font-semibold">your AI</span>
                  <span className="text-muted-foreground"> ▸ </span>
                  Market is open and volatility regime is calm. From 44 overnight setups, I removed 4 names with earnings inside 14 days and checked live 10-minute morning volume. Here is Candidate A sized for a $300 max stop:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-foreground/90">
                  <li>
                    <strong>Stock (1x):</strong> Buy 25 shares near $142.00 · Stop -$12 (-8.5% / $300 max loss).
                  </li>
                  <li>
                    <strong>2x Long ETF:</strong> Buy 40 shares of mapped 2x ETF near $62.50 · Stop -12% ($300 max loss), no option time decay.
                  </li>
                  <li>
                    <strong>Liquid Call Option:</strong> 2 contracts near $4.50 mid · Target +50% ($6.75) / Stop -30% ($3.15) based on 3-day move history ($270 max loss).
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground pt-1">
                  Want to inspect Candidate B, or verify intraday news catalysts first?
                </p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Illustrative example only — not live market data and not a recommendation. You review the plan and place orders in your own brokerage.
            </p>
          </div>
        </div>

        {/* Panel 2: Multi-Instrument Card */}
        <div
          role="tabpanel"
          aria-labelledby="showcase-tab-vehicles"
          data-tab-panel="vehicles"
          tabIndex={active === 'vehicles' ? 0 : undefined}
          {...(active !== 'vehicles' ? ({ hidden: 'until-found' } as Record<string, string>) : {})}
        >
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-primary">
                  One Nightly Setup · Four Ways to Execute
                </p>
                <h3 className="text-lg font-bold font-headline text-foreground">
                  You don&apos;t have to trade options to use options-flow data
                </h3>
              </div>
              <Badge variant="outline" className="text-xs">
                Illustrative Sample Card
              </Badge>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/80 bg-background/80 p-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  1x Underlying Stock
                </p>
                <p className="text-lg font-bold font-mono text-foreground">NVDA</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Clean directional equity shares with zero expiration date or theta decay.
                </p>
              </div>

              <div className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  2x Long / Inverse ETFs
                </p>
                <p className="text-lg font-bold font-mono text-foreground">NVDL · NVDX</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Mapped single-stock leveraged ETFs for 2x exposure with tight stock spreads and simple limit stops.
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-background/80 p-4 space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Liquid Call Contract
                </p>
                <p className="text-lg font-bold font-mono text-foreground">10–45 DTE Call</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pre-screened for tight spreads, deep open interest, and balanced delta — no sub-dollar penny contracts.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span>
                Includes{' '}
                <strong className="text-foreground">Volatility Value (RV/IV)</strong>
                <GlossaryTip
                  term="Volatility Value (RV/IV)"
                  explanation="Compares how much the stock has actually moved over the last 14 trading days against how much the options market expects it to move. Values above 0.85 flag contracts where realized movement justifies the option price."
                />
              </span>
              <span>
                Includes{' '}
                <strong className="text-foreground">3-Day Move History (MFE/MAE)</strong>
                <GlossaryTip
                  term="3-Day Move History (MFE/MAE)"
                  explanation="Shows the peak upside move (Maximum Favorable Excursion) and deepest pullback (Maximum Adverse Excursion) of past pool setups over 3 trading days, helping your AI set realistic targets and stops."
                />
              </span>
            </div>
          </div>
        </div>

        {/* Panel 3: Layer-3 Technical Specs & JSON */}
        <div
          role="tabpanel"
          aria-labelledby="showcase-tab-specs"
          data-tab-panel="specs"
          tabIndex={active === 'specs' ? 0 : undefined}
          {...(active !== 'specs' ? ({ hidden: 'until-found' } as Record<string, string>) : {})}
        >
          <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-5 items-start">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="text-xs font-mono uppercase tracking-wider text-primary">
                Layer-3 Technical Reference
              </p>
              <ul className="space-y-2 text-xs sm:text-sm leading-relaxed">
                <li>
                  <strong className="text-foreground">23:00 ET Scanner (Combo A):</strong> ~3,500 optionable US stocks &rarr; top 100 liquid universe (3M+ shares, 25+ strikes) &rarr; bullish calls passing <code className="text-foreground">Mid &gt;= $1.00</code>, <code className="text-foreground">OI &gt;= 500</code>, <code className="text-foreground">Delta 0.22–0.48</code>, <code className="text-foreground">DTE 10–45</code>.
                </li>
                <li>
                  <strong className="text-foreground">05:30 ET Enrichment:</strong> Adds <code className="text-foreground">rv_iv_ratio</code>, technicals, flow context, mapped <code className="text-foreground">execution_vehicles</code>, and grounded news catalysts.
                </li>
                <li>
                  <strong className="text-foreground">09:02–16:52 ET Intraday:</strong> 10-minute live open interest &amp; volume snapshots via <code className="text-foreground">get_liquidity</code>.
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-1 text-xs">
                <Link href="/methodology" className="text-primary hover:underline font-medium">
                  Full methodology &rarr;
                </Link>
                <Link href="/developers" className="text-primary hover:underline font-medium">
                  All 9 MCP tools &rarr;
                </Link>
              </div>
            </div>
            <pre className="rounded-lg border border-border/80 bg-background/90 p-3.5 text-[11px] sm:text-xs font-mono text-primary overflow-x-auto leading-relaxed">
              <code>{SAMPLE_JSON}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
