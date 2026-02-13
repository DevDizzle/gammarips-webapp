import { MetadataRoute } from 'next';

const BASE_URL = 'https://gammarips.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: BASE_URL, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/about`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/how-it-works`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/scorecard`, lastModified: new Date().toISOString(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/developers`, lastModified: new Date().toISOString(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/terms`, lastModified: new Date().toISOString(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date().toISOString(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
