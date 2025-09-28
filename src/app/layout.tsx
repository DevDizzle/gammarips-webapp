
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
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <main className='flex-grow'>{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-GHEYWRR8BX"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GHEYWRR8BX');
          `}
        </Script>
      </body>
    </html>
  );
}
