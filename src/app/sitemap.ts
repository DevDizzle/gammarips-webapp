import { MetadataRoute } from 'next';
import { getStocksAdmin } from '@/lib/firebase-admin';

const BASE_URL = 'https://profitscout.app'; // Replace with your production URL

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
  // We'll include all stocks from the database. The individual stock pages
  // already have logic to show a 404 if recent data doesn't exist,
  // so it's safe to include them all here. Search engines will discover
  // the 404s and handle them appropriately.
  const allStocks = await getStocksAdmin();
  const stockRoutes: MetadataRoute.Sitemap = allStocks.map((stock) => ({
    url: `${BASE_URL}/stocks/${stock.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [...staticRoutes, ...stockRoutes];
}
