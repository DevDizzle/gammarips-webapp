
'use server';

import { getMarketIndices as fetchMarketIndices, getPutCallRatio, type MarketIndex } from '@/lib/fmp';
import { getSmartNews as fetchSmartNews } from '@/lib/polygon';
import { getWinnersDashboardAdmin, getPerformanceSignals, getPerformanceTrackerStatsAdmin, getPerformanceTrackingStartDateAdmin, type Winner, type PerformanceSignal, type PerformanceStats } from '@/lib/firebase-admin';

/**
 * Fetches the global market indices and key metrics (SPY, VIX, PCR, US10Y, Oil)
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  const [indices, pcr] = await Promise.all([
    fetchMarketIndices(),
    getPutCallRatio()
  ]);

  const allMetrics: MarketIndex[] = [...indices];

  // Always add PCR, even if null (to maintain grid alignment)
  allMetrics.push({
    symbol: 'PCR',
    name: 'Put/Call Ratio',
    price: pcr, // can be null
    changesPercentage: 0,
    change: 0
  });

  // Combine and Sort: SPY, ^VIX, PCR, ^TNX, CLUSD
  const order = ['SPY', '^VIX', 'PCR', '^TNX', 'CLUSD'];

  return allMetrics.sort((a, b) => {
    return order.indexOf(a.symbol) - order.indexOf(b.symbol);
  });
}

/**
 * Fetches filtered news.
 */
export async function getSmartNews(params?: string[] | { limit?: number }) {
  if (Array.isArray(params) && params.length > 0) {
      return await fetchSmartNews({ ticker: params[0] });
  }
  if (params && !Array.isArray(params)) {
      return await fetchSmartNews(params);
  }
  return await fetchSmartNews();
}

export interface LandingPageData {
  bullish: { items: Winner[], total: number };
  bearish: { items: Winner[], total: number };
  gainers: { items: PerformanceSignal[], total: number };
  losers: { items: PerformanceSignal[], total: number };
  performanceStats: PerformanceStats;
  lastUpdated: string | null;
  trackingStartDate: string | null;
}

/**
 * Fetches the data for the unified landing page.
 * Returns top 3 items for each category and total counts.
 */
export async function getLandingPageData(): Promise<LandingPageData> {
  try {
    const [allWinners, topGainers, topLosers, performanceStats, trackingStartDate] = await Promise.all([
      getWinnersDashboardAdmin(),
      getPerformanceSignals('desc', 10),
      getPerformanceSignals('asc', 10),
      getPerformanceTrackerStatsAdmin(),
      getPerformanceTrackingStartDateAdmin()
    ]);

    // Process Winners (Bullish/Bearish)
    // Filter for CALL/PUT
    const bullish: Winner[] = allWinners.filter((w: Winner) => w.option_type.toLowerCase().includes('call'));
    const bearish: Winner[] = allWinners.filter((w: Winner) => w.option_type.toLowerCase().includes('put'));

    // Sort by weighted_score (descending)
    const sortByScore = (list: Winner[]) => {
        return [...list].sort((a, b) => (b.weighted_score ?? 0) - (a.weighted_score ?? 0));
    };

    const processList = (list: Winner[]) => {
        const sorted = sortByScore(list);
        return {
            items: sorted.slice(0, 5), // Top 5
            total: list.length
        };
    };

    // Helper for performance signals
    const processPerf = (list: PerformanceSignal[], totalCount: number) => ({
        items: list.slice(0, 10),
        total: totalCount
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
        } catch {}
    }

    let formattedStartDate: string | null = null;
    if (trackingStartDate) {
        try {
            formattedStartDate = new Date(trackingStartDate).toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
            });
        } catch {}
    }

    return {
      bullish: processList(bullish),
      bearish: processList(bearish),
      gainers: processPerf(topGainers, performanceStats.winnerCount),
      losers: processPerf(topLosers, performanceStats.loserCount),
      performanceStats,
      lastUpdated,
      trackingStartDate: formattedStartDate
    };

  } catch (error) {
    console.error("Failed to fetch landing page data:", error);
    return {
        bullish: { items: [], total: 0 },
        bearish: { items: [], total: 0 },
        gainers: { items: [], total: 0 },
        losers: { items: [], total: 0 },
        performanceStats: { roi: 0, winRate: 0, winnerRoi: 0, loserRoi: 0, signalCount: 0, winnerCount: 0, loserCount: 0 },
        lastUpdated: null,
        trackingStartDate: null
    };
  }
}
