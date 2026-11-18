import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/account/', '/oauth/', '/auth/'],
    },
    sitemap: 'https://gammarips.com/sitemap.xml',
  };
}
