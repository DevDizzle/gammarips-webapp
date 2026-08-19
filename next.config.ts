import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // OAuth authorization server surfaces (consent page above all): never
        // frameable (OAuth 2.1 §7.10 clickjacking), never cached by a shared cache.
        source: '/oauth/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      {
        // The consent page carries a live request id; never let a shared cache
        // keep it. (The JWKS and metadata routes set their own public max-age.)
        source: '/oauth/consent:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
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

      // Blog posts archived in the 2026-07-03 repositioning (they sold or
      // taught the retired pick-push/WhatsApp products and dead V6 exits).
      // 301 each indexed URL to the closest living content instead of 404ing.
      { source: '/blog/whatsapp-group-tag-the-agent', destination: '/developers', permanent: true },
      { source: '/blog/19-per-month-signal-service', destination: '/pricing', permanent: true },
      { source: '/blog/whats-pushed-to-my-phone-at-9am', destination: '/how-it-works', permanent: true },
      { source: '/blog/15-minute-morning-options-routine', destination: '/how-it-works', permanent: true },
      { source: '/blog/math-of-five-hundred-dollar-options-position', destination: '/lab', permanent: true },
      { source: '/blog/why-90-percent-of-options-traders-fail-systems', destination: '/how-it-works', permanent: true },
      { source: '/blog/systems-problem-not-pick-problem', destination: '/how-it-works', permanent: true },
      { source: '/blog/one-trade-a-day-discipline', destination: '/how-it-works', permanent: true },
      { source: '/blog/gammarips-morning-90-seconds', destination: '/signals', permanent: true },

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
