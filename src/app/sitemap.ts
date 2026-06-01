import { getAllDailyReports, getBlogPostsAdmin } from "@/lib/firebase-admin";
import { MetadataRoute } from 'next';

const BASE_URL = 'https://gammarips.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/reports`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/signals`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/arena`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/developers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/disclosures`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/scorecard`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/war-room`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Dynamic report pages from Firestore
  let reportPages: MetadataRoute.Sitemap = [];
  try {
    const reports = await getAllDailyReports(30);
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

  return [...staticPages, ...reportPages, ...blogPages];
}
