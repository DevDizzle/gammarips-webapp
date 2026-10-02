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
    default: 'Better option contracts and a trade plan in your AI | GammaRips',
    template: `%s | GammaRips`,
  },
  description: "Better-quality option contracts every night, and the history to plan the exit. GammaRips ranks about 3,500 optionable US names by liquidity, keeps the 100 most liquid, and selects one out-of-the-money call in each bullish name. Browse the pool free, or add GammaRips to Claude, ChatGPT, Cursor, or Codex and your AI builds the trade plan with you. You decide.",
  keywords: ['agentic trading', 'AI trading agent', 'MCP server trading', 'options flow', 'unusual options activity', 'options flow data', 'overnight options scanner', 'AI trading analysis', 'options data for AI agents'],
  openGraph: {
    title: 'Better option contracts and a trade plan in your AI | GammaRips',
    description: 'Better-quality option contracts every night, the history to set targets and stops, and your AI builds the trade plan with you. In Claude, ChatGPT, Cursor, and Codex.',
    url: siteUrl,
    siteName: 'GammaRips',
    images: [{ url: `${siteUrl}/og-image.png?v=3`, width: 1200, height: 630, alt: 'GammaRips | Options-flow data for AI agents' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Better option contracts and a trade plan in your AI | GammaRips',
    description: 'Better-quality option contracts every night, the history to set targets and stops, and your AI builds the trade plan with you. In Claude, ChatGPT, Cursor, and Codex.',
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
  "description": "GammaRips gives AI agents better-quality option contracts every night and the history to plan the exit. Every night it ranks about 3,500 optionable US names by liquidity, keeps the 100 most liquid, and selects one out-of-the-money call in each bullish name, producing a pool of roughly 40 to 50 contracts with deep books. It serves that pool, the exit lab, and methodology over MCP, so the user's own AI builds the trade plan. The website is free. Agents subscribe.",
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
