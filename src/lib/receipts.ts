// The approved numbers: the ONLY source for performance and quality numbers on
// the site. Owner-approved 2026-10-02 (gammarips-engine
// docs/DECISIONS/2026-10-02-web-revamp-positive-first-rules.md). Never type one
// of these as a literal in a page. Recompute from the named source before you
// change a value, and change the as-of date with it.
//
// Every number carries its N and window on the page, and the section that shows
// it carries the not-investment-advice marker (forbidden claim 5).

// LIVE_RECORD: Claude Code trading the GammaRips pool with real money in an
// agent brokerage account. Source: gammarips-trader `scripts/tally.py
// --account LIVE` over eval/trades.jsonl. Realized fills from the broker.
// Complete cohort: every trade in the window, wins and losses (claim 4).
// Never show the account number.
export type LiveTrade = {
  entryDay: string; // YYYY-MM-DD, entry session (ET)
  exitDay: string;
  ticker: string;
  contract: string; // OCC symbol, no "O:" prefix
  entry: number; // fill, per share
  exit: number;
  pnlPct: number; // fraction on premium, from the two fills
  pnlUsd: number; // realized
  exitReason: 'target' | 'stop' | 'end of hold';
};

export const LIVE_TRADES: LiveTrade[] = [
  { entryDay: '2026-09-14', exitDay: '2026-09-15', ticker: 'BE', contract: 'BE261016C00300000', entry: 10.68, exit: 14.0, pnlPct: 0.3109, pnlUsd: 332, exitReason: 'target' },
  { entryDay: '2026-09-16', exitDay: '2026-09-17', ticker: 'NVDA', contract: 'NVDA260925C00215000', entry: 4.7, exit: 6.25, pnlPct: 0.3298, pnlUsd: 310, exitReason: 'target' },
  { entryDay: '2026-09-17', exitDay: '2026-09-17', ticker: 'TSLA', contract: 'TSLA260925C00365000', entry: 12.85, exit: 9.2, pnlPct: -0.284, pnlUsd: -365, exitReason: 'stop' },
  { entryDay: '2026-09-18', exitDay: '2026-09-18', ticker: 'NVDA', contract: 'NVDA260925C00222500', entry: 2.15, exit: 2.69, pnlPct: 0.2512, pnlUsd: 270, exitReason: 'target' },
  { entryDay: '2026-09-21', exitDay: '2026-09-21', ticker: 'NVDA', contract: 'NVDA260928C00225000', entry: 2.92, exit: 3.6, pnlPct: 0.2329, pnlUsd: 476, exitReason: 'target' },
  { entryDay: '2026-09-22', exitDay: '2026-09-22', ticker: 'NVDA', contract: 'NVDA261002C00230000', entry: 4.0, exit: 4.8, pnlPct: 0.2, pnlUsd: 400, exitReason: 'target' },
  { entryDay: '2026-09-23', exitDay: '2026-09-23', ticker: 'NVDA', contract: 'NVDA261002C00232500', entry: 2.23, exit: 1.5317, pnlPct: -0.3131, pnlUsd: -419, exitReason: 'stop' },
  { entryDay: '2026-09-24', exitDay: '2026-09-24', ticker: 'INTC', contract: 'INTC261002C00125000', entry: 4.645, exit: 5.9, pnlPct: 0.2702, pnlUsd: 251, exitReason: 'target' },
  { entryDay: '2026-09-25', exitDay: '2026-09-25', ticker: 'NVDA', contract: 'NVDA261002C00227500', entry: 2.18, exit: 2.77, pnlPct: 0.2706, pnlUsd: 413, exitReason: 'target' },
  { entryDay: '2026-09-28', exitDay: '2026-09-29', ticker: 'SPCX', contract: 'SPCX261009C00155000', entry: 2.16, exit: 2.7, pnlPct: 0.25, pnlUsd: 378, exitReason: 'target' },
  { entryDay: '2026-09-29', exitDay: '2026-10-01', ticker: 'NVDA', contract: 'NVDA261016C00232500', entry: 5.0, exit: 5.4, pnlPct: 0.08, pnlUsd: 120, exitReason: 'end of hold' },
  { entryDay: '2026-09-30', exitDay: '2026-10-01', ticker: 'SPCX', contract: 'SPCX261009C00155000', entry: 2.58, exit: 3.2, pnlPct: 0.2403, pnlUsd: 372, exitReason: 'target' },
  { entryDay: '2026-10-01', exitDay: '2026-10-01', ticker: 'INTC', contract: 'INTC261009C00125000', entry: 1.99, exit: 2.58, pnlPct: 0.2965, pnlUsd: 295, exitReason: 'target' },
  { entryDay: '2026-10-02', exitDay: '2026-10-02', ticker: 'NVDA', contract: 'NVDA261009C00235000', entry: 5.15, exit: 3.25, pnlPct: -0.3689, pnlUsd: -570, exitReason: 'stop' },
];

// Derived from LIVE_TRADES so the headline can never disagree with the table.
const wins = LIVE_TRADES.filter((t) => t.pnlUsd > 0);
const sortedPct = LIVE_TRADES.map((t) => t.pnlPct).sort((a, b) => a - b);
const mid = Math.floor(sortedPct.length / 2);

export const LIVE_RECORD = {
  asOf: '2026-10-02',
  windowLabel: 'Sep 14 to Oct 2, 2026',
  firstEntry: LIVE_TRADES[0].entryDay,
  lastEntry: LIVE_TRADES[LIVE_TRADES.length - 1].entryDay,
  trades: LIVE_TRADES.length, // 14
  wins: wins.length, // 11
  losses: LIVE_TRADES.length - wins.length, // 3
  netUsd: LIVE_TRADES.reduce((s, t) => s + t.pnlUsd, 0), // 2263
  atTarget: LIVE_TRADES.filter((t) => t.exitReason === 'target').length, // 10
  medianPct:
    sortedPct.length % 2 ? sortedPct[mid] : (sortedPct[mid - 1] + sortedPct[mid]) / 2, // ~0.245
} as const;

// POOL_HIT_RATES: how often pool contracts hit a profit level. Source: the MCP
// query_outcomes(view="harvest") query over enriched_features_v1 joined to
// enriched_option_outcomes, opp_status='OK'. A TOUCH, not a fill and not profit
// kept: write it as "hit +50% within 3 trading days". stopTouch30 is exit-lab
// context: most contracts touch both sides, so the exit plan decides the result.
export const POOL_HIT_RATES = {
  n: 1150,
  scanDays: 25,
  windowLabel: 'scan dates Aug 24 to Sep 28, 2026',
  horizon: '3 trading days',
  hit25: 0.528,
  hit50: 0.345,
  hit100: 0.159,
  medianPeak: 0.277,
  stopTouch30: 0.741,
} as const;

// CONTRACT_QUALITY: the liquidity rule (live 2026-08-24), BULLISH pool
// contracts in overnight_signals_enriched. After: N=1,300, 28 scan days
// 2026-08-24 to 2026-10-01. Before: N=3,501, the 60 scan days 2026-05-27 to
// 2026-08-21. Do not use the old 893 / 233 / 86 (window not recorded).
// noFill is a STUDY (60 sessions ending 2026-08-14, 3,190 vs 545 legs): label it.
export const CONTRACT_QUALITY = {
  medianOi: { after: 4664, before: 906 },
  medianVolume: { after: 1039, before: 232 },
  p10Oi: { after: 1635, before: 29 },
  nAfter: 1300,
  nBefore: 3501,
  afterLabel: 'pool contracts Aug 24 to Oct 1, 2026',
  beforeLabel: 'the 60 scan days before the rule',
  beforeWindow: 'May 27 to Aug 21, 2026',
  noFill: {
    before: 0.405,
    after: 0.061,
    nBefore: 3190, // legs, old flow-first pool
    nAfter: 545, // legs, liquid funnel
    label: '60-session study ending Aug 14, 2026',
  },
} as const;

// One line for every section that shows a number above (claim 5).
export const RECEIPTS_DISCLAIMER =
  'Past results: real-money trades and historical pool data. Educational only. Not investment advice.';

// INSTALL_LINKS: the homepage install buttons. Until a directory listing is
// live, each one points at that client's connect steps on /developers. The
// anchors are section ids on /developers; keep both sides in step.
export const INSTALL_LINKS = [
  { id: 'claude', label: 'Claude', href: '/developers#claude' },
  { id: 'chatgpt', label: 'ChatGPT', href: '/developers#chatgpt' },
  { id: 'cursor', label: 'Cursor', href: '/developers#cursor' },
  { id: 'codex', label: 'Codex', href: '/developers#codex' },
] as const;

// Display helpers.
export const pct = (x: number, digits = 0) => `${(x * 100).toFixed(digits)}%`;
export const signedPct = (x: number, digits = 0) =>
  `${x >= 0 ? '+' : '−'}${Math.abs(x * 100).toFixed(digits)}%`;
export const usd = (x: number) =>
  `${x >= 0 ? '+' : '−'}$${Math.abs(x).toLocaleString('en-US')}`;
export const int = (x: number) => x.toLocaleString('en-US');
