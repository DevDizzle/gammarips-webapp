import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [], // Explicitly allow everything, unless specific private routes
    },
    sitemap: 'https://gammarips.com/sitemap.xml',
  };
}
