import { Card, CardContent } from "@/components/ui/card";
import { type PoolOutcomes } from "@/lib/firebase-admin";

function pct(v: number | null | undefined, signed = true): string {
  if (v === null || v === undefined) return "—";
  const display = v * 100;
  const sign = signed && display > 0 ? "+" : "";
  return `${sign}${display.toFixed(0)}%`;
}

function Tile({ label, value, tone }: { label: string; value: string; tone?: "pos" | "neg" }) {
  const color =
    tone === "pos" ? "text-green-500" : tone === "neg" ? "text-red-500" : "text-foreground";
  return (
    <Card className="bg-card/60">
      <CardContent className="p-4 text-center">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold font-headline mt-1 ${color}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

/** The whole-pool outcome distribution — every candidate the engine surfaced,
 *  tracked to its outcome. Deliberately distribution-shaped: no single blended
 *  ROI headline (the honest blind-buy baseline is negative and shown as such). */
export function PoolOutcomesTiles({ outcomes }: { outcomes: PoolOutcomes | null }) {
  if (!outcomes) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Pool outcome aggregates are being computed — check back shortly.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile label="Contracts Tracked" value={outcomes.contracts_total.toLocaleString()} />
        <Tile label="Blind-Buy Baseline" value={`${pct(outcomes.bracket_avg_return)}/day`} tone="neg" />
        <Tile label="Median Peak" value={pct(outcomes.opp_peak_median)} tone="pos" />
        <Tile label="Median Drawdown" value={pct(outcomes.opp_trough_median)} tone="neg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile label="Scan Days" value={String(outcomes.scan_days)} />
        <Tile label="Blind-Buy Win Rate" value={pct(outcomes.bracket_win_rate, false)} />
        <Tile label="Top-Decile Peak" value={pct(outcomes.opp_peak_p90)} tone="pos" />
        <Tile label="Labeled Outcomes" value={outcomes.labeled_sameday.toLocaleString()} />
      </div>
      <p className="text-[11px] text-muted-foreground text-center leading-tight">
        Every candidate in the pool, tracked to its outcome — wins and losses, no
        highlight reel. &ldquo;Blind-buy baseline&rdquo; = buying every contract under a
        fixed same-day bracket; it loses, and we publish that on purpose — the exit
        is your agent&apos;s job. Peaks/drawdowns are realized excursions per contract
        (what was actually possible), not returns anyone earned. Contracts too
        illiquid to simulate a realistic fill carry no bracket label, and the newest
        days are still labeling — that&apos;s the gap between tracked and labeled.
      </p>
    </div>
  );
}
