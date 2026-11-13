import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import Footer from '@/components/layout/footer';
import EmailCaptureSection from '@/components/layout/email-capture-section';
import { PublicHeader } from "@/components/layout/public-header";
import Script from 'next/script';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import RootLayoutClient from './root-layout-client';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthModalProvider } from '@/components/auth/auth-modal-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

const siteUrl = 'https://gammarips.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Nightly Combo A Options Dataset for AI Agents | GammaRips',
    template: `%s | GammaRips`,
  },
  description: "The nightly Combo A options dataset, 10-minute intraday liquidity snapshots, and 3-day excursion outcome history for AI agents. Every trading night GammaRips filters ~3,500 optionable US stocks to the top 100 liquid universe and bullish calls passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45. Preview 3 contracts free, or connect Pro MCP ($29/mo) in Claude, ChatGPT, Cursor, or Codex.",
  keywords: ['agentic trading', 'AI trading agent', 'MCP server trading', 'options flow', 'unusual options activity', 'options flow data', 'overnight options scanner', 'AI trading analysis', 'options data for AI agents', 'Combo A options dataset'],
  openGraph: {
    title: 'Nightly Combo A Options Dataset for AI Agents | GammaRips',
    description: 'Nightly Combo A options dataset (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45), 10-minute intraday liquidity snapshots, and 3-day excursion history for Claude, ChatGPT, Cursor, and Codex.',
    url: siteUrl,
    siteName: 'GammaRips',
    images: [{ url: `${siteUrl}/og-image.png?v=3`, width: 1200, height: 630, alt: 'GammaRips | Options-flow data for AI agents' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nightly Combo A Options Dataset for AI Agents | GammaRips',
    description: 'Nightly Combo A options dataset (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45), 10-minute intraday liquidity snapshots, and 3-day excursion history for Claude, ChatGPT, Cursor, and Codex.',
    images: [`${siteUrl}/og-image.png?v=3`],
  },
};

const GA_MEASUREMENT_ID = 'G-ZF0DQVQEKJ';
const AW_MEASUREMENT_ID = 'AW-17603675875';

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GammaRips",
  "url": "https://gammarips.com",
  "logo": "https://gammarips.com/icon.png",
  "email": "evan@gammarips.com",
  "description": "GammaRips is an options-flow and contract-microstructure data engine for AI agents. Every trading night it scans ~3,500 optionable US stocks, filters to the top 100 liquid universe, and selects one out-of-the-money call per bullish name passing the Combo A specification (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45, enriched with rv_iv_ratio). It serves a 3-contract preview on the free tier and the full 40–50 contract dataset, 10-minute intraday liquidity snapshots, and 3-day excursion outcome history on Pro MCP ($29/mo).",
  "founder": { "@type": "Person", "name": "Evan Parra", "jobTitle": "Founder & CEO" },
  "sameAs": ["https://twitter.com/GammaRips"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script strategy="beforeInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
        <Script id="gtag-init" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
            gtag('config', '${AW_MEASUREMENT_ID}');
          `,
        }} />
        <Script id="ga-client-id-capture" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            try {
              gtag('get', '${GA_MEASUREMENT_ID}', 'client_id', function(cid) {
                if (cid) localStorage.setItem('ga_client_id', cid);
              });
              gtag('get', '${GA_MEASUREMENT_ID}', 'session_id', function(sid) {
                if (sid) localStorage.setItem('ga_session_id', String(sid));
              });
            } catch (e) {}
          `,
        }} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <AuthProvider>
          <AuthModalProvider>
            <PublicHeader />
            <RootLayoutClient>
              <main className='flex-grow'>{children}</main>
            </RootLayoutClient>
            <EmailCaptureSection />
            <Footer />
            <Toaster />
            <CookieConsentBanner />
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
