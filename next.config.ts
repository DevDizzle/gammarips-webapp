import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/signup', destination: '/', permanent: true },
      { source: '/chat', destination: '/', permanent: true },
      { source: '/dashboard', destination: '/reports', permanent: true },
      { source: '/performance', destination: '/', permanent: true },
      { source: '/options/call-setups', destination: '/', permanent: true },
      { source: '/options/put-hedges', destination: '/', permanent: true },
      // Old per-ticker URL patterns -> the canonical /signals/:ticker page.
      // These URLs are indexed and carry the largest share of our impressions;
      // sending them to a generic destination (/, /signals) discarded the ticker
      // and read as a soft-404 to Google (impressions, ~0 clicks). A 1:1
      // ticker-preserving redirect consolidates that equity onto the page that
      // actually answers the query. /signals/:ticker 404s cleanly if the ticker
      // was never scanned.
      { source: '/stocks/:ticker', destination: '/signals/:ticker', permanent: true },
      { source: '/dashboard/:ticker', destination: '/', permanent: true },
      { source: '/feedback', destination: '/about#contact', permanent: true },
      { source: '/api', destination: '/developers', permanent: true },
      { source: '/war-room', destination: '/pricing', permanent: true },
      { source: '/history', destination: '/reports', permanent: true },

      // Old top-level ticker pages (1-5 chars) -> canonical /signals/:ticker,
      // preserving the ticker. Excludes real page slugs in that length range.
      { source: '/:ticker((?!(?:arena|about|terms|auth|api|blog|lab|login|signup|dashboard|war-room|history)$)[a-zA-Z]{1,5})', destination: '/signals/:ticker', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'storage.googleapis.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'g.foolcdn.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.benzinga.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'www.benzinga.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'ml.globenewswire.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'i-invdn-com.investing.com', port: '', pathname: '/**' },
    ],
  },
};

export default nextConfig;
