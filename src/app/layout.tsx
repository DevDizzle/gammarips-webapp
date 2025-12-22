import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import Footer from '@/components/layout/footer';
import Script from 'next/script';
import CookieConsentBanner from '@/components/cookie-consent-banner';
import RootLayoutClient from './root-layout-client';
import { getAppStatus } from './actions';
import DataUpdatingPage from '@/components/layout/data-updating-page';
import AgentChat from '@/components/agent-chat';
import { ChatProvider } from "@/components/layout/chat-context";

const siteUrl = 'https://gammarips.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl), 
  title: {
    default: 'GammaRips | AI-Powered Options Research Tool',
    template: `%s | GammaRips`,
  },
  description: 'GammaRips is an AI-powered research tool that helps traders identify and analyze high-potential options setups on Russell 1000 stocks using structured data signals.',
  keywords: ['options trading', 'stock options', 'AI trading', 'options analysis', 'research tool', 'Russell 1000', 'call options', 'put options', 'stock market analysis'],
  openGraph: {
    title: 'GammaRips | AI-Powered Options Research Tool',
    description: 'AI-powered research tool for options traders.',
    url: siteUrl,
    siteName: 'GammaRips',
    images: [
      {
        url: `${siteUrl}/gammarips-og.png`,
        width: 1200,
        height: 630,
        alt: 'GammaRips AI-Powered Options Research',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
   twitter: {
    card: 'summary_large_image',
    title: 'GammaRips | AI-Powered Options Research Tool',
    description: 'AI-powered research tool for options traders.',
    images: [`${siteUrl}/gammarips-og.png`],
  },
};

import { AuthModalProvider } from '@/components/auth/auth-modal-provider';

const GA_MEASUREMENT_ID = 'G-KPGTJDBC6N';
const AW_MEASUREMENT_ID = 'AW-17603675875';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
        
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
      <body>
        <AuthProvider>
          <ChatProvider>
            <AuthModalProvider>
              <RootLayoutClient>
                <main className='flex-grow'>{children}</main>
              </RootLayoutClient>
              <Footer />
              <Toaster />
              <CookieConsentBanner />
              <AgentChat />
            </AuthModalProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
