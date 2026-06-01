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
      { source: '/stocks/:ticker', destination: '/', permanent: true },
      { source: '/dashboard/:ticker', destination: '/', permanent: true },
      { source: '/feedback', destination: '/about#contact', permanent: true },
      { source: '/api', destination: '/developers', permanent: true },
      { source: '/war-room', destination: '/pricing', permanent: true },
      { source: '/history', destination: '/reports', permanent: true },

      // Catch old top-level ticker pages (1-5 chars) -> signals page, excluding actual pages
      { source: '/:ticker((?!arena|about|terms|auth|api|blog|login|signup|dashboard|war-room|history)[a-zA-Z]{1,5})', destination: '/signals', permanent: true },
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
