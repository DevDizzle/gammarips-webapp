"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

/**
 * Public "next pick" anticipation block, shown in place of a spent/stale pick.
 * Ticks every second toward `targetIso` (next trading-day 10:00 ET). When it
 * crosses zero it polls the server (`router.refresh()`) so the freshly
 * published pick replaces the timer as soon as it lands — "as soon as available."
 *
 * NOT wrapped in <ProLock>: the countdown is a free conversion hook, not the
 * paid pick.
 */
function parts(ms: number) {
  const t = Math.floor(ms / 1000);
  return {
    d: Math.floor(t / 86400),
    h: Math.floor((t % 86400) / 3600),
    m: Math.floor((t % 3600) / 60),
    s: t % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function NextPickCountdown({
  targetIso,
  targetLabel,
  lastPick,
  compact = false,
}: {
  targetIso: string;
  targetLabel: string;
  lastPick?: { ticker: string; direction: string; closedLabel: string } | null;
  /** When true, render a slim banner (used under the no-trade stand-down copy). */
  compact?: boolean;
}) {
  const targetMs = new Date(targetIso).getTime();
  // null until mounted → server and first client paint agree (no hydration mismatch).
  const [remaining, setRemaining] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, targetMs - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  // Past zero: the pick should be publishing — pull it from the server.
  const elapsed = remaining === 0;
  useEffect(() => {
    if (!elapsed) return;
    router.refresh();
    const id = setInterval(() => router.refresh(), 20000);
    return () => clearInterval(id);
  }, [elapsed, router]);

  const display =
    remaining === null
      ? "—"
      : (() => {
          const { d, h, m, s } = parts(remaining);
          return `${d > 0 ? `${d}d ` : ""}${pad(h)}:${pad(m)}:${pad(s)}`;
        })();

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-3 text-sm">
        <Clock className="h-4 w-4 text-primary shrink-0" />
        {elapsed ? (
          <span className="text-muted-foreground">
            Standing by. The next pick posts at the open.
          </span>
        ) : (
          <span className="text-muted-foreground">
            Next pick in{" "}
            <span className="font-mono font-semibold tabular-nums text-foreground" suppressHydrationWarning>
              {display}
            </span>{" "}
            · {targetLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="py-2 text-center">
      <div className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
        <Clock className="h-3.5 w-3.5" />
        {elapsed ? "Publishing today's pick" : "Next pick in"}
      </div>

      {elapsed ? (
        <div className="font-headline text-2xl font-bold tracking-tight">
          Standing by
          <span className="ml-1 inline-flex gap-0.5 align-middle">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:200ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:400ms]" />
          </span>
        </div>
      ) : (
        <div
          className="font-mono text-4xl font-bold tabular-nums tracking-tight md:text-5xl"
          suppressHydrationWarning
        >
          {display}
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        {elapsed ? "Posting at the 10:00 ET open." : `Posts ${targetLabel}`}
      </p>

      {lastPick && (
        <p className="mt-4 border-t border-border pt-3 text-[11px] text-muted-foreground/80">
          Last pick:{" "}
          <span className="font-semibold text-foreground">
            {lastPick.ticker}
            {lastPick.direction ? ` ${lastPick.direction}` : ""}
          </span>{" "}
          · closed {lastPick.closedLabel}
        </p>
      )}
    </div>
  );
}
