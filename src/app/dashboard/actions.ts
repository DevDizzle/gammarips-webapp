'use server';

import { getMarketIndices as fetchMarketIndices, getPutCallRatio, type MarketIndex } from '@/lib/fmp';
import { getSmartNews as fetchSmartNews, type NewsItem } from '@/lib/polygon';
import { getWinnersDashboardAdmin, getPerformanceSignals, type Winner, type PerformanceSignal } from '@/lib/firebase-admin';

/**
 * Fetches the global market indices and key metrics (SPY, VIX, PCR, US10Y, Oil)
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  const [indices, pcr] = await Promise.all([
    fetchMarketIndices(),
    getPutCallRatio()
  ]);

  // Create the PCR object
  const pcrIndex: MarketIndex = {
    symbol: 'PCR',
    name: 'Put/Call Ratio',
    price: pcr,
    changesPercentage: 0, // N/A for now
    change: 0
  };

  // Combine and Sort: SPY, ^VIX, PCR, ^TNX, CLUSD
  const order = ['SPY', '^VIX', 'PCR', '^TNX', 'CLUSD'];
  const allMetrics = [...indices, pcrIndex];

  return allMetrics.sort((a, b) => {
    return order.indexOf(a.symbol) - order.indexOf(b.symbol);
  });
}

/**
 * Fetches filtered news.
 */
export async function getSmartNews(tickers?: string[]) {
  if (tickers && tickers.length > 0) {
      return await fetchSmartNews({ ticker: tickers[0] });
  }
  return await fetchSmartNews();
}

export interface PublicDashboardData {
  bullish: { items: Winner[], total: number };
  bearish: { items: Winner[], total: number };
  gainers: { items: PerformanceSignal[], total: number };
  losers: { items: PerformanceSignal[], total: number };
  lastUpdated: string | null;
}

/**
 * Fetches the "Public" version of the dashboard data.
 * Returns top 3 items for each category and total counts.
 */
export async function getPublicDashboardData(): Promise<PublicDashboardData> {
  try {
    const [allWinners, topGainers, topLosers] = await Promise.all([
      getWinnersDashboardAdmin(),
      getPerformanceSignals('desc', 10),
      getPerformanceSignals('asc', 10)
    ]);

    // Process Winners (Bullish/Bearish)
    const bullish: Winner[] = allWinners.filter((w: Winner) => w.option_type.toLowerCase().includes('call'));
    const bearish: Winner[] = allWinners.filter((w: Winner) => w.option_type.toLowerCase().includes('put'));

    // Helper to sort and slice
    // We explicitly type 'list' as Winner[] to avoid generic inference issues, 
    // or we can make it generic but TypeScript sometimes struggles with mixed constraints.
    // Since we only use it for Winners here:
    const processList = (list: Winner[], sortDesc: boolean) => {
        const sorted = [...list].sort((a, b) => {
            const scoreA = a.weighted_score ?? 0;
            const scoreB = b.weighted_score ?? 0;
            return sortDesc ? scoreB - scoreA : scoreA - scoreB;
        });
        return {
            items: sorted.slice(0, 10),
            total: list.length
        };
    };

    // Helper for performance signals
    const processPerf = (list: PerformanceSignal[]) => ({
        items: list.slice(0, 10),
        total: list.length
    });

    // Get last updated date
    let lastUpdated: string | null = null;
    if (allWinners.length > 0) {
        try {
            lastUpdated = new Date(allWinners[0].run_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC'
            });
        } catch (e) {}
    }

    return {
      bullish: processList(bullish, true),
      bearish: processList(bearish, true),
      gainers: processPerf(topGainers),
      losers: processPerf(topLosers),
      lastUpdated
    };

  } catch (error) {
    console.error("Failed to fetch public dashboard data:", error);
    return {
        bullish: { items: [], total: 0 },
        bearish: { items: [], total: 0 },
        gainers: { items: [], total: 0 },
        losers: { items: [], total: 0 },
        lastUpdated: null
    };
  }
}
