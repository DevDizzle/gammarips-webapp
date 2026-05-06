import { Card, CardContent } from "@/components/ui/card";
import { type CohortStats } from "@/lib/firebase-admin";

function formatUSD(v: number): string {
  if (v === 0) return "$0";
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function formatPctSigned(pct: number): { text: string; sign: "pos" | "neg" | "zero" } {
  const display = pct * 100;
  if (Math.abs(display) < 0.05) return { text: "0.0%", sign: "zero" };
  const sign = display > 0 ? "+" : "";
  return {
    text: `${sign}${display.toFixed(1)}%`,
    sign: display > 0 ? "pos" : "neg",
  };
}

function formatCohortStart(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export function CohortStatsRow({ stats }: { stats: CohortStats | null }) {
  // Empty-state when the doc doesn't exist yet (pre-first-deploy or transient
  // Firestore failure). Render a safe zeros panel — never block the page.
  const safe: CohortStats = stats ?? {
    cohort_start: "2026-05-07",
    policy_version: "V5_3_TARGET_80",
    as_of: null,
    trades_closed: 0,
    trades_won: 0,
    win_rate: 0,
    total_invested_usd: 0,
    total_pl_usd: 0,
    roi_pct: 0,
  };

  const roi = formatPctSigned(safe.roi_pct);
  const roiColor =
    roi.sign === "pos"
      ? "text-green-500"
      : roi.sign === "neg"
        ? "text-red-500"
        : "text-foreground";

  // Win rate undefined when no closed trades — show em-dash, not "0%" which
  // would imply we tried 100 trades and won zero. Honest reporting matters.
  const winRateText =
    safe.trades_closed === 0
      ? "—"
      : `${Math.round(safe.win_rate * 100)}%`;

  return (
    <section aria-label="GammaRips paper-trade live performance">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Trades
            </p>
            <p className="text-2xl font-bold font-headline mt-1">
              {safe.trades_closed}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              ROI
            </p>
            <p className={`text-2xl font-bold font-headline mt-1 ${roiColor}`}>
              {roi.text}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Win Rate
            </p>
            <p className="text-2xl font-bold font-headline mt-1">
              {winRateText}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="p-4 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total Invested
            </p>
            <p className="text-2xl font-bold font-headline mt-1">
              {formatUSD(safe.total_invested_usd)}
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="text-[11px] text-muted-foreground text-center mt-2 leading-tight">
        Paper-traded · Educational only · Not investment advice ·
        {" "}
        Live cohort since {formatCohortStart(safe.cohort_start)}
      </p>
    </section>
  );
}
