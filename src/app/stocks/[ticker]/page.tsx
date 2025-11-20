




import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getGcsFileContentAdmin, getSeoPageGcsPathAdmin, getStocksAdmin, getTickerEventsAdmin, type TickerEvent } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown, Minus, AlertTriangle, CalendarDays, CheckCircle, LineChart, Star } from 'lucide-react';
import { UserNav } from '@/components/auth/user-nav';
import { ShareButtons } from '@/components/share-buttons';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StockSeoPageProps {
  params: {
    ticker: string;
  };
}

// Updated data structure to match the new JSON format
interface StockSeoData {
  symbol: string;
  date: string;
  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
    h1: string;
  };
  fullAnalysis: {
    about: string;
    newsSummary: string;
    technicals: string;
    'md&a': string;
    earningsCall: string;
    financials: string;
    fundamentals?: string;
  };
  teaser: {
    signal: string;
    summary: string;
    metrics: {
      [key: string]: string;
    };
  };
  relatedStocks: string[];
  schemaOrg: object; // Keep it generic to accept any valid schema
}


const DAYS_THRESHOLD = 30; // Only consider files from the last 30 days as recent

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
            // Fallback to trying to parse JSON even if date is missing, but it won't be recent
             const content = await getGcsFileContentAdmin(gcsPath);
             return JSON.parse(content) as StockSeoData;
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
  const ticker = params.ticker.toUpperCase();
  const data = await getStockData(ticker);

  const defaultOgImage = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://profitscout.app'}/profitscout-og.png`;

  if (!data) {
    return {
      title: `Stock Analysis for ${ticker} Not Found | ProfitScout`,
      description: `The requested stock analysis for ${ticker} could not be found or is not up to date. Check back later for AI-powered insights.`,
      robots: 'noindex, nofollow',
    };
  }
  
  const companyName = data.seo.title.split(' Stock Forecast')[0];

  return {
    title: data.seo.title,
    description: data.seo.metaDescription,
    keywords: data.seo.keywords || [],
    openGraph: {
      title: data.seo.title,
      description: data.seo.metaDescription,
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: `ProfitScout AI Analysis for ${companyName} (${ticker})`,
        },
      ],
      siteName: 'ProfitScout',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.seo.title,
      description: data.seo.metaDescription,
      images: [defaultOgImage],
    },
  };
}


export async function generateStaticParams() {
    console.log('[generateStaticParams] Starting to generate params for all stock pages...');
    const allStocks = await getStocksAdmin();
    // Build a page for every stock that has a pages_json path configured.
    const validTickers = allStocks
        .filter(stock => stock.pages_json)
        .map(stock => ({
            ticker: stock.id.toUpperCase(),
        }));
    
    console.log(`[generateStaticParams] Finished. Prerendering ${validTickers.length} stock pages.`);
    return validTickers;
}

export const dynamicParams = true;
export const revalidate = 3600;


const SignalIndicator = ({ signal }: { signal: string }) => {
    const lowerSignal = signal.toLowerCase();
    const baseClasses = "font-bold text-lg flex items-center gap-2";
    if (lowerSignal.includes('buy') || lowerSignal.includes('bullish')) {
        return <span className={`${baseClasses} text-green-500`}><TrendingUp size={20} /> {signal}</span>;
    }
    if (lowerSignal.includes('sell') || lowerSignal.includes('bearish')) {
        return <span className={`${baseClasses} text-red-500`}><TrendingDown size={20} /> {signal}</span>;
    }
    return <span className={`${baseClasses} text-gray-500`}><Minus size={20} /> {signal}</span>;
};

const UpcomingCatalystsTable = ({ events, ticker }: { events: TickerEvent[], ticker: string }) => {
    const tickerSpecificEvents = events.filter(event => event.ticker === ticker);

    if (tickerSpecificEvents.length === 0) {
        return null;
    }

    return (
        <Card className="mb-8">
            <CardHeader>
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <CalendarDays size={24} />
                    {ticker} Earnings Date & Key Events
                </h2>
                <CardDescription>Key upcoming dates for {ticker} that could impact its stock price.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Event</TableHead>
                            <TableHead>Type</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickerSpecificEvents.map(event => (
                            <TableRow key={event.id}>
                                <TableCell className="font-medium">{new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' })}</TableCell>
                                <TableCell>{event.event_name}</TableCell>
                                <TableCell>
                                    <Badge variant={'default'}>
                                        {event.ticker}-Specific
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

const AnalysisSectionCard = ({ title, content }: { title: string; content: string }) => {
    if (!content) return null;

    const formatTitle = (s: string) => {
        if (s === 'md&a') return 'Management Discussion';
        const result = s.replace(/([A-Z])/g, ' $1');
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{formatTitle(title)}</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="prose prose-invert max-w-none text-muted-foreground">
                    <p>{content}</p>
                </div>
            </CardContent>
        </Card>
    );
};


export default async function StockSeoPage({ params }: StockSeoPageProps) {
  const ticker = params.ticker.toUpperCase();
  const data = await getStockData(ticker);
  const events = await getTickerEventsAdmin(ticker);

  if (!data) {
    notFound();
  }

  const { fullAnalysis, teaser, relatedStocks, seo, schemaOrg } = data;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <header className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline">
            <span className="text-foreground">Profit</span><span className="text-primary">Scout</span>
          </Link>
          <UserNav />
        </div>
      </header>
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-2">
            {seo.h1}
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
                            <p className="text-lg font-semibold">
                                {key === 'Historical Volatility' ? `${value}` : value}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
        
        <UpcomingCatalystsTable events={events} ticker={ticker} />

        <div className="space-y-8 mb-8">
            <h2 className="text-2xl font-bold font-headline text-center">Full Analysis Breakdown</h2>
            {Object.entries(fullAnalysis).map(([key, value]) => (
                <AnalysisSectionCard key={key} title={key} content={value} />
            ))}
        </div>

        <Card className="text-center bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Unlock Data-Driven Options Setups</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-w-md mx-auto space-y-3 text-left">
                    <div className="flex items-center gap-3">
                        <LineChart className="h-5 w-5 text-primary shrink-0"/>
                        <span className="font-medium">Go beyond static reports with an interactive dashboard</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-primary shrink-0"/>
                        <span className="font-medium">Access daily, top-rated Call & Put setups</span>
                    </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0"/>
                        <span className="font-medium">Track performance for every signal we issue</span>
                    </div>
                </div>
                <Button asChild size="lg" className="mt-6">
                    <Link href={`/dashboard`}>
                        Get Instant Access ($19/mo) <ArrowRight className="ml-2 h-5 w-5"/>
                    </Link>
                </Button>
            </CardContent>
        </Card>

        <Card className="mt-8 border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <AlertTriangle size={20} />
                    Disclaimer
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-yellow-200/80">
                <p>
                    The information provided on this page is for informational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the page's content as such. ProfitScout does not recommend that any security should be bought, sold, or held by you. Do conduct your own due diligence and consult your financial advisor before making any investment decisions.
                </p>
            </CardContent>
        </Card>

        {relatedStocks && relatedStocks.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Related Stocks</h3>
            <div className="flex flex-wrap gap-2">
                {relatedStocks.map(stock => (
                    <Button key={stock} variant="outline" asChild>
                       <Link href={`/stocks/${stock}`}>
                            {stock}
                       </Link>
                    </Button>
                ))}
            </div>
          </div>
        )}

    </div>
    </>
  );
}
