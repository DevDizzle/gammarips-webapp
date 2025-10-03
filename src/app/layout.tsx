
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import Footer from '@/components/layout/footer';
import Script from 'next/script';
import CookieConsentBanner from '@/components/cookie-consent-banner';

export const metadata: Metadata = {
  metadataBase: new URL('https://profitscout.app'), // Replace with your actual domain
  title: {
    default: 'ProfitScout | AI-Powered Options Research Tool',
    template: `%s | ProfitScout`,
  },
  description: 'ProfitScout is an AI-powered research tool that helps traders identify and analyze high-potential options setups on Russell 1000 stocks using structured data signals.',
  keywords: ['options trading', 'stock options', 'AI trading', 'options analysis', 'research tool', 'Russell 1000', 'call options', 'put options', 'stock market analysis'],
};

const GA_MEASUREMENT_ID = 'G-KPGTJDBC6N';
const AW_MEASUREMENT_ID = 'AW-17603675875';

export default function RootLayout({
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />
        
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
          <main className='flex-grow'>{children}</main>
          <Footer />
          <Toaster />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
