import 'server-only';

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const BASE_URL = 'https://api.polygon.io/v2/reference/news';

export interface NewsItem {
  id: string;
  publisher: {
    name: string;
    homepage_url: string;
    logo_url: string;
    favicon_url: string;
  };
  title: string;
  author: string;
  published_utc: string;
  article_url: string;
  tickers: string[];
  image_url: string;
  description: string;
  keywords?: string[];
}

interface FetchNewsOptions {
  ticker?: string;
  limit?: number;
}

const ALLOW_LIST = new Set([
  'Benzinga',
  'Reuters',
  'Bloomberg',
  'The Wall Street Journal',
  'CNBC',
  'MarketWatch',
  'Yahoo Finance'
]);

const BLOCK_LIST = new Set([
  'The Motley Fool',
  'GlobeNewswire',
  'GlobeNewswire Inc.',
  'PR Newswire',
  'Business Wire',
  'Accesswire',
  'Seeking Alpha',
  'Seeking Alpha PR',
  'Zacks Investment Research'
]);

/**
 * Fetches market news using Polygon.io with strict quality filtering.
 * Prioritizes signals (Benzinga, Reuters) over noise (PR, Motley Fool).
 */
export async function getSmartNews(options: FetchNewsOptions = {}): Promise<NewsItem[]> {
  if (!POLYGON_API_KEY) {
    console.error("POLYGON_API_KEY is missing");
    return [];
  }

  // Fetch more items initially since we are filtering heavily
  const { ticker, limit = 50 } = options;
  // Increase fetch limit to 1000 (max) to ensure we dig past the noise (PR/GlobeNewswire) 
  // and find enough quality Benzinga/Reuters stories.
  const fetchLimit = 1000; 
  
  const params = new URLSearchParams({
    limit: fetchLimit.toString(),
    apiKey: POLYGON_API_KEY,
    order: 'desc',
    sort: 'published_utc'
  });

  if (ticker) {
    params.append('ticker', ticker);
  }

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Polygon API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
         console.warn("Polygon API status not OK:", data);
         return [];
    }

    const allNews = data.results as NewsItem[];
    
    // Quality Filter
    const qualityNews = allNews.filter(item => {
        const publisherName = item.publisher?.name;
        if (!publisherName) return false;
        
        // 1. Explicit Block
        if (BLOCK_LIST.has(publisherName)) return false;

        // 2. Explicit Allow or Neutral (if not blocked, we assume it might be useful unless we want strict allow-only)
        // For "High Signal", strict allow-only is better, but might result in empty feeds if Polygon only has PRs.
        // Let's use: Must be in ALLOW_LIST OR be Benzinga (just in case string varies).
        
        // Check for partial matches on block list to catch variations like "GlobeNewswire Inc."
        for (const blocked of BLOCK_LIST) {
            if (publisherName.includes(blocked)) return false;
        }

        return true;
    });

    // Return only the requested amount (preserving chronological order)
    return qualityNews.slice(0, limit);

  } catch (error) {
    console.error("Failed to fetch news from Polygon:", error);
    return [];
  }
}
