import { MetadataRoute } from 'next';

const BASE_URL = 'https://gammarips.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages
  const staticRoutes = [
    '',
    '/about',
    '/terms',
    '/privacy',
    '/developers',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : route === '/developers' ? 0.9 : 0.8,
  }));

  // 2. Dynamic stock pages (only if Firebase is available)
  let stockRoutes: MetadataRoute.Sitemap = [];
  
  try {
    // Only attempt Firebase if env vars are set
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const { getStocksAdmin } = await import('@/lib/firebase-admin');
      const allStocks = await getStocksAdmin();
      stockRoutes = allStocks
        .filter(stock => stock.dashboard_json)
        .map((stock) => ({
          url: `${BASE_URL}/${stock.id.toUpperCase()}`,
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.9,
        }));
    }
  } catch (error) {
    // Firebase not available at build time - skip dynamic routes
    console.warn('Sitemap: Firebase not available, skipping dynamic stock routes');
  }

  return [...staticRoutes, ...stockRoutes];
}
