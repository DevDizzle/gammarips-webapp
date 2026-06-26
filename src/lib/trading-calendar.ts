/**
 * Trading-calendar + pick-freshness helpers for the "Today's Pick" card.
 *
 * The landing page reads the *latest* `todays_pick` doc, which goes stale the
 * moment a V7 GIGO trade closes (15:45 ET) and stays stale until the next
 * pick publishes (~09:50 ET the next trading day) — ~18h overnight, ~66h over
 * a weekend. These helpers decide whether the latest doc is genuinely "today's"
 * pick or a spent one, and compute when the next pick is due so the card can
 * show a countdown instead of a closed trade.
 *
 * Calendar source is webapp-only by design (v1): weekend skip + an embedded
 * NYSE-2026 holiday list. The countdown is *soft* — if we ever miscompute a
 * holiday, the timer simply reaches zero and the card shows a neutral
 * "standing by" state, never a wrong stale pick. Refresh the holiday list each
 * December (or migrate to an engine-fed `next_pick_at` field — the durable fix).
 */
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export const ET = "America/New_York";

/**
 * NYSE full-closure holidays for 2026 (yyyy-MM-dd, ET calendar dates).
 * Early-close (1pm ET) half-days are intentionally OMITTED — they are still
 * trading days with a normal 10:00 ET pick, so they must NOT skip the countdown.
 */
const NYSE_HOLIDAYS_2026 = new Set<string>([
  "2026-01-01", // New Year's Day
  "2026-01-19", // Martin Luther King Jr. Day
  "2026-02-16", // Washington's Birthday
  "2026-04-03", // Good Friday
  "2026-05-25", // Memorial Day
  "2026-06-19", // Juneteenth
  "2026-07-03", // Independence Day (observed; Jul 4 is a Saturday)
  "2026-09-07", // Labor Day
  "2026-11-26", // Thanksgiving Day
  "2026-12-25", // Christmas Day
]);

/** yyyy-MM-dd of a UTC instant, in ET. */
export function etDay(d: Date): string {
  return formatInTimeZone(d, ET, "yyyy-MM-dd");
}

/** Day-of-week of an ET date string, computed at noon UTC so the host TZ never
 *  shifts the calendar date. 0 = Sun … 6 = Sat. */
function weekday(etDateStr: string): number {
  return new Date(`${etDateStr}T12:00:00Z`).getUTCDay();
}

/** Add `n` calendar days to an ET date string (yyyy-MM-dd). */
function addDaysStr(etDateStr: string, n: number): string {
  const d = new Date(`${etDateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** The UTC instant for a given ET wall-clock time on an ET date (DST-correct). */
function etInstant(etDateStr: string, hh: number, mm: number): Date {
  const h = String(hh).padStart(2, "0");
  const m = String(mm).padStart(2, "0");
  return fromZonedTime(`${etDateStr}T${h}:${m}:00`, ET);
}

/** Is this ET calendar date (yyyy-MM-dd) a normal NYSE trading day? */
export function isTradingDay(etDateStr: string): boolean {
  const dow = weekday(etDateStr);
  if (dow === 0 || dow === 6) return false; // weekend
  return !NYSE_HOLIDAYS_2026.has(etDateStr);
}

/**
 * The earliest 10:00-ET-on-a-trading-day instant strictly after `now`,
 * as an ISO string. Pre-open today → today 10:00; after that → next trading
 * day (skipping weekends + holidays).
 */
export function nextPickAt(now: Date): string {
  let dateStr = etDay(now);
  for (let i = 0; i < 14; i++) {
    if (isTradingDay(dateStr)) {
      const cand = etInstant(dateStr, 10, 0);
      if (cand.getTime() > now.getTime()) return cand.toISOString();
    }
    dateStr = addDaysStr(dateStr, 1);
  }
  // Defensive fallback (should be unreachable): 24h out.
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

export type PickFreshness =
  | { kind: "live"; positionClosed: boolean }
  | { kind: "countdown"; nextPickAt: string }
  | { kind: "standdown"; nextPickAt: string };

/**
 * Decide how to render the latest `todays_pick` doc.
 *
 *  - `live`      — the pick's session is today and markets haven't closed (16:00 ET).
 *                  `positionClosed` flips true after the 15:45 ET exit (grace window).
 *  - `countdown` — the pick is spent (past session, or past 16:00 ET on its own
 *                  session day): show a timer to the next pick instead of a stale card.
 *  - `standdown` — no pick today (skip / holiday / fail-closed): existing copy + timer.
 *
 * Boundaries:  open ── live ── 15:45 ──(live, "closed today")── 16:00 ── countdown ──▶ next 10:00 ET
 */
export function resolvePickFreshness(args: {
  hasPick: boolean;
  effectiveAt: string | null; // ISO of the 10:00 ET entry
  now: Date;
}): PickFreshness {
  const { hasPick, effectiveAt, now } = args;

  if (!hasPick) {
    return { kind: "standdown", nextPickAt: nextPickAt(now) };
  }
  // A pick with no entry timestamp is malformed — fail toward showing it.
  if (!effectiveAt) {
    return { kind: "live", positionClosed: false };
  }

  const sessionDay = etDay(new Date(effectiveAt));
  const today = etDay(now);

  if (sessionDay === today) {
    const close = etInstant(today, 16, 0);
    if (now.getTime() < close.getTime()) {
      const exit = etInstant(today, 15, 45);
      return { kind: "live", positionClosed: now.getTime() >= exit.getTime() };
    }
    // Same session day, after the close → count down to the next pick.
    return { kind: "countdown", nextPickAt: nextPickAt(now) };
  }

  // Session is a past day → the displayed pick is stale.
  return { kind: "countdown", nextPickAt: nextPickAt(now) };
}

/** Human ET label for a target instant, e.g. "Monday, Jun 29 · 10:00 AM ET". */
export function formatPickTargetLabel(iso: string): string {
  return formatInTimeZone(new Date(iso), ET, "EEEE, MMM d · h:mm a") + " ET";
}

/** Short ET weekday for the "last pick closed" line, e.g. "Thu". */
export function formatEtWeekday(iso: string): string {
  return formatInTimeZone(new Date(iso), ET, "EEE");
}
