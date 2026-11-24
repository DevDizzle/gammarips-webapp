import { unstable_noStore as noStore } from 'next/cache';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/firebase-admin';

export interface XTraderEvent {
  ts_et: string;
  phase: string;
  kind: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface XTraderCandidate {
  ticker: string;
  contract: string;
  funnel_stage: string;
  exclusion_reason: string | null;
  x_alpha_score: number | null;
  disqualified: boolean | null;
  catalyst_category: string | null;
  one_line_verdict: string | null;
  factual_summary: string | null;
  verifiable_bull_catalysts: string[];
  bear_disqualifiers: string[];
  earnings_timing?: string | null;
  retail_pump_noise?: string | null;
  post_count: number | null;
  mark: number | null;
  spread_pct: number | null;
  delta: number | null;
  open_interest: number | null;
  eod_return_pct: number | null;
  eod_mfe_pct: number | null;
  eod_mae_pct: number | null;
}

export interface XTraderTrade {
  book?: 'dual_etf' | 'options' | string;
  ticker: string;
  symbol?: string;
  contract: string;
  side?: 'BULL' | 'BEAR' | string | null;
  instrument_type?: 'etf_2x' | 'etf_inverse' | 'stock_1x' | 'option' | string;
  live: boolean;
  status: 'open' | 'closed' | string;
  x_score: number | null;
  shares?: number | null;
  contracts: number;
  entry_ts_et: string | null;
  entry_fill: number | null;
  cost_usd: number | null;
  stop_price: number | null;
  target_price: number | null;
  exit_session_date?: string | null;
  flat_time_et: string | null;
  exit_ts_et: string | null;
  exit_fill: number | null;
  exit_reason: string | null;
  pnl_usd: number | null;
  pnl_pct: number | null;
}

export interface XTraderLivePosition {
  contract?: string;
  symbol?: string;
  ticker?: string;
  instrument_type?: string;
  bid?: number | null;
  ask?: number | null;
  mark?: number | null;
  stop_price?: number | null;
  unrealized_pnl_usd?: number | null;
  unrealized_pnl_pct?: number | null;
  updated_ts_et?: string | null;
}

export interface XTraderRegime {
  scan_date?: string | null;
  vix?: number | null;
  vix3m?: number | null;
  spy_trend?: string | null;
  regime_rail_pass?: boolean | null;
}

export interface XTraderPoolStats {
  total_screened: number;
  x_scored_count: number;
  disqualified_count: number;
  above_threshold_count: number;
  top_score: number | null;
  top_ticker: string | null;
}

export interface XTraderSession {
  session_date: string;
  mode: 'PAPER' | 'LIVE' | string;
  strategy_mode?: 'both' | 'dual_etf' | 'options' | string;
  stage: string;
  updated_at: string;
  decision: 'TRADE' | 'PASS' | 'PENDING' | 'CLOSED_HOLIDAY' | string;
  decision_reason: string;
  min_x_score: number;
  models?: {
    researcher?: string;
    researcher_thinking?: string;
    scorer?: string;
    scorer_thinking?: string;
  };
  regime: XTraderRegime | null;
  pool_stats: XTraderPoolStats;
  headline: string;
  trade: XTraderTrade | null;
  trades?: XTraderTrade[];
  live_position?: XTraderLivePosition | null;
  featured_analysis: XTraderCandidate | null;
  candidates: XTraderCandidate[];
  events: XTraderEvent[];
}

export interface XTraderCohortStats {
  starting_capital_usd: number | null;
  current_equity_usd: number | null;
  total_pnl_usd: number;
  unrealized_pnl_usd?: number;
  account_roi_pct: number | null;
  capital_deployed_usd: number;
  trade_roi_pct: number | null;
  sessions_count: number;
  trades_closed: number;
  trades_open: number;
  passes: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  avg_return_pct: number | null;
  first_date: string | null;
  last_date: string | null;
}

export interface XTraderEquityPoint {
  date: string;
  mode: string;
  decision: string;
  ticker: string | null;
  pnl_usd: number;
  cumulative_pnl_usd: number;
  equity_usd: number;
}

export interface XTraderSummary {
  updated_at: string;
  active_mode: 'PAPER' | 'LIVE' | string;
  strategy_mode?: 'both' | 'dual_etf' | 'options' | string;
  funded_cash_usd: number;
  min_x_score: number;
  per_trade_fraction: number;
  max_concurrent?: number;
  hold_sessions?: number;
  stop_pct: number;
  flat_time_et: string;
  total_sessions: number;
  first_session_date: string | null;
  latest_session_date: string | null;
  cohorts: {
    paper: XTraderCohortStats;
    live: XTraderCohortStats;
    paper_etf?: XTraderCohortStats;
    paper_options?: XTraderCohortStats;
  };
  equity_curve: XTraderEquityPoint[];
}

function getDb() {
  return getFirestore(getAdminApp());
}

export async function getXTraderSummary(): Promise<XTraderSummary | null> {
  noStore();
  try {
    const snap = await getDb().collection('xtrader_meta').doc('summary').get();
    if (!snap.exists) return null;
    return snap.data() as XTraderSummary;
  } catch (error) {
    console.error('Error fetching xtrader_meta/summary:', error);
    return null;
  }
}

export async function getXTraderSession(sessionDate: string): Promise<XTraderSession | null> {
  noStore();
  try {
    const snap = await getDb().collection('xtrader_sessions').doc(sessionDate).get();
    if (!snap.exists) return null;
    return snap.data() as XTraderSession;
  } catch (error) {
    console.error(`Error fetching xtrader_sessions/${sessionDate}:`, error);
    return null;
  }
}

export async function getXTraderSessions(limit: number = 60): Promise<XTraderSession[]> {
  noStore();
  try {
    const snap = await getDb()
      .collection('xtrader_sessions')
      .orderBy('session_date', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map((d) => d.data() as XTraderSession);
  } catch (error) {
    console.error('Error fetching xtrader_sessions:', error);
    return [];
  }
}
