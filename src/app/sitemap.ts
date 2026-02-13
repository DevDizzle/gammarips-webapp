import { MetadataRoute } from 'next';
import { getAllOvernightSummaries } from '@/lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const summaries = await getAllOvernightSummaries(365); // Up to a year
  
  const reportPages = summaries.map(s => ({
    url: `https://gammarips.com/reports/${s.scan_date}`,
    lastModified: new Date(s.scan_date),
    changeFrequency: 'never' as const, // Historical reports don't change
    priority: 0.8,
  }));

  return [
    {
      url: 'https://gammarips.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://gammarips.com/reports',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://gammarips.com/signals',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...reportPages,
  ];
}
