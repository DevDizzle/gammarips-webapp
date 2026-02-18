import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import Footer from '@/components/layout/footer';
import { PublicHeader } from "@/components/layout/public-header";
import Script from 'next/script';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import RootLayoutClient from './root-layout-client';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthModalProvider } from '@/components/auth/auth-modal-provider';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

const siteUrl = 'https://gammarips.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), 
  title: {
    default: 'GammaRips | The Overnight Edge — Know What Smart Money Did Last Night',
    template: `%s | GammaRips`,
  },
  description: 'Every morning before the market opens, see what institutional money did overnight. 5,230+ tickers scanned. Signals scored 1-10. Specific contracts recommended.',
  keywords: ['overnight options flow', 'institutional options activity', 'unusual options activity', 'options flow scanner', 'options signals', 'smart money', 'options trading', 'AI trading analysis'],
  openGraph: {
    title: 'GammaRips | The Overnight Edge',
    description: 'Every morning before the market opens, see what institutional money did overnight.',
    url: siteUrl,
    siteName: 'GammaRips',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'GammaRips — The Overnight Edge' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GammaRips | The Overnight Edge',
    description: 'Every morning before the market opens, see what institutional money did overnight.',
    images: [`${siteUrl}/og-image.png`],
  },
};

const GA_MEASUREMENT_ID = 'G-KPGTJDBC6N';
const AW_MEASUREMENT_ID = 'AW-17603675875';

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GammaRips",
  "alternateName": "The Overnight Edge",
  "url": "https://gammarips.com",
  "logo": "https://gammarips.com/icon.png",
  "email": "support@gammarips.com",
  "description": "Know what smart money did last night — before the market opens.",
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
            } catch (e) {}
          `,
        }} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <Suspense fallback={null}>
          <AuthProvider>
            <AuthModalProvider>
              <PublicHeader />
              <RootLayoutClient>
                <main className='flex-grow'>{children}</main>
              </RootLayoutClient>
              <Footer />
              <Toaster />
              <CookieConsentBanner />
            </AuthModalProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
