import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import Footer from '@/components/layout/footer';
import Script from 'next/script';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import RootLayoutClient from './root-layout-client';
import { Inter, Space_Grotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

const siteUrl = 'https://gammarips.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), 
  title: "The Overnight Edge | GammaRips",
  description: "Institutional options flow analysis delivered before the market opens.",
  keywords: ['options trading', 'stock options', 'AI trading', 'options analysis', 'institutional flow', 'pre-market signals', 'overnight edge'],
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: 'The Overnight Edge | GammaRips',
    description: 'Institutional options flow analysis delivered before the market opens.',
    url: siteUrl,
    siteName: 'The Overnight Edge',
    images: [
      {
        url: `${siteUrl}/profitscout-og.png`,
        width: 1200,
        height: 630,
        alt: 'The Overnight Edge',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
   twitter: {
    card: 'summary_large_image',
    title: 'The Overnight Edge | GammaRips',
    description: 'Institutional options flow analysis delivered before the market opens.',
    images: [`${siteUrl}/profitscout-og.png`],
  },
};

import { AuthModalProvider } from '@/components/auth/auth-modal-provider';

const GA_MEASUREMENT_ID = 'G-KPGTJDBC6N';
const AW_MEASUREMENT_ID = 'AW-17603675875';

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "The Overnight Edge",
      "url": "https://gammarips.com",
      "logo": "https://gammarips.com/icon.png",
      "description": "AI-powered research tool that helps traders identify and analyze high-potential options setups."
    },
    {
      "@type": "SoftwareApplication",
      "name": "The Overnight Edge",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": [
        {
          "@type": "Offer",
          "name": "The Overnight Edge",
          "price": "49.00",
          "priceCurrency": "USD",
          "url": "https://gammarips.com/#pricing"
        },
        {
          "@type": "Offer", 
          "name": "The War Room",
          "price": "149.00",
          "priceCurrency": "USD",
          "url": "https://gammarips.com/#pricing"
        }
      ]
    }
  ]
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
        
        <Script
          strategy="beforeInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
              gtag('config', '${AW_MEASUREMENT_ID}');
            `,
          }}
        />
         <Script
          id="ga-client-id-capture"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                gtag('get', '${GA_MEASUREMENT_ID}', 'client_id', function(cid) {
                  if (cid) localStorage.setItem('ga_client_id', cid);
                });
              } catch (e) {
                console.error("Error getting GA client_id:", e);
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <AuthProvider>
            <AuthModalProvider>
              <RootLayoutClient>
                <main className='flex-grow'>{children}</main>
              </RootLayoutClient>
              <Footer />
              <Toaster />
              <CookieConsentBanner />
            </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
