
'use server';

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number | null;
  changesPercentage: number;
  change: number;
}

/**
 * Fetches real-time quotes for a batch of symbols (stocks or options).
 * Returns a Map of Symbol -> Price.
 */
export async function getBatchQuotes(symbols: string[]): Promise<Map<string, number>> {
  if (!FMP_API_KEY || symbols.length === 0) {
    return new Map();
  }

  // Filter out any empty strings
  const cleanSymbols = symbols.filter(s => s);
  if (cleanSymbols.length === 0) return new Map();

  // FMP allows comma-separated symbols
  const symbolsString = cleanSymbols.join(',');

  try {
    const response = await fetch(`${BASE_URL}/quote/${symbolsString}?apikey=${FMP_API_KEY}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      // If the batch fails, it might be due to a bad symbol. 
      // FMP usually just ignores bad symbols in a batch, but if it 404s/500s, we return empty.
      console.warn(`FMP Batch Quote API error: ${response.statusText}`);
      return new Map();
    }

    const data = await response.json();
    
    // FMP returns an array of objects: { symbol: "AAPL", price: 150.00, ... }
    const priceMap = new Map<string, number>();
    
    if (Array.isArray(data)) {
        data.forEach((item: any) => {
            if (item && item.symbol && typeof item.price === 'number') {
                priceMap.set(item.symbol, item.price);
            }
        });
    }

    return priceMap;

  } catch (error) {
    console.error("Failed to fetch batch quotes:", error);
    return new Map();
  }
}

/**
 * Fetches real-time quote data for major indices and key commodities/rates.
 */
export async function getMarketIndices(): Promise<MarketIndex[]> {
  if (!FMP_API_KEY) {
    console.error("FMP_API_KEY is missing");
    return [];
  }

  // SPY: S&P 500 ETF
  // ^VIX: Volatility Index
  // ^TNX: 10-Year Treasury Yield
  // CLUSD: Crude Oil
  const symbols = "SPY,^VIX,^TNX,CLUSD";
  
  try {
    const response = await fetch(`${BASE_URL}/quote/${symbols}?apikey=${FMP_API_KEY}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // FMP returns an array of objects. Map to our interface.
    return data.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      changesPercentage: item.changesPercentage,
      change: item.change
    }));

  } catch (error) {
    console.error("Failed to fetch market indices:", error);
    return [];
  }
}

/**
 * Fetches the latest CBOE Total Put/Call Ratio.
 */
export async function getPutCallRatio(): Promise<number | null> {
    if (!FMP_API_KEY) {
        console.error("FMP_API_KEY is missing for Put/Call Ratio fetch.");
        return null; // Return null if key is missing
    }

    try {
        const response = await fetch(`${BASE_URL}/pcr?apikey=${FMP_API_KEY}`, {
            next: { revalidate: 300 } // Cache for 5 minutes
        });

        if (!response.ok) {
            throw new Error(`FMP PCR API error: ${response.statusText}`);
        }

        const data = await response.json();
        
        // The API returns an array, we want the most recent (first) item's 'pcr' value
        if (Array.isArray(data) && data.length > 0 && data[0].pcr) {
            return data[0].pcr;
        }
        
        console.warn("FMP PCR API returned empty or invalid data.");
        return null;

    } catch (error) {
        console.error("Failed to fetch Put/Call Ratio:", error);
        return null; // Return null on error
    }
}
