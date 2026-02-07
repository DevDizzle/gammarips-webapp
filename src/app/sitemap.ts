import { MetadataRoute } from 'next';
import { getStocksAdmin } from '@/lib/firebase-admin';
import { articles } from "@/lib/learn-content";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = 'https://gammarips.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages
  const staticRoutes = [
    '',
    '/about',
    '/terms',
    '/privacy',
    '/weekly-picks',
    '/learn',
    '/blog',
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
    .filter(stock => stock.dashboard_json) // Only include stocks that have a dashboard generated
    .map((stock) => ({
    url: `${BASE_URL}/${stock.id.toUpperCase()}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // 3. Dynamic Learn pages
  const learnRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${BASE_URL}/learn/${article.slug}`,
    lastModified: article.date,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 4. Dynamic Blog pages
  const blogPosts = getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.publishDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...learnRoutes, ...stockRoutes, ...blogRoutes];
}
