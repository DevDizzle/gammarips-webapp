import { getAllDailyReports, getBlogPostsAdmin, getSignalTickersForSitemap } from "@/lib/firebase-admin";
import { MetadataRoute } from 'next';

const BASE_URL = 'https://gammarips.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/reports`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/reports/archive`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${BASE_URL}/signals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/signals/archive`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.5 },
    { url: `${BASE_URL}/developers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/lab`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/disclosures`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/scorecard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    // /war-room intentionally omitted — it 301s to /pricing (next.config.ts);
    // a sitemap should not list a redirecting URL.
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Dynamic report pages from Firestore.
  // NOT windowed (unlike the ticker section below). A dated market report does
  // not go stale as a search asset — the date IS the asset, and reports are the
  // only surface with demonstrated organic pull (GSC 2026-08-08: pos 3.0 for
  // "market flow options gamma cta liquidity 2026-06", pos 9.3 for "sector
  // rotation june 2026"). The old limit of 30 left ~43 live, indexed report
  // pages with no sitemap entry and no internal link. /reports/archive is the
  // matching crawl path.
  let reportPages: MetadataRoute.Sitemap = [];
  try {
    const reports = await getAllDailyReports(1000);
    reportPages = reports.map(report => ({
      url: `${BASE_URL}/reports/${report.scan_date}`,
      lastModified: report.scan_date, // assuming scan_date is ISO string or handle accordingly if needed
      changeFrequency: 'never' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Sitemap: failed to fetch reports', e);
  }

  // Dynamic blog post pages from Firestore
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPostsAdmin();
    blogPages = posts.map(post => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.publishedAt || new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error('Sitemap: failed to fetch blog posts', e);
  }

  // Per-ticker signal pages — our largest indexable inventory. WINDOWED to the
  // last ~90 days of scans (2026-07-07): pushing the full multi-thousand-page
  // tail earned "Crawled - currently not indexed" on 1,962 pages in GSC. Fresh
  // pages get the sitemap's crawl-priority hint; the complete inventory stays
  // internally linked (and indexable) via /signals/archive.
  let signalPages: MetadataRoute.Sitemap = [];
  try {
    const since = new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10);
    const tickers = await getSignalTickersForSitemap(6000, since);
    signalPages = tickers.map(({ ticker, scanDate }) => ({
      url: `${BASE_URL}/signals/${ticker}`,
      lastModified: scanDate || new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (e) {
    console.error('Sitemap: failed to fetch signal tickers', e);
  }

  return [...staticPages, ...reportPages, ...blogPages, ...signalPages];
}
