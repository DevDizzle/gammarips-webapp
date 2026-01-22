export interface MarketStructure {
  total_call_vol: number;
  total_put_vol: number;
  total_call_oi: number;
  total_put_oi: number;
  net_call_gamma: number;
  net_put_gamma: number;
  call_wall: number;
  put_wall: number;
  max_iv_strike: number;
  put_call_vol_ratio: number;
  top_active_contracts: Array<{
    option_type: 'call' | 'put';
    strike: number;
    expiration_date: string;
    volume: number;
    open_interest: number;
    implied_volatility: number;
    last_price: number;
  }>;
}

export interface OptionsBrief {
  headline: string;
  content: string; // HTML
  marketStructure?: MarketStructure;
}

export interface FundamentalThesis {
  headline: string;
  content: string; // HTML
  catalysts: string[];
}

export interface TradeSetup {
  signal: string;
  confidence: string;
  strategy: string;
  catalyst: string;
  suggestedOption?: {
    type: 'call' | 'put';
    strike: number;
    expirationDate: string;
    contractSymbol?: string;
    dte: number;
    setupQuality?: string;
    summary?: string;
  };
}

export interface FullAnalysis {
    news?: string;
    technicals?: string;
    "md&a"?: string;
    transcript?: string;
    financials?: string;
    fundamentals?: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface KPI {
  value: string | number;
  signal: 'bullish' | 'bearish' | 'neutral' | 'positive' | 'negative' | 'weakening' | 'high' | 'moderate';
  tooltip: string;
  [key: string]: any; // For flexible extra props like 'sma50', 'volume', etc.
}

export interface PriceChartData {
  candlestick: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }>;
  volume: Array<{ date: string; value: number }>;
  sma50?: Array<{ date: string; value: number }>;
  sma200?: Array<{ date: string; value: number }>;
}

export interface DashboardDataV2 {
  ticker: string;
  runDate: string;
  titleInfo: {
    companyName: string;
    ticker: string;
    asOfDate: string;
  };
  kpis: {
    trendStrength: KPI;
    rsiMomentum: KPI;
    volumeSurge: KPI;
    historicalVolatility: KPI;
    thirtyDayChange: KPI;
  };
  priceChartData: PriceChartData;
  
  // Flattened Analysis Structure
  summary?: {
      signal: string;
      score: number;
      confidence: string;
  };
  tradeSetup?: TradeSetup;
  marketStructure?: MarketStructure;
  fundamentalThesis?: FundamentalThesis;
  optionsBrief?: OptionsBrief; // Legacy / Specific V1
  
  // New Rich Content
  fullAnalysis?: FullAnalysis;
  faq?: FAQItem[];

  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
    h1: string;
  };
  schemaOrg?: Record<string, any>;
  
  // Backward compatibility (Optional)
  analysis?: {
      summary: any;
      optionsBrief?: OptionsBrief;
      fundamentalThesis?: FundamentalThesis;
      tradeSetup?: TradeSetup;
  };
}
