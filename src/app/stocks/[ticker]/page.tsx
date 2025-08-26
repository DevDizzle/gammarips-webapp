
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getSeoPageGcsPathAdmin, getGcsFileContentAdmin, getStocksAdmin } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
    const gcsPath = await getSeoPageGcsPathAdmin(ticker);
    if (!gcsPath) {
        return null;
    }
    try {
        const content = await getGcsFileContentAdmin(gcsPath);
        return JSON.parse(content) as StockSeoData;
    } catch (error) {
        console.error(`Failed to get or parse SEO JSON for ${ticker} from ${gcsPath}:`, error);
        // If the file doesn't exist (404) or parsing fails, we'll treat it as not found.
        return null;
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

// Instruct Next.js to generate static pages for all tickers at build time
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

  const { symbol, fullAnalysis, teaser, relatedStocks } = data;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-2">
            {symbol} Stock Analysis & Recommendation
        </h1>
         <p className="text-muted-foreground mb-8">
            AI-powered insights updated on {new Date(data.date).toLocaleDateString()}.
        </p>
        
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
  );
}
