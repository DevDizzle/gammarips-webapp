'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Terminal,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
  XTraderCandidate,
  XTraderCohortStats,
  XTraderSession,
  XTraderSummary,
} from '@/lib/xtrader';

interface XTraderDashboardProps {
  summary: XTraderSummary | null;
  sessions: XTraderSession[];
}

function formatUsd(val: number | null | undefined, signed = false): string {
  if (val === null || val === undefined || !Number.isFinite(val)) return '--';
  const abs = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (val < 0) return `-$${abs}`;
  if (signed && val > 0) return `+$${abs}`;
  return `$${abs}`;
}

function formatPct(frac: number | null | undefined, signed = false): string {
  if (frac === null || frac === undefined || !Number.isFinite(frac)) return '--';
  const pct = frac * 100;
  const sign = signed && pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function formatDateHeading(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatEtTime(iso: string | null | undefined): string {
  if (!iso) return '--';
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/New_York',
    }) + ' ET';
  } catch {
    return iso;
  }
}

function formatEtDateTime(iso: string | null | undefined): string {
  if (!iso) return '--';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    }) + ' ET';
  } catch {
    return iso;
  }
}

function formatReasonLabel(reason: string | null | undefined): string {
  if (!reason) return 'passed';
  return reason.replace(/_/g, ' ');
}

function decisionBadge(session: XTraderSession) {
  if (session.decision === 'TRADE') {
    const isOpen = session.trade?.status === 'open';
    return (
      <Badge
        className={
          isOpen
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-primary/20 text-primary border-primary/40'
        }
      >
        {isOpen ? 'LIVE TRADE' : 'TRADE'}
      </Badge>
    );
  }
  if (session.decision === 'PENDING') {
    return (
      <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/40 animate-pulse">
        RUNNING
      </Badge>
    );
  }
  if (session.decision === 'CLOSED_HOLIDAY') {
    return <Badge variant="secondary">HOLIDAY</Badge>;
  }
  if (session.decision === 'SKIPPED') {
    return <Badge variant="secondary">SKIPPED</Badge>;
  }
  return (
    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/35">
      PASS
    </Badge>
  );
}

function stageLabel(stage: string): string {
  const map: Record<string, string> = {
    starting: 'Starting',
    preflight_done: 'Preflight GO',
    scanning: 'Scanning X Live',
    scored: 'Awaiting 10:15 ET Quotes',
    open: 'Position Open',
    decided: 'Decision Logged',
    closed: 'Position Closed',
    eod_reviewed: 'EOD Reviewed',
    window_missed: 'Entry Window Missed',
    market_closed: 'Market Closed',
  };
  return map[stage] ?? stage;
}

function CandidateRow({ cand, minScore }: { cand: XTraderCandidate; minScore: number }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(
    cand.factual_summary ||
      cand.one_line_verdict ||
      (cand.verifiable_bull_catalysts && cand.verifiable_bull_catalysts.length > 0) ||
      (cand.bear_disqualifiers && cand.bear_disqualifiers.length > 0)
  );

  return (
    <>
      <tr
        onClick={() => hasDetail && setOpen((prev) => !prev)}
        className={`border-b border-border/50 text-xs sm:text-sm ${
          hasDetail ? 'cursor-pointer hover:bg-muted/30' : ''
        } ${cand.funnel_stage === 'entered' ? 'bg-emerald-500/10' : ''}`}
      >
        <td className="py-2.5 px-3 font-medium">
          <div className="flex items-center gap-1.5">
            {hasDetail &&
              (open ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ))}
            <div>
              <Link
                href={`/signals/${cand.ticker}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-foreground hover:text-primary"
              >
                {cand.ticker}
              </Link>
              {cand.contract && (
                <div className="text-[11px] font-mono text-muted-foreground">
                  {cand.contract}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="py-2.5 px-3 text-right font-mono">
          {cand.x_alpha_score !== null && cand.x_alpha_score !== undefined ? (
            <span
              className={
                cand.disqualified
                  ? 'text-red-400 line-through'
                  : cand.x_alpha_score >= minScore
                  ? 'text-emerald-400 font-bold'
                  : 'text-foreground'
              }
            >
              {cand.x_alpha_score}
            </span>
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </td>
        <td className="py-2.5 px-3">
          {cand.funnel_stage === 'entered' ? (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[11px]">
              ENTERED
            </Badge>
          ) : cand.disqualified ? (
            <Badge className="bg-red-500/15 text-red-300 border-red-500/35 text-[11px]">
              DISQUALIFIED
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">
              {formatReasonLabel(cand.exclusion_reason || cand.funnel_stage)}
            </span>
          )}
        </td>
        <td className="py-2.5 px-3 text-right font-mono text-xs">
          {cand.mark !== null && cand.mark !== undefined ? `$${cand.mark.toFixed(2)}` : '--'}
          {cand.spread_pct !== null && cand.spread_pct !== undefined && (
            <div className="text-[11px] text-muted-foreground">{cand.spread_pct.toFixed(1)}% spd</div>
          )}
        </td>
        <td className="py-2.5 px-3 text-right font-mono text-xs">
          {cand.eod_return_pct !== null && cand.eod_return_pct !== undefined ? (
            <div>
              <span
                className={
                  cand.eod_return_pct > 0
                    ? 'text-emerald-400 font-semibold'
                    : cand.eod_return_pct < 0
                    ? 'text-red-400 font-semibold'
                    : 'text-muted-foreground'
                }
              >
                {formatPct(cand.eod_return_pct, true)}
              </span>
              {cand.eod_mfe_pct !== null && cand.eod_mae_pct !== null && (
                <div className="text-[10px] text-muted-foreground">
                  {formatPct(cand.eod_mfe_pct, true)} / {formatPct(cand.eod_mae_pct, true)}
                </div>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </td>
      </tr>
      {open && hasDetail && (
        <tr className="bg-muted/20 border-b border-border/50">
          <td colSpan={5} className="p-3 sm:p-4 text-xs space-y-2">
            {cand.one_line_verdict && (
              <div>
                <span className="font-semibold text-foreground">Scorer Verdict: </span>
                <span className="text-muted-foreground">{cand.one_line_verdict}</span>
              </div>
            )}
            {cand.factual_summary && (
              <div>
                <span className="font-semibold text-foreground">
                  Researcher Brief ({cand.post_count ?? 0} X posts):{' '}
                </span>
                <span className="text-muted-foreground leading-relaxed">
                  {cand.factual_summary}
                </span>
              </div>
            )}
            {cand.verifiable_bull_catalysts?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cand.verifiable_bull_catalysts.map((item, idx) => (
                  <Badge
                    key={idx}
                    className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-normal"
                  >
                    + {item}
                  </Badge>
                ))}
              </div>
            )}
            {cand.bear_disqualifiers?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cand.bear_disqualifiers.map((item, idx) => (
                  <Badge
                    key={idx}
                    className="bg-red-500/15 text-red-300 border-red-500/30 font-normal"
                  >
                    ! {item}
                  </Badge>
                ))}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function SessionCard({
  session,
  defaultOpen,
}: {
  session: XTraderSession;
  defaultOpen: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [showAllPool, setShowAllPool] = useState(false);

  const scoredCandidates = (session.candidates || []).filter(
    (c) => c.x_alpha_score !== null && c.x_alpha_score !== undefined
  );
  const visibleCandidates = showAllPool
    ? session.candidates || []
    : scoredCandidates.length > 0
    ? scoredCandidates
    : session.candidates || [];

  const trade = session.trade;
  const livePos = session.live_position;
  const featured = session.featured_analysis;
  const isLiveRunning =
    session.decision === 'PENDING' || (trade && trade.status === 'open');

  const displayPnlUsd =
    trade?.status === 'closed'
      ? trade.pnl_usd
      : trade?.status === 'open'
      ? livePos?.unrealized_pnl_usd ?? 0
      : null;

  const displayPnlPct =
    trade?.status === 'closed'
      ? trade.pnl_pct
      : trade?.status === 'open'
      ? livePos?.unrealized_pnl_pct ?? 0
      : null;

  return (
    <Card
      className={`transition-colors ${
        isLiveRunning
          ? 'border-emerald-500/50 bg-card/80'
          : 'border-border/80 bg-card/60 hover:border-primary/40'
      }`}
    >
      <CardHeader
        onClick={() => setExpanded((prev) => !prev)}
        className="cursor-pointer select-none pb-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold font-headline text-foreground">
                {formatDateHeading(session.session_date)}
              </span>
              {decisionBadge(session)}
              <Badge variant="outline" className="text-[11px] font-mono">
                {session.mode}
              </Badge>
              <Badge variant="secondary" className="text-[11px]">
                {stageLabel(session.stage)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{session.headline}</p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
            {displayPnlUsd !== null && displayPnlUsd !== undefined ? (
              <div className="text-right">
                <div
                  className={`text-lg font-bold font-mono ${
                    displayPnlUsd > 0
                      ? 'text-emerald-400'
                      : displayPnlUsd < 0
                      ? 'text-red-400'
                      : 'text-foreground'
                  }`}
                >
                  {formatUsd(displayPnlUsd, true)}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {formatPct(displayPnlPct, true)}
                  {trade?.status === 'open' ? ' live' : ''}
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-sm font-mono text-foreground">
                  Top Score: {session.pool_stats?.top_score ?? '--'}/{session.min_x_score}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.pool_stats?.x_scored_count ?? 0} X-scored of{' '}
                  {session.pool_stats?.total_screened ?? 0}
                </div>
              </div>
            )}

            <div className="rounded-md border border-border/60 p-1.5 text-muted-foreground">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-6 border-t border-border/60 pt-5">
          {/* 1. Trade Execution Box (when traded) */}
          {trade && (
            <div className="rounded-xl border border-primary/30 bg-background/60 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {displayPnlUsd !== null && displayPnlUsd >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {trade.status === 'open' ? 'Active Position' : 'Executed Trade'}:{' '}
                    <span className="font-mono text-primary">{trade.contract}</span>
                  </h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Score {trade.x_score}/100 · {trade.contracts} contract
                  {trade.contracts === 1 ? '' : 's'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-lg bg-muted/30 p-2.5">
                  <div className="text-muted-foreground">Entry Fill</div>
                  <div className="font-mono font-semibold text-foreground text-sm mt-0.5">
                    {formatUsd(trade.entry_fill)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Cost {formatUsd(trade.cost_usd)}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-2.5">
                  <div className="text-muted-foreground">Stop / Flat Rule</div>
                  <div className="font-mono font-semibold text-foreground text-sm mt-0.5">
                    {formatUsd(trade.stop_price)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {trade.target_price
                      ? `Target ${formatUsd(trade.target_price)}`
                      : 'Uncapped to 15:45 ET'}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-2.5">
                  <div className="text-muted-foreground">
                    {trade.status === 'open' ? 'Live Bid / Mark' : 'Exit Fill'}
                  </div>
                  <div className="font-mono font-semibold text-foreground text-sm mt-0.5">
                    {trade.status === 'open'
                      ? `${formatUsd(livePos?.bid)} / ${formatUsd(livePos?.mark)}`
                      : formatUsd(trade.exit_fill)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {trade.status === 'open'
                      ? `As of ${formatEtTime(livePos?.updated_ts_et)}`
                      : formatReasonLabel(trade.exit_reason)}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-2.5">
                  <div className="text-muted-foreground">
                    {trade.status === 'open' ? 'Unrealized P&L' : 'Realized P&L'}
                  </div>
                  <div
                    className={`font-mono font-bold text-sm mt-0.5 ${
                      (displayPnlUsd ?? 0) > 0
                        ? 'text-emerald-400'
                        : (displayPnlUsd ?? 0) < 0
                        ? 'text-red-400'
                        : 'text-foreground'
                    }`}
                  >
                    {formatUsd(displayPnlUsd, true)} ({formatPct(displayPnlPct, true)})
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {trade.status === 'open' ? 'Live OPRA NBBO' : formatEtTime(trade.exit_ts_et)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Multi-Agent Reasoning Panel */}
          {featured && (
            <div className="rounded-xl border border-border/70 bg-background/40 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Multi-Agent Reasoning:{' '}
                    <span className="text-primary">{featured.ticker}</span>
                    {featured.contract ? (
                      <span className="ml-2 text-xs font-mono text-muted-foreground">
                        {featured.contract}
                      </span>
                    ) : null}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span>
                    {session.models?.researcher || 'gemini-4-hydrogen'} -&gt;{' '}
                    {session.models?.scorer || 'gemini-4-neon'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/60 bg-card/60 p-3 space-y-1.5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Agent 2 Scorer Verdict
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-2xl font-bold font-mono ${
                        featured.disqualified
                          ? 'text-red-400'
                          : (featured.x_alpha_score ?? 0) >= session.min_x_score
                          ? 'text-emerald-400'
                          : 'text-amber-300'
                      }`}
                    >
                      {featured.x_alpha_score ?? '--'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / 100 (gate {session.min_x_score})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featured.catalyst_category && (
                      <Badge variant="secondary" className="text-[11px] font-mono">
                        {featured.catalyst_category}
                      </Badge>
                    )}
                    {featured.disqualified && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[11px]">
                        DISQUALIFIED
                      </Badge>
                    )}
                  </div>
                  {featured.one_line_verdict && (
                    <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                      {featured.one_line_verdict}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 rounded-lg border border-border/60 bg-card/60 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="uppercase tracking-wide">Agent 1 Researcher Brief</span>
                    <span className="font-mono">{featured.post_count ?? 0} X posts analyzed</span>
                  </div>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {featured.factual_summary || 'No researcher summary recorded.'}
                  </p>
                  {featured.verifiable_bull_catalysts?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {featured.verifiable_bull_catalysts.map((c, idx) => (
                        <Badge
                          key={idx}
                          className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[11px] font-normal"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {c}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {featured.bear_disqualifiers?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {featured.bear_disqualifiers.map((d, idx) => (
                        <Badge
                          key={idx}
                          className="bg-red-500/15 text-red-300 border-red-500/30 text-[11px] font-normal"
                        >
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          {d}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Live Activity Stream (Refreshable Log) */}
          {session.events && session.events.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span>Session Event Log ({session.events.length})</span>
                </div>
                {session.regime && (
                  <div className="text-xs font-mono text-muted-foreground">
                    Regime: VIX {session.regime.vix ?? '--'} / VIX3M {session.regime.vix3m ?? '--'} ·{' '}
                    SPY {session.regime.spy_trend ?? '--'}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border/70 bg-background/70 divide-y divide-border/40 max-h-72 overflow-y-auto">
                {session.events.map((ev, idx) => (
                  <div
                    key={`${ev.ts_et}-${idx}`}
                    className="px-3 py-2 text-xs flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3"
                  >
                    <span className="font-mono text-muted-foreground shrink-0">
                      {formatEtTime(ev.ts_et)}
                    </span>
                    <Badge
                      variant="outline"
                      className="w-fit text-[10px] font-mono uppercase shrink-0"
                    >
                      {ev.phase}
                    </Badge>
                    <span className="text-foreground/90 break-words">{ev.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Pool Funnel Scoreboard */}
          {session.candidates && session.candidates.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-foreground">
                  Pool Funnel Scoreboard ({visibleCandidates.length} shown of{' '}
                  {session.candidates.length})
                </div>
                {scoredCandidates.length > 0 &&
                  scoredCandidates.length < session.candidates.length && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllPool((prev) => !prev)}
                      className="h-7 text-xs"
                    >
                      {showAllPool
                        ? `Show X-Scored Only (${scoredCandidates.length})`
                        : `Show All Screened (${session.candidates.length})`}
                    </Button>
                  )}
              </div>
              <p className="text-xs text-muted-foreground">
                Click any X-scored row to read the full Researcher brief and Scorer verdict.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border/70 bg-background/40">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/70 text-[11px] uppercase tracking-wide text-muted-foreground bg-muted/20">
                      <th className="py-2 px-3">Contract</th>
                      <th className="py-2 px-3 text-right">X-Score</th>
                      <th className="py-2 px-3">Decision / Gate</th>
                      <th className="py-2 px-3 text-right">Live Quote</th>
                      <th className="py-2 px-3 text-right">EOD (MFE / MAE)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCandidates.map((c) => (
                      <CandidateRow
                        key={`${c.ticker}-${c.contract}`}
                        cand={c}
                        minScore={session.min_x_score}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function XTraderDashboard({ summary, sessions }: XTraderDashboardProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  const hasLive = (summary?.cohorts?.live?.sessions_count ?? 0) > 0;
  const defaultCohort: 'paper' | 'live' =
    summary?.active_mode === 'LIVE' && hasLive ? 'live' : 'paper';
  const [selectedCohort, setSelectedCohort] = useState<'paper' | 'live'>(defaultCohort);

  const cohort: XTraderCohortStats | null =
    summary?.cohorts?.[selectedCohort] ?? null;

  const filteredSessions = sessions.filter((s) =>
    selectedCohort === 'live' ? s.mode === 'LIVE' : s.mode !== 'LIVE'
  );

  const handleRefresh = () => {
    startRefresh(() => {
      router.refresh();
    });
  };

  const totalPnl = cohort?.total_pnl_usd ?? 0;
  const unrealizedPnl = cohort?.unrealized_pnl_usd ?? 0;
  const displayRoi =
    cohort?.trade_roi_pct !== null && cohort?.trade_roi_pct !== undefined
      ? cohort.trade_roi_pct
      : cohort?.account_roi_pct ?? 0;

  return (
    <div className="space-y-8">
      {/* Top Status Bar & Cohort Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={
              selectedCohort === 'live'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
            }
          >
            {selectedCohort === 'live' ? 'REAL-MONEY COHORT' : 'PAPER TRADING COHORT'}
          </Badge>
          {hasLive && (
            <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCohort('paper')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedCohort === 'paper'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Paper
              </button>
              <button
                type="button"
                onClick={() => setSelectedCohort('live')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedCohort === 'live'
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Live
              </button>
            </div>
          )}
          {summary?.updated_at && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Last synced {formatEtDateTime(summary.updated_at)}
            </span>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Live Feed'}
        </Button>
      </div>

      {/* Headline Running P&L Strip */}
      <section className="rounded-2xl border border-primary/30 bg-card/70 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-headline text-foreground">
              Running Performance ({selectedCohort === 'live' ? 'Real Capital' : 'Paper Baseline'})
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {cohort?.first_date && cohort?.last_date
                ? `Complete cohort window: ${cohort.first_date} to ${cohort.last_date} (${cohort.sessions_count} session${cohort.sessions_count === 1 ? '' : 's'})`
                : 'Awaiting first completed trading session.'}
            </p>
          </div>
          {cohort?.starting_capital_usd !== null && cohort?.starting_capital_usd !== undefined && (
            <div className="text-xs font-mono text-muted-foreground">
              Baseline: {formatUsd(cohort.starting_capital_usd)} · Equity:{' '}
              <span className="text-foreground font-semibold">
                {formatUsd(cohort.current_equity_usd)}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Running P&amp;L</div>
            <div
              className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${
                totalPnl > 0
                  ? 'text-emerald-400'
                  : totalPnl < 0
                  ? 'text-red-400'
                  : 'text-foreground'
              }`}
            >
              {formatUsd(totalPnl, true)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 font-mono">
              {unrealizedPnl !== 0
                ? `${formatUsd(unrealizedPnl, true)} open unrealized`
                : 'Realized dollars'}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">ROI</div>
            <div
              className={`text-2xl sm:text-3xl font-bold font-mono mt-1 ${
                displayRoi > 0
                  ? 'text-emerald-400'
                  : displayRoi < 0
                  ? 'text-red-400'
                  : 'text-foreground'
              }`}
            >
              {formatPct(displayRoi, true)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {cohort?.capital_deployed_usd && cohort.capital_deployed_usd > 0
                ? `On ${formatUsd(cohort.capital_deployed_usd)} deployed`
                : 'Account ROI on baseline'}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Trades</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono mt-1 text-foreground">
              {cohort?.trades_closed ?? 0}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1 font-mono">
              {cohort?.wins ?? 0}W - {cohort?.losses ?? 0}L
              {(cohort?.trades_open ?? 0) > 0 ? ` · ${cohort?.trades_open} open` : ''}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/60 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono mt-1 text-foreground">
              {cohort?.win_rate !== null && cohort?.win_rate !== undefined
                ? formatPct(cohort.win_rate)
                : '--'}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {cohort?.trades_closed
                ? `${cohort.wins} of ${cohort.trades_closed} closed`
                : 'No closed trades yet'}
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 rounded-xl border border-border/70 bg-background/60 p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Sessions</div>
            <div className="text-2xl sm:text-3xl font-bold font-mono mt-1 text-foreground">
              {cohort?.sessions_count ?? sessions.length}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {cohort?.passes ?? 0} passed (score &lt; {summary?.min_x_score ?? 60})
            </div>
          </div>
        </div>

        {/* Paper Trading & Compliance Disclaimer */}
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground">
              {selectedCohort === 'live' ? 'Real-Money Agent Log' : 'Paper-Trading Disclosure'}:
            </strong>{' '}
            {selectedCohort === 'live'
              ? 'These logs show real-money executions from the operator reference agent built on GammaRips MCP.'
              : 'All figures above reflect simulated paper-trading fills against live Massive OPRA NBBO quotes on a $2,500 baseline until live capital deployment.'}{' '}
            Complete cohort shown (every trade and pass). Educational market data and research
            observability only, not investment advice or a recommendation to copy trades.
          </p>
        </div>
      </section>

      {/* Daily Session Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
              Daily Decision Log
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Click any day to inspect live events, reasoning, and pool scores
          </span>
        </div>

        {filteredSessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No sessions published in this cohort yet. The daemon publishes live updates starting
              at 09:45 ET each market day.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session, idx) => (
              <SessionCard
                key={session.session_date}
                session={session}
                defaultOpen={idx === 0}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
