import { MetadataRoute } from 'next';
import { getStocksAdmin } from '@/lib/firebase-admin';
import { Storage } from '@google-cloud/storage';

const BASE_URL = 'https://profitscout.app'; // Replace with your production URL

// These are helper functions adapted from the [ticker]/page.tsx to avoid import issues.
const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'profit-scout';
const PREFIX = 'pages/';
const DAYS_THRESHOLD = 7; 

function isRecentDate(fileDateStr: string): boolean {
  try {
    const fileDate = new Date(fileDateStr);
    const now = new Date();
    fileDate.setUTCHours(0, 0, 0, 0);
    now.setUTCHours(0, 0, 0, 0);
    const diffTime = now.getTime() - fileDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= DAYS_THRESHOLD;
  } catch (e) {
    return false;
  }
}

async function hasRecentData(ticker: string): Promise<boolean> {
    try {
        const [files] = await storage.bucket(BUCKET_NAME).getFiles({ prefix: `${PREFIX}${ticker.toUpperCase()}_page_` });
        
        const hasRecentFile = files.some(file => {
            const fileName = file.name.replace(PREFIX, '');
            const match = fileName.match(/^([A-Z]+)_page_(\d{4}-\d{2}-\d{2})\.json$/);
            if (match) {
                const fileDate = match[2];
                return isRecentDate(fileDate);
            }
            return false;
        });

        return hasRecentFile;
    } catch (error) {
        console.error(`[Sitemap] Error checking data for ${ticker}:`, error);
        return false;
    }
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages
  const staticRoutes = [
    '',
    '/dashboard',
    '/about',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic stock pages
  const allStocks = await getStocksAdmin();
  const stockRoutes: MetadataRoute.Sitemap = [];

  for (const stock of allStocks) {
      if (await hasRecentData(stock.id)) {
          stockRoutes.push({
              url: `${BASE_URL}/stocks/${stock.id}`,
              lastModified: new Date().toISOString(),
              changeFrequency: 'weekly', // These pages are updated more frequently
              priority: 0.9,
          });
      }
  }

  return [...staticRoutes, ...stockRoutes];
}
