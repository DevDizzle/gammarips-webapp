
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSeoPageGcsPathAdmin, getGcsFileContentAdmin, getStocksAdmin } from '@/lib/firebase-admin';
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


async function getStockData(ticker: string): Promise<StockSeoData | null> {
    try {
        const gcsPath = await getSeoPageGcsPathAdmin(ticker);
        if (!gcsPath) {
            console.warn(`No GCS path found for ticker: ${ticker}`);
            return null; // Triggers notFound in the component
        }
        const content = await getGcsFileContentAdmin(gcsPath);
        return JSON.parse(content) as StockSeoData;
    } catch (error: any) {
        // If the file doesn't exist (404) or parsing fails, we'll treat it as not found.
        if (error.code === 404 || error instanceof SyntaxError) {
             console.warn(`Could not find or parse SEO JSON for ${ticker}. Error: ${error.message}`);
             return null;
        }
        // For other errors, re-throw to trigger Next.js error boundary
        console.error(`Failed to get SEO data for ${ticker}:`, error);
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

export const dynamicParams = true;

// Instruct Next.js to generate static pages for all tickers that have a valid pages_json file in Firestore.
export async function generateStaticParams() {
  const stocks = await getStocksAdmin();
  // Filter for stocks that have a pages_json path
  const validStocks = stocks.filter(stock => !!stock.pages_json);
  return validStocks.map((stock) => ({
    ticker: stock.id,
  }));
}


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
                            if (s === 'mdAndA') return 'MD&A (Management Discussion & Analysis)';
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
