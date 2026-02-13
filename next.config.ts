
import type {NextConfig} from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      // Old footer pages → new locations
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about-us', 
        destination: '/',
        permanent: true,
      },
      {
        source: '/learn',
        destination: '/signals',
        permanent: true,
      },
      {
        source: '/weekly-picks',
        destination: '/signals',
        permanent: true,
      },
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
      {
        source: '/terms-of-service',
        destination: '/terms',
        permanent: true,
      },
      // Old individual stock pages → new filtered signals view
      {
        source: '/stocks/:ticker',
        destination: '/signals?ticker=:ticker',
        permanent: true, // 301
      },
      {
        source: '/stock/:ticker',
        destination: '/signals?ticker=:ticker',
        permanent: true,
      },
      {
        source: '/analysis/:ticker',
        destination: '/signals?ticker=:ticker',
        permanent: true,
      },
      // Old blog posts → signals (or keep blog if we rebuild it)
      {
        source: '/blog/daily-outlook-:slug',
        destination: '/signals',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: '/',
        permanent: true,
      },
      // Old dashboard → signals
      {
        source: '/dashboard',
        destination: '/signals',
        permanent: true,
      },
      {
        source: '/winners',
        destination: '/signals?direction=BULLISH',
        permanent: true,
      },
      // Clean up previous redirects that point to root or old paths
      {
        source: '/performance',
        destination: '/signals',
        permanent: true,
      },
      {
        source: '/options/call-setups',
        destination: '/signals?direction=BULLISH',
        permanent: true,
      },
      {
        source: '/options/put-hedges',
        destination: '/signals?direction=BEARISH',
        permanent: true,
      },
      {
        source: '/dashboard/:ticker',
        destination: '/signals?ticker=:ticker',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'g.foolcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.benzinga.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.benzinga.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ml.globenewswire.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i-invdn-com.investing.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'files.catbox.moe',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
