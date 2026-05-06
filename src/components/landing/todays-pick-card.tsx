import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type TodaysPick } from "@/lib/firebase-admin";
import { TrendingUp, TrendingDown, AlertCircle, ArrowRight } from "lucide-react";

const SKIP_REASON_COPY: Record<string, string> = {
  no_candidates_passed_gates:
    "No signals cleared today's V5.3 filter stack (V/OI > 2, 5–10% OTM, VIX ≤ VIX3M, no earnings overlap). On these days the engine stays out — routine over FOMO.",
  regime_fail_closed:
    "Regime data was unavailable (VIX or VIX3M missing). Fail-closed: no trade today.",
  vix_backwardation:
    "VIX closed above VIX3M today. Backwardation regime — the engine skips these days because long-premium setups fail disproportionately here.",
  earnings_overlap_all_candidates:
    "All top candidates report earnings during the hold window. The engine skips these days — long single-leg options through earnings is a literature-documented loss pattern (De Silva et al. 2026, RoF).",
  earnings_calendar_unavailable:
    "Earnings calendar unavailable — engine is standing down (fail-closed). The no-options-through-earnings rule is hard; we skip rather than guess.",
};

function formatEffectiveAt(isoString: string | null): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " ET";
  } catch {
    return isoString;
  }
}

function formatMoneyMillions(v: number | undefined): string {
  if (v === undefined || v === null) return "—";
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

export function TodaysPickCard({
  pick,
  embedded = false,
}: {
  pick: TodaysPick;
  /** When true, skip the outer <Card>/<section> chrome. The parent panel
   *  owns the brand border so we don't double up. Used by the unified
   *  V5.3 panel on the landing page. */
  embedded?: boolean;
}) {
  if (!pick.has_pick) {
    const reason = pick.skip_reason
      ? SKIP_REASON_COPY[pick.skip_reason] ?? pick.skip_reason
      : "No pick today.";
    const skipBody = (
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
            Today&apos;s V5.3 Pick
          </p>
          <h2 className="text-2xl font-bold font-headline">No trade today</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-prose">{reason}</p>
          <p className="text-xs text-muted-foreground mt-3">
            scan {pick.scan_date}
          </p>
        </div>
      </div>
    );
    if (embedded) return skipBody;
    return (
      <section>
        <Card className="border-muted-foreground/30 bg-card/60">
          <CardContent className="p-6 md:p-8">{skipBody}</CardContent>
        </Card>
      </section>
    );
  }

  const isBull = pick.direction === "BULLISH";
  const directionalFlow = isBull ? pick.call_dollar_volume : pick.put_dollar_volume;
  const color = isBull ? "text-green-500" : "text-red-500";
  const badgeClass = isBull
    ? "bg-green-500/20 text-green-500 border-green-500/40"
    : "bg-red-500/20 text-red-500 border-red-500/40";

  const pickInner = (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs uppercase tracking-wider text-primary font-semibold">
          Today&apos;s V5.3 Pick
        </p>
        <p className="text-xs text-muted-foreground">
          Entry {formatEffectiveAt(pick.effective_at)}
        </p>
      </div>

            <div className="flex items-center gap-4 flex-wrap">
              <span className={`text-5xl font-bold font-headline tracking-tight ${color}`}>
                {pick.ticker}
              </span>
              <Badge variant="outline" className={`${badgeClass} gap-1 text-sm`}>
                {isBull ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {pick.direction}
              </Badge>
              {pick.recommended_contract && (
                <code className="text-sm text-muted-foreground font-code">
                  {pick.recommended_contract}
                </code>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Strike</p>
                <p className="font-semibold">{pick.recommended_strike ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">DTE</p>
                <p className="font-semibold">{pick.recommended_dte ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mid</p>
                <p className="font-semibold">
                  {pick.recommended_mid_price !== undefined
                    ? `$${pick.recommended_mid_price.toFixed(2)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isBull ? "Call $ Vol" : "Put $ Vol"}
                </p>
                <p className="font-semibold">{formatMoneyMillions(directionalFlow)}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                Why this pick cleared V5.3 gates
              </p>
              <div className="flex flex-wrap gap-2">
                {pick.vol_oi_ratio !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    V/OI {pick.vol_oi_ratio.toFixed(2)} &gt; 2.0 ✓
                  </Badge>
                )}
                {pick.moneyness_pct !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {(pick.moneyness_pct * 100).toFixed(1)}% OTM (5–10%) ✓
                  </Badge>
                )}
                {pick.vix_now_at_decision !== undefined &&
                  pick.vix3m_at_enrich !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      VIX {pick.vix_now_at_decision.toFixed(2)} ≤ VIX3M {pick.vix3m_at_enrich.toFixed(2)} ✓
                    </Badge>
                  )}
                <Badge variant="secondary" className="text-xs">
                  No earnings during hold ✓
                </Badge>
                {pick.overnight_score !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    Engine score {pick.overnight_score}
                  </Badge>
                )}
              </div>
            </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground leading-relaxed flex-1 pr-4">
          Entry 10:00 ET day-1 · Stop −60% · Target +80% · Hold 3 trading days · Paper-trading
          performance, educational only. Not investment advice.
        </p>
        <span className="text-xs text-primary font-medium whitespace-nowrap inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          Read rationale <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );

  const linkWrapper = (
    <Link
      href={`/signals/${pick.ticker}`}
      aria-label={`Read the rationale for ${pick.ticker} ${pick.direction}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      {pickInner}
    </Link>
  );

  if (embedded) return linkWrapper;

  return (
    <section>
      <Link
        href={`/signals/${pick.ticker}`}
        aria-label={`Read the rationale for ${pick.ticker} ${pick.direction}`}
        className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      >
        <Card className="border-primary/40 bg-card/90 shadow-[0_0_30px_rgba(234,179,8,0.08)] transition-all group-hover:border-primary/70 group-hover:shadow-[0_0_40px_rgba(234,179,8,0.16)] cursor-pointer">
          <CardContent className="p-6 md:p-8">{pickInner}</CardContent>
        </Card>
      </Link>
    </section>
  );
}
