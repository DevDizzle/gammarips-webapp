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
    default: 'GammaRips — One options trade a day. Pushed to your phone at 7:30 AM ET.',
    template: `%s | GammaRips`,
  },
  description: 'GammaRips watches institutional options flow overnight and mechanically picks one contract each morning — with stop, target, and exit pre-set. You place the trade at 10:00 ET and go back to your day. Paper-trading, educational only.',
  keywords: ['options flow', 'institutional options activity', 'unusual options activity', 'options signals', 'one trade a day', 'options trading', 'AI trading analysis', 'overnight options scanner'],
  openGraph: {
    title: 'GammaRips — One options trade a day',
    description: 'One contract picked overnight. Stop, target, and exit pre-set. Pushed to your phone at 7:30 AM ET.',
    url: siteUrl,
    siteName: 'GammaRips',
    images: [{ url: `${siteUrl}/og-image.png?v=3`, width: 1200, height: 630, alt: 'GammaRips — One options trade a day' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GammaRips — One options trade a day',
    description: 'One contract picked overnight. Stop, target, and exit pre-set. Pushed to your phone at 7:30 AM ET.',
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
  "description": "GammaRips mechanically picks one options contract each morning from overnight institutional flow and pushes it to subscribers at 07:30 ET with stop, target, and exit pre-set.",
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
