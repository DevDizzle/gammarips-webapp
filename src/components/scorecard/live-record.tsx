import { Card, CardContent } from '@/components/ui/card';
import {
  LIVE_RECORD,
  LIVE_TRADES,
  RECEIPTS_DISCLAIMER,
  signedPct,
  usd,
  type LiveTrade,
} from '@/lib/receipts';
import { HARNESS_REPO } from '@/lib/constants';

// The live agent record: Claude Code trading the GammaRips pool with real
// money. Every number renders from src/lib/receipts.ts, so the headline can
// never disagree with the table. Complete cohort (forbidden claim 4): every
// closed trade in the window, wins and losses. Never show an account number.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-09-14' -> 'Sep 14'. String math, so no timezone can shift the day. */
const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}`;
};

/** '2026-10-02' -> 'Oct 2, 2026'. */
const longDate = (iso: string) => `${shortDate(iso)}, ${iso.slice(0, 4)}`;

/** A fill per share: two decimals, more only when the broker fill has them. */
const price = (x: number) => `$${x.toFixed(4).replace(/0{1,2}$/, '')}`;

/** 'NVDA260925C00215000' -> '$215 call, exp Sep 25'. */
function describeContract(t: LiveTrade) {
  const rest = t.contract.slice(t.ticker.length);
  const yy = rest.slice(0, 2);
  const mm = Number(rest.slice(2, 4));
  const dd = Number(rest.slice(4, 6));
  const side = rest[6] === 'C' ? 'call' : 'put';
  const strike = Number(rest.slice(7)) / 1000;
  const strikeText = Number.isInteger(strike) ? `$${strike}` : `$${strike.toFixed(2)}`;
  return `${strikeText} ${side}, exp ${MONTHS[mm - 1]} ${dd} '${yy}`;
}

const REASON_LABEL: Record<LiveTrade['exitReason'], string> = {
  target: 'Target',
  stop: 'Stop',
  'end of hold': 'End of hold',
};

function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    <Card className="bg-card/50 text-center">
      <CardContent className="p-5">
        <div className="text-3xl md:text-4xl font-bold font-headline text-primary tabular-nums">{value}</div>
        <p className="text-sm text-muted-foreground mt-2 leading-snug">{caption}</p>
      </CardContent>
    </Card>
  );
}

export function LiveRecord() {
  const tracesUrl = `${HARNESS_REPO}/tree/main/traces`;

  // Names traded, most first. Derived from the table, never typed.
  const byName = Object.entries(
    LIVE_TRADES.reduce<Record<string, number>>((acc, t) => {
      acc[t.ticker] = (acc[t.ticker] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <section className="space-y-8" aria-labelledby="live-record-heading">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Track Record</p>
        <h1
          id="live-record-heading"
          className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight"
        >
          {LIVE_RECORD.wins} of {LIVE_RECORD.trades} real-money trades closed at a profit.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Claude Code trading the GammaRips pool with real money,{' '}
          {LIVE_RECORD.windowLabel}. Each morning the agent reads the pool over
          MCP, chooses its own contract, and sets its target and its stop before
          entry.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <Stat value={usd(LIVE_RECORD.netUsd)} caption={`net realized P&L, all ${LIVE_RECORD.trades} trades`} />
        <Stat
          value={`${LIVE_RECORD.atTarget} of ${LIVE_RECORD.trades}`}
          caption="closed at the target the agent set before entry"
        />
        <Stat value={signedPct(LIVE_RECORD.medianPct, 1)} caption="median trade, on premium" />
      </div>

      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
        Record through {longDate(LIVE_RECORD.asOf)}, updated by hand. Every
        closed trade in the window is below, wins and losses. The agent&apos;s
        day-by-day traces are public in the{' '}
        <a
          href={tracesUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          traces folder on GitHub
        </a>
        .
      </p>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">
            Every real-money trade, {LIVE_RECORD.windowLabel}: {LIVE_RECORD.trades} trades,{' '}
            {LIVE_RECORD.wins} closed at a profit, net {usd(LIVE_RECORD.netUsd)}.
          </caption>
          <thead className="bg-muted/40">
            <tr className="border-b text-left">
              <th scope="col" className="py-2 px-3 font-headline font-bold whitespace-nowrap">Entry day</th>
              <th scope="col" className="py-2 px-3 font-headline font-bold">Ticker</th>
              <th scope="col" className="py-2 px-3 font-headline font-bold">Contract</th>
              <th scope="col" className="py-2 px-3 font-headline font-bold text-right">Entry</th>
              <th scope="col" className="py-2 px-3 font-headline font-bold text-right">Exit</th>
              <th scope="col" className="py-2 px-3 font-headline font-bold text-right whitespace-nowrap">% on premium</th>
              <th scope="col" className="py-2 px-3 font-headline font-bold text-right">P&amp;L</th>
              <th scope="col" className="py-2 px-3 font-headline font-bold whitespace-nowrap">Exit reason</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {LIVE_TRADES.map((t) => {
              const up = t.pnlUsd > 0;
              const tone = up ? 'text-green-500' : 'text-red-500';
              return (
                <tr key={`${t.entryDay}-${t.contract}`} className="border-b last:border-0">
                  <td className="py-2 px-3 whitespace-nowrap">
                    {shortDate(t.entryDay)}
                    {t.exitDay !== t.entryDay && (
                      <span className="block text-[11px]">out {shortDate(t.exitDay)}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-semibold text-foreground">{t.ticker}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {describeContract(t)}
                    <span className="block font-mono text-[11px]">{t.contract}</span>
                  </td>
                  <td className="py-2 px-3 text-right tabular-nums">{price(t.entry)}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{price(t.exit)}</td>
                  <td className={`py-2 px-3 text-right tabular-nums ${tone}`}>{signedPct(t.pnlPct, 1)}</td>
                  <td className={`py-2 px-3 text-right tabular-nums font-semibold ${tone}`}>{usd(t.pnlUsd)}</td>
                  <td className="py-2 px-3 whitespace-nowrap">{REASON_LABEL[t.exitReason]}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-muted/40">
            <tr className="border-t">
              <td className="py-2 px-3 font-semibold" colSpan={5}>
                {LIVE_RECORD.trades} trades · {LIVE_RECORD.wins} closed at a profit · {LIVE_RECORD.atTarget} at target
              </td>
              <td className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                median {signedPct(LIVE_RECORD.medianPct, 1)}
              </td>
              <td className="py-2 px-3 text-right tabular-nums font-bold text-primary">{usd(LIVE_RECORD.netUsd)}</td>
              <td className="py-2 px-3" />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
        Names traded: {byName.map(([name, n]) => `${name} (${n})`).join(', ')}.
        Entry and exit are realized broker fills per share. P&amp;L is in dollars
        for the full position. The premium column is the exit fill against the
        entry fill.
      </p>

      <p className="text-[11px] text-muted-foreground text-center">{RECEIPTS_DISCLAIMER}</p>
    </section>
  );
}
