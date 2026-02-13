import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account', '/auth/', '/api/'],
    },
    sitemap: 'https://gammarips.com/sitemap.xml',
  };
}
