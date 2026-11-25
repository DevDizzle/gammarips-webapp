import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getXTraderSession,
  getXTraderSessions,
  getXTraderSummary,
  type XTraderSession,
} from '@/lib/xtrader';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BG = '#181c25';
const CARD = '#1f2430';
const CARD_INNER = '#141821';
const BORDER = '#333b4d';
const PRIMARY = '#b7e619';
const GOLD = '#e6b319';
const EMERALD = '#34d399';
const RED = '#f87171';
const FG = '#e2ecf7';
const MUTED = '#94a3b8';

function fmtUsd(val: number | null | undefined, signed = false): string {
  if (val === null || val === undefined || !Number.isFinite(val)) return '--';
  const abs = Math.abs(val).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (val < 0) return `-$${abs}`;
  if (signed && val > 0) return `+$${abs}`;
  return `$${abs}`;
}

function fmtPct(frac: number | null | undefined, signed = false): string {
  if (frac === null || frac === undefined || !Number.isFinite(frac)) return '--';
  const pct = frac * 100;
  const sign = signed && pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function fmtDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(Date.UTC(y, m - 1, d))
    .toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase();
}

function truncate(text: string | null | undefined, maxLen: number): string {
  const s = (text || '').trim();
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen - 3);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '...';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestedDate = (searchParams.get('date') || '').trim();
  const slot = (searchParams.get('slot') || 'eod').toLowerCase();
  const tickersParam = (searchParams.get('tickers') || '').trim();
  const poolParam = Number(searchParams.get('pool') || '0');

  const summary = await getXTraderSummary();
  let session: XTraderSession | null = null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    session = await getXTraderSession(requestedDate);
  }
  if (!session) {
    const recent = await getXTraderSessions(15);
    session =
      recent.find((s) => s.decision === 'TRADE' || s.decision === 'PASS') ||
      recent[0] ||
      null;
  }

  const displayDate =
    (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate) ||
    session?.session_date ||
    new Date().toISOString().slice(0, 10);

  const mode = session?.mode === 'LIVE' ? 'LIVE' : 'PAPER';
  const cohortKey = mode === 'LIVE' ? 'live' : 'paper';
  const cohort = summary?.cohorts?.[cohortKey];

  const runningPnl = cohort?.total_pnl_usd ?? 0;
  const tradesClosed = cohort?.trades_closed ?? 0;
  const wins = cohort?.wins ?? 0;
  const losses = cohort?.losses ?? 0;
  const winRate = cohort?.win_rate;
  const sessionsCount = cohort?.sessions_count ?? (session ? 1 : 0);
  const roi =
    cohort?.trade_roi_pct !== null && cohort?.trade_roi_pct !== undefined
      ? cohort.trade_roi_pct
      : cohort?.account_roi_pct ?? 0;

  const isMorning = slot === 'morning';
  const morningTickers = tickersParam
    ? tickersParam
        .split(',')
        .map((t) => t.trim().toUpperCase().replace(/[^A-Z0-9.]/g, ''))
        .filter(Boolean)
        .slice(0, 3)
    : (session?.candidates || [])
        .map((c) => c.ticker)
        .filter(Boolean)
        .slice(0, 3);
  const morningPoolCount =
    Number.isFinite(poolParam) && poolParam > 0
      ? Math.floor(poolParam)
      : session?.pool_stats?.total_screened || 0;

  const trade = session?.trade || null;
  const isTrade = !isMorning && session?.decision === 'TRADE' && trade !== null;
  const featured = session?.featured_analysis || null;
  const scoredAll = (session?.candidates || []).filter(
    (c) => c.x_alpha_score !== null && c.x_alpha_score !== undefined
  );
  const topEligible = scoredAll.filter((c) => !c.disqualified);
  const topDisq = scoredAll
    .filter((c) => c.disqualified)
    .sort((a, b) => (b.x_alpha_score ?? 0) - (a.x_alpha_score ?? 0));
  const scoredTop = [
    ...topEligible.slice(0, topDisq.length > 0 ? 1 : 3),
    ...topDisq.slice(0, 2),
    ...topEligible.slice(1),
  ].slice(0, 3);

  const badgeText = isMorning
    ? 'MORNING COMBO A SCAN'
    : isTrade
    ? trade?.status === 'open'
      ? 'LIVE POSITION'
      : 'TRADE EXECUTED'
    : 'PASS · STAYED IN CASH';

  const badgeColor = isMorning ? PRIMARY : isTrade ? EMERALD : GOLD;
  const badgeBg = isMorning
    ? 'rgba(183, 230, 25, 0.14)'
    : isTrade
    ? 'rgba(52, 211, 153, 0.16)'
    : 'rgba(230, 179, 25, 0.16)';

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1080px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: BG,
          backgroundImage:
            'radial-gradient(circle at 88% 12%, rgba(183, 230, 25, 0.14) 0%, rgba(24, 28, 37, 0) 46%), radial-gradient(circle at 12% 90%, rgba(230, 179, 25, 0.10) 0%, rgba(24, 28, 37, 0) 45%)',
          padding: '54px',
          color: FG,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Brand + Date Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '42px',
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              <span style={{ color: FG }}>Gamma</span>
              <span style={{ color: PRIMARY }}>Rips</span>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '18px',
                fontWeight: 700,
                color: BG,
                backgroundColor: PRIMARY,
                padding: '6px 14px',
                borderRadius: '999px',
                letterSpacing: '0.06em',
              }}
            >
              X-TRADER
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                fontSize: '18px',
                fontWeight: 700,
                color: mode === 'LIVE' ? EMERALD : GOLD,
                border: `2px solid ${mode === 'LIVE' ? EMERALD : GOLD}`,
                padding: '6px 14px',
                borderRadius: '999px',
                letterSpacing: '0.06em',
              }}
            >
              {mode === 'LIVE' ? 'LIVE CAPITAL' : 'PAPER MODE'}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '20px',
                fontWeight: 600,
                color: MUTED,
                letterSpacing: '0.04em',
              }}
            >
              {fmtDate(displayDate)}
            </div>
          </div>
        </div>

        {/* Main Center Content Panel */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: CARD,
            border: `2px solid ${BORDER}`,
            borderRadius: '28px',
            padding: '44px',
            flexGrow: 1,
            marginTop: '32px',
            marginBottom: '32px',
          }}
        >
          {/* Decision Pill + Model Stamp */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '22px',
                fontWeight: 800,
                color: badgeColor,
                backgroundColor: badgeBg,
                border: `2px solid ${badgeColor}`,
                padding: '10px 22px',
                borderRadius: '999px',
                letterSpacing: '0.08em',
              }}
            >
              {badgeText}
            </div>
            <div style={{ display: 'flex', fontSize: '18px', color: MUTED, fontWeight: 600 }}>
              Gemini 4 AI Agent · Stocks, 2x ETFs &amp; Options
            </div>
          </div>

          {/* Center Body: Morning vs TRADE vs PASS */}
          {isMorning ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', fontSize: '58px', fontWeight: 800, lineHeight: 1.08 }}>
                  {morningPoolCount > 0
                    ? `${morningPoolCount} Liquid Setups Passed Filter`
                    : 'Pre-Market Liquid Setups Live'}
                </div>
                <div style={{ display: 'flex', fontSize: '24px', color: MUTED }}>
                  Stocks, 2x/Inverse ETFs &amp; Liquid Options · Mid &gt;= $1 · OI &gt;= 500
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    fontSize: '19px',
                    color: PRIMARY,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                  }}
                >
                  TOP WATCHLIST BEFORE 10:05 ET CATALYST SCAN
                </div>
                <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap' }}>
                  {(morningTickers.length > 0 ? morningTickers : ['LIVE SCAN']).map((tk) => (
                    <div
                      key={tk}
                      style={{
                        display: 'flex',
                        fontSize: '44px',
                        fontWeight: 800,
                        color: FG,
                        backgroundColor: CARD_INNER,
                        border: `2px solid ${PRIMARY}`,
                        borderRadius: '18px',
                        padding: '18px 34px',
                      }}
                    >
                      ${tk}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', fontSize: '23px', color: MUTED, lineHeight: 1.4 }}>
                Parallel Gemini 4 Researcher and Scorer pairs evaluate 24h X catalyst activity at
                10:05 ET. Gate: score &gt;= 60 or stay in cash.
              </div>
            </div>
          ) : isTrade && trade ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', fontSize: '74px', fontWeight: 800, lineHeight: 1 }}>
                    ${trade.ticker}
                  </div>
                  <div style={{ display: 'flex', fontSize: '24px', color: MUTED, fontWeight: 600 }}>
                    {trade.contract} · X-Score {trade.x_score ?? '--'}/100
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: '64px',
                      fontWeight: 800,
                      lineHeight: 1,
                      color:
                        (trade.pnl_usd ?? 0) > 0
                          ? EMERALD
                          : (trade.pnl_usd ?? 0) < 0
                          ? RED
                          : FG,
                    }}
                  >
                    {trade.status === 'closed'
                      ? fmtUsd(trade.pnl_usd, true)
                      : fmtUsd(session?.live_position?.unrealized_pnl_usd ?? 0, true)}
                  </div>
                  <div style={{ display: 'flex', fontSize: '26px', color: MUTED, fontWeight: 700 }}>
                    {trade.status === 'closed'
                      ? `${fmtPct(trade.pnl_pct, true)} (${fmtUsd(trade.entry_fill)} -> ${fmtUsd(trade.exit_fill)})`
                      : `Entry ${fmtUsd(trade.entry_fill)} · Stop ${fmtUsd(trade.stop_price)}`}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  backgroundColor: CARD_INNER,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '18px',
                  padding: '26px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: PRIMARY,
                    letterSpacing: '0.08em',
                  }}
                >
                  AGENT VERDICT
                </div>
                <div style={{ display: 'flex', fontSize: '25px', color: FG, lineHeight: 1.4 }}>
                  {truncate(
                    featured?.one_line_verdict ||
                      featured?.factual_summary ||
                      session?.headline,
                    190
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginTop: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', fontSize: '46px', fontWeight: 800, lineHeight: 1.12 }}>
                  No Unpriced Catalyst Cleared the 60-Point Gate
                </div>
                <div style={{ display: 'flex', fontSize: '24px', color: MUTED }}>
                  Screened {session?.pool_stats?.total_screened ?? 0} liquid setups · Top score:{' '}
                  {session?.pool_stats?.top_ticker
                    ? `$${session.pool_stats.top_ticker} (${session.pool_stats.top_score}/100)`
                    : 'None'}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {scoredTop.map((cand) => (
                  <div
                    key={cand.ticker}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: CARD_INNER,
                      border: `1px solid ${cand.disqualified ? 'rgba(248, 113, 113, 0.45)' : BORDER}`,
                      borderRadius: '16px',
                      padding: '18px 22px',
                      gap: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                      <div style={{ display: 'flex', fontSize: '28px', fontWeight: 800, width: '108px' }}>
                        ${cand.ticker}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          fontSize: '20px',
                          fontWeight: 700,
                          color: cand.disqualified ? RED : GOLD,
                          backgroundColor: cand.disqualified
                            ? 'rgba(248, 113, 113, 0.14)'
                            : 'rgba(230, 179, 25, 0.14)',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          minWidth: '140px',
                          justifyContent: 'center',
                        }}
                      >
                        {cand.disqualified ? `${cand.x_alpha_score} · DISQ` : `Score ${cand.x_alpha_score}`}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        fontSize: '20px',
                        color: MUTED,
                        flexGrow: 1,
                        lineHeight: 1.3,
                      }}
                    >
                      {truncate(cand.one_line_verdict, 92)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Strip inside card: Regime */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${BORDER}`,
              paddingTop: '20px',
              fontSize: '19px',
              color: MUTED,
            }}
          >
            <div style={{ display: 'flex' }}>
              {session?.regime?.vix
                ? `Regime: VIX ${session.regime.vix} / VIX3M ${session.regime.vix3m ?? '--'} · SPY ${session.regime.spy_trend ?? '--'}`
                : 'Daily Rules: 10:05 ET X-Alpha · 10:15 ET Entry · -25% Stop · 15:45 ET Flat'}
            </div>
            <div style={{ display: 'flex', color: PRIMARY, fontWeight: 700 }}>
              gammarips.com/xtrader
            </div>
          </div>
        </div>

        {/* Running Performance Strip */}
        <div style={{ display: 'flex', gap: '18px', width: '100%' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              backgroundColor: CARD,
              border: `2px solid ${BORDER}`,
              borderRadius: '18px',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', fontSize: '16px', color: MUTED, fontWeight: 700 }}>
              RUNNING P&amp;L
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '36px',
                fontWeight: 800,
                marginTop: '6px',
                color: runningPnl > 0 ? EMERALD : runningPnl < 0 ? RED : FG,
              }}
            >
              {fmtUsd(runningPnl, true)}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              backgroundColor: CARD,
              border: `2px solid ${BORDER}`,
              borderRadius: '18px',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', fontSize: '16px', color: MUTED, fontWeight: 700 }}>
              ROI
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '36px',
                fontWeight: 800,
                marginTop: '6px',
                color: roi > 0 ? EMERALD : roi < 0 ? RED : FG,
              }}
            >
              {fmtPct(roi, true)}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              backgroundColor: CARD,
              border: `2px solid ${BORDER}`,
              borderRadius: '18px',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', fontSize: '16px', color: MUTED, fontWeight: 700 }}>
              TRADES / WIN RATE
            </div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 800, marginTop: '6px' }}>
              {tradesClosed > 0 ? `${wins}W-${losses}L (${fmtPct(winRate)})` : '0 Trades'}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              backgroundColor: CARD,
              border: `2px solid ${BORDER}`,
              borderRadius: '18px',
              padding: '20px 24px',
            }}
          >
            <div style={{ display: 'flex', fontSize: '16px', color: MUTED, fontWeight: 700 }}>
              SESSIONS
            </div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 800, marginTop: '6px' }}>
              {sessionsCount} Logged
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '22px',
            fontSize: '16px',
            color: MUTED,
          }}
        >
          <div style={{ display: 'flex' }}>
            {mode === 'LIVE'
              ? 'Real-money reference agent log · Complete cohort shown'
              : 'Simulated paper trading ($2,500 baseline) · Complete cohort shown'}
          </div>
          <div style={{ display: 'flex' }}>Educational market data only. Not investment advice.</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    }
  );

  return image;
}
