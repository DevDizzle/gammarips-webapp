
import { z } from 'zod';

export const StockSchema = z.object({
  id: z.string(), // Document ID is the ticker
  company_name: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  image_uri: z.string().optional(),
  bundle_gcs_path: z.string().optional(),
  recommendation_analysis: z.string().optional().nullable(),
  recommendation: z.string().optional(),
  pages_json: z.string().optional(),
  dashboard_json: z.string().optional().nullable(),
  weighted_score: z.number().optional(),
  news: z.string().optional().nullable(),
  financials: z.string().optional().nullable(),
  earnings_transcript: z.string().optional().nullable(),
  mda: z.string().optional().nullable(),
  technicals: z.string().optional().nullable(),
});
export type Stock = z.infer<typeof StockSchema>;

export const TickerEventSchema = z.object({
    id: z.string(),
    event_name: z.string(),
    event_date: z.string(),
    event_type: z.string().optional(),
    ticker: z.string().nullable(),
});
export type TickerEvent = z.infer<typeof TickerEventSchema>;


export const OptionCandidateSchema = z.object({
  id: z.string(),
  contract_symbol: z.string(),
  ticker: z.string(),
  company_name: z.string(),
  industry: z.string().optional().nullable(),
  image_uri: z.string().optional().nullable(),
  option_type: z.enum(['call', 'put']),
  expiration_date: z.string(),
  strike: z.number(),
  last_price: z.number().nullable(),
  volume: z.number().nullable(),
  implied_volatility: z.number().optional().nullable(),
  options_score: z.number(),
  stock_outlook_signal: z.string(),
});
export type OptionCandidate = z.infer<typeof OptionCandidateSchema>;

// This schema now includes all fields required by MarketMovers and SignalTracker
export const PerformanceSignalSchema = z.object({
    id: z.string(),
    contract_symbol: z.string(),
    ticker: z.string(),
    company_name: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    image_uri: z.string().optional().nullable(),
    option_type: z.string().optional().nullable(),
    strike_price: z.number(),
    initial_price: z.number(),
    current_price: z.number(),
    percent_gain: z.number(),
    run_date: z.string(),
    expiration_date: z.string(),
    status: z.string().optional().nullable(),
});
export type PerformanceSignal = z.infer<typeof PerformanceSignalSchema>;

export const OptionsSignalSchema = z.object({
    id: z.string().optional(), // Adding ID for React keys
    contract_symbol: z.string(),
    expiration_date: z.string(),
    implied_volatility: z.number(),
    volatility_comparison_signal: z.string().optional(),
    option_type: z.enum(['call', 'put']),
    run_date: z.string(),
    setup_quality_signal: z.string().optional(),
    stock_price_trend_signal: z.string().optional(),
    strike_price: z.number(),
    summary: z.string(),
    ticker: z.string(),
    company_name: z.string(),
});
export type OptionsSignal = z.infer<typeof OptionsSignalSchema>;

export const WinnerSchema = z.object({
    id: z.string(),
    company_name: z.string().nullable(),
    image_uri: z.string().optional().nullable(),
    industry: z.string().nullable(),
    sector: z.string().optional().nullable(),
    last_close: z.number(),
    outlook_signal: z.string().nullable(),
    run_date: z.string().nullable(),
    thirty_day_change_pct: z.number(),
    ticker: z.string(),
    weighted_score: z.number().nullable(),
    option_type: z.enum(['call', 'put']),
    strike_price: z.preprocess((val) => (typeof val === 'number' ? val : parseFloat(val as string)), z.number()),
    expiration_date: z.string(),
    options_score: z.number().optional().nullable(),
    contract_symbol: z.string(),
    setup_quality_signal: z.string().optional(),
    volatility_comparison_signal: z.string().optional(),
    summary: z.string().optional(),
    dashboard_json: z.string().optional().nullable(),
    recommendation_analysis: z.string().optional().nullable(),
});
export type Winner = z.infer<typeof WinnerSchema>;

export const FeedbackSurveyDataSchema = z.object({
  perceivedValue: z.string(),
  mostUseful: z.string().optional(),
  improvementSuggestion: z.string(),
});
export type FeedbackSurveyData = z.infer<typeof FeedbackSurveyDataSchema>;

export const WatchlistItemSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  contract_symbol: z.string().optional().nullable(),
  type: z.enum(['stock', 'option']),
  addedAt: z.string(), // ISO String
  initial_price: z.number().optional().nullable(),
  current_price: z.number().optional().nullable(), // Added for real-time tracking
  company_name: z.string().optional().nullable(), // For UI convenience
});
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;
