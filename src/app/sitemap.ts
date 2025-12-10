import { MetadataRoute } from 'next';
import { getStocksAdmin } from '@/lib/firebase-admin';

const BASE_URL = 'https://gammarips.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages
  const staticRoutes = [
    '',
    '/dashboard',
    '/about',
    '/terms',
    '/privacy',
    '/options/call-setups',
    '/options/put-hedges',
    '/performance',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Dynamic stock pages
  // Include all stocks from the database. The page component will handle
  // showing a "not found" state if the data is stale, but the page URL will exist.
  const allStocks = await getStocksAdmin();
  const stockRoutes: MetadataRoute.Sitemap = allStocks
    .filter(stock => stock.pages_json) // Only include stocks that have a page generated
    .map((stock) => ({
    url: `${BASE_URL}/stocks/${stock.id.toUpperCase()}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...stockRoutes];
}
