
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getGcsFileContentAdmin, getSeoPageGcsPathAdmin, getStocksAdmin } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { UserNav } from '@/components/auth/user-nav';
import { ShareButtons } from '@/components/share-buttons';

interface StockSeoPageProps {
  params: {
    ticker: string;
  };
}

interface StockSeoData {
    symbol: string;
    date: string;
    bullishScore: number;
    fullAnalysis: {
        about: string;
        newsSummary: string;
        technicals: string;
        mdAndA: string;
        earningsCall: string;
        financials: string;
        metrics: string;
        ratios: string;
    };
    seo: {
        title: string;
        metaDescription: string;
        keywords: string[];
    };
    teaser: {
        signal: 'BUY' | 'SELL' | 'HOLD';
        summary: string;
        metrics: {
            [key: string]: string;
        };
    };
    relatedStocks: string[];
}

const DAYS_THRESHOLD = 7; // Only consider files from the last 7 days as recent

/**
 * Checks if a date string 'YYYY-MM-DD' is within the last N days.
 */
function isRecentDate(fileDateStr: string): boolean {
  try {
    const fileDate = new Date(fileDateStr);
    const now = new Date();
    // Reset time to midnight for fair comparison
    fileDate.setUTCHours(0, 0, 0, 0);
    now.setUTCHours(0, 0, 0, 0);
    const diffTime = now.getTime() - fileDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= DAYS_THRESHOLD;
  } catch (e) {
    return false;
  }
}

/**
 * Gets the SEO data for a ticker by first getting the GCS path from Firestore,
 * checking if the file is recent, and then fetching its content.
 */
async function getStockData(ticker: string): Promise<StockSeoData | null> {
    try {
        const gcsPath = await getSeoPageGcsPathAdmin(ticker);

        if (!gcsPath) {
            console.log(`[getStockData] No GCS path found in Firestore for ticker: ${ticker}`);
            return null;
        }

        // Extract date from a filename like 'TICKER_page_YYYY-MM-DD.json'
        const dateMatch = gcsPath.match(/_(\d{4}-\d{2}-\d{2})\.json$/);
        if (!dateMatch || !dateMatch[1]) {
            console.warn(`[getStockData] Could not extract date from GCS path: ${gcsPath}`);
            return null;
        }

        const fileDate = dateMatch[1];
        if (!isRecentDate(fileDate)) {
            console.warn(`[getStockData] GCS file for ${ticker} is not recent (older than ${DAYS_THRESHOLD} days). Path: ${gcsPath}`);
            return null;
        }

        const content = await getGcsFileContentAdmin(gcsPath);
        return JSON.parse(content) as StockSeoData;

    } catch (error: any) {
        if (error.code === 404 || error instanceof SyntaxError) {
             console.warn(`[getStockData] Could not find or parse SEO JSON for ${ticker}. Error: ${error.message}`);
             return null;
        }
        console.error(`[getStockData] Unexpected error for ${ticker}:`, error);
        throw error;
    }
}


export async function generateMetadata({ params }: StockSeoPageProps): Promise<Metadata> {
  const data = await getStockData(params.ticker);

  if (!data) {
    return {
      title: 'Stock Not Found | ProfitScout',
      description: 'The requested stock could not be found.',
    };
  }

  return {
    title: data.seo.title,
    description: data.seo.metaDescription,
    keywords: data.seo.keywords,
  };
}


// Only prerender pages for which we can find valid, recent data.
export async function generateStaticParams() {
    console.log('[generateStaticParams] Starting to generate params for stock pages...');
    const allStocks = await getStocksAdmin(); // Get all potential tickers
    const validTickers: { ticker: string }[] = [];

    for (const stock of allStocks) {
        // Check if data exists and is recent before adding to static params
        const hasValidData = await getStockData(stock.id);
        if (hasValidData) {
            validTickers.push({ ticker: stock.id });
            console.log(`[generateStaticParams] Found valid data for ${stock.id}, adding to prerender list.`);
        } else {
            console.log(`[generateStaticParams] No valid/recent data for ${stock.id}, skipping.`);
        }
    }
    
    console.log(`[generateStaticParams] Finished. Prerendering ${validTickers.length} stock pages.`);
    return validTickers;
}

export const dynamicParams = true;
// Revalidate this page at most once per hour (3600 seconds)
export const revalidate = 3600;


const SignalIndicator = ({ signal }: { signal: 'BUY' | 'SELL' | 'HOLD' }) => {
    const baseClasses = "font-bold text-lg flex items-center gap-2";
    if (signal === 'BUY') {
        return <span className={`${baseClasses} text-green-500`}><TrendingUp size={20} /> BUY</span>;
    }
    if (signal === 'SELL') {
        return <span className={`${baseClasses} text-red-500`}><TrendingDown size={20} /> SELL</span>;
    }
    return <span className={`${baseClasses} text-gray-500`}><Minus size={20} /> HOLD</span>;
};

export default async function StockSeoPage({ params }: StockSeoPageProps) {
  const data = await getStockData(params.ticker);

  if (!data) {
    notFound();
  }

  const { fullAnalysis, teaser, relatedStocks, seo } = data;
  const pageTitle = seo.title.split(' | ')[0]; // Remove "| ProfitScout"

  return (
    <>
      <header className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            ProfitScout
          </Link>
          <UserNav />
        </div>
      </header>
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-2">
            {pageTitle}
        </h1>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
            <p className="text-muted-foreground">
                AI-powered insights updated on {new Date(data.date).toLocaleDateString()}.
            </p>
            <ShareButtons title={seo.title} />
        </div>
        
        <Card className="mb-8 bg-card/50">
            <CardHeader>
                <CardTitle className="flex justify-between items-start">
                    <span>AI Signal: <SignalIndicator signal={teaser.signal} /></span>
                </CardTitle>
                <CardDescription>{teaser.summary}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    {Object.entries(teaser.metrics).map(([key, value]) => (
                        <div key={key} className="p-4 bg-background rounded-lg">
                            <p className="text-sm font-medium text-muted-foreground">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-lg font-semibold">{value}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="font-headline">Full Analysis Breakdown</CardTitle>
                <CardDescription>Expand the sections below for a detailed look at our analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {Object.entries(fullAnalysis).map(([key, value], index) => {
                         // A simple function to format the key into a readable title
                         const formatTitle = (s: string) => {
                            if (s === 'mdAndA') return 'Management Discussion';
                            const result = s.replace(/([A-Z])/g, ' $1');
                            return result.charAt(0).toUpperCase() + result.slice(1);
                        };
                        return (
                             <AccordionItem key={key} value={`item-${index}`}>
                                <AccordionTrigger>{formatTitle(key)}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="prose prose-invert max-w-none">
                                        <p>{value}</p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )
                    })}
                </Accordion>
            </CardContent>
        </Card>

         <Card className="mb-8 text-center bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle>Go Beyond the Analysis</CardTitle>
                <CardDescription className="text-foreground/80">
                    Get real-time insights, compare stocks, and chat with our AI analyst on the interactive dashboard.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild size="lg">
                    <Link href="/dashboard">
                        Launch Interactive Dashboard <ArrowRight className="ml-2 h-5 w-5"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>

        <Card className="mb-8 border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle size={20} />
                    Disclaimer
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-200/80">
                <p>
                    The information provided on this page is for informational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the page's content as such. ProfitScout does not recommend that any cryptocurrency should be bought, sold, or held by you. Do conduct your own due diligence and consult your financial advisor before making any investment decisions.
                </p>
            </CardContent>
        </Card>

        <div>
            <h3 className="text-lg font-semibold mb-2">Related Stocks</h3>
            <div className="flex gap-2">
                {relatedStocks.map(stock => (
                    <Link key={stock} href={`/stocks/${stock}`}>
                        <Badge variant="secondary">{stock}</Badge>
                    </Link>
                ))}
            </div>
        </div>

    </div>
    </>
  );
}
