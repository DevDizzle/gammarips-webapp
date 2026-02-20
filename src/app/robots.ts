import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/[A-Z]*'], // Block old ticker pages (now 301 redirected)
    },
    sitemap: 'https://gammarips.com/sitemap.xml',
  };
}
