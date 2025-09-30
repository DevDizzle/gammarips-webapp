
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import Footer from '@/components/layout/footer';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://profitscout.app'), // Replace with your actual domain
  title: {
    default: 'ProfitScout | AI-Powered Options Trading Signals',
    template: `%s | ProfitScout`,
  },
  description: 'Get an edge in the options market. ProfitScout uses AI to analyze thousands of data points and pinpoint high-potential Call and Put setups on Russell 1000 stocks.',
  keywords: ['options trading', 'stock options', 'AI trading', 'options signals', 'fintech', 'algorithmic trading', 'Russell 1000', 'call options', 'put options'],
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        
      </head>
      <body>
        <Script
          strategy="afterInteractive"
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
            `,
          }}
        />
         <Script
          id="ga-client-id-capture"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              gtag('get', '${GA_MEASUREMENT_ID}', 'client_id', function(cid) {
                localStorage.setItem('ga_client_id', cid);
              });
            `,
          }}
        />
        <AuthProvider>
          <main className='flex-grow'>{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
