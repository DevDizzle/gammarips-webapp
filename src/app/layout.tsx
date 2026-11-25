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
    default: 'Market & Options Intelligence for AI Trading Agents | GammaRips',
    template: `%s | GammaRips`,
  },
  description: "Nightly options-flow & volatility intelligence for AI trading agents—trade US stocks, 2x ETFs, or options over MCP. Free preview, Pro $29/mo, or custom builds.",
  keywords: ['AI trading agent', 'trading MCP server', 'stock market data MCP', 'options flow scanner', '2x single stock ETFs', 'Claude trading bot', 'ChatGPT trading agent', 'overnight market scanner', 'custom Python trading agent'],
  openGraph: {
    title: 'Market & Options Intelligence for AI Trading Agents | GammaRips',
    description: 'Nightly institutional flow & volatility data for US stocks, 2x/inverse ETFs, and options—streamed into Claude, ChatGPT, or Cursor via MCP, or built into your own custom trading bot in 5 days.',
    url: siteUrl,
    siteName: 'GammaRips',
    images: [{ url: `${siteUrl}/og-image.png?v=4`, width: 1200, height: 630, alt: 'GammaRips | Market & options-flow intelligence for AI trading agents' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market & Options Intelligence for AI Trading Agents | GammaRips',
    description: 'Nightly institutional flow & volatility data for US stocks, 2x/inverse ETFs, and options—streamed into Claude, ChatGPT, or Cursor via MCP, or custom-built for your rules in 5 days.',
    images: [`${siteUrl}/og-image.png?v=4`],
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
  "description": "GammaRips delivers nightly institutional options-flow and volatility intelligence for AI trading agents—mapped to US stocks, 2x/inverse single-stock ETFs, and liquid options over MCP—plus fixed-scope ($1,000) custom Python trading agent engineering delivered in 5 business days.",
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
