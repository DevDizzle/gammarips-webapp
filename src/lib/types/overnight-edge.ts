import { Timestamp } from 'firebase/firestore';

export type SignalDirection = 'BULLISH' | 'BEARISH';
export type PlanType = 'free' | 'edge' | 'warroom';

export interface OvernightSignal {
  scan_date: string; // YYYY-MM-DD
  ticker: string;
  direction: SignalDirection;
  overnight_score: number;
  price_change_pct: number;
  underlying_price: number;
  signals: string[]; // human-readable signal tags
  call_dollar_volume: number;
  put_dollar_volume: number;
  call_uoa_depth: number;
  put_uoa_depth: number;
  call_active_strikes: number;
  put_active_strikes: number;
  
  // Enriched Data (Pro/War Room only)
  recommended_contract: string | null;
  recommended_strike: number | null;
  recommended_expiration: string | null;
  recommended_mid_price: number | null;
  contract_score: number | null;
  
  // Technicals
  rsi_14: number | null;
  macd_hist: number | null;
  sma_50: number | null;
  sma_200: number | null;
  above_sma_50: boolean | null;
  above_sma_200: boolean | null;
  golden_cross: boolean | null;
  
  // News/Catalyst
  catalyst_score: number | null;
  catalyst_type: string | null;
  news_summary: string | null;
  key_headline: string | null;
  
  enriched_at: Timestamp;
}

export interface OvernightSummary {
  scan_date: string;
  total_signals: number;
  bullish_count: number;
  bearish_count: number;
  top_bullish: string[]; // Tickers
  top_bearish: string[]; // Tickers
}

export interface UserProfile {
  uid: string;
  email: string;
  plan: PlanType;
  stripe_customer_id?: string;
  subscription_id?: string;
  subscription_status?: string;
  created_at: Timestamp;
}
