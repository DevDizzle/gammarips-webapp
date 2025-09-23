

import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, TrendingUp, Rss, BarChart2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceChart } from '@/components/price-chart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Markdown } from '@/components/markdown';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request to ensure data is fresh
export const dynamic = 'force-dynamic';

const getSentimentClasses = (signal: string) => {
    if (!signal) return 'text-muted-foreground border-border bg-card';
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('strong') || lowerSignal.includes('positive')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('weak') || lowerSignal.includes('negative')) {
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    if (lowerSignal.includes('low')) { // Special case for "low" IV
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
     if (lowerSignal.includes('high')) { // Special case for "high" IV
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    return 'text-muted-foreground border-border bg-card';
}

const getSignalBadgeVariant = (signal: string | undefined) => {
    if (!signal) return 'secondary';
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('strong')) return 'default';
    if (lowerSignal.includes('weak')) return 'destructive';
    return 'secondary';
}


const KpiCard = ({ title, value, subValue, indicator, tooltip }: { title: string; value: string; subValue?: string; indicator: React.ReactNode; tooltip: string }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
                {indicator}
                <span>{title}</span>
            </CardDescription>
            <CardTitle className="text-2xl">{value}</CardTitle>
        </CardHeader>
        <CardContent>
            {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
        </CardContent>
         <CardFooter>
            <p className="text-xs text-muted-foreground">{tooltip}</p>
        </CardFooter>
    </Card>
);

const getIndicator = (signal: string | undefined, IconUp: React.ElementType, IconDown: React.ElementType, IconNeutral: React.ElementType) => {
    if (!signal) return <IconNeutral className="h-4 w-4 text-muted-foreground" />;
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('positive') || lowerSignal.includes('strong')) {
        return <IconUp className="h-4 w-4 text-green-500" />;
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('negative') || lowerSignal.includes('weak')) {
        return <IconDown className="h-4 w-4 text-red-500" />;
    }
    return <IconNeutral className="h-4 w-4 text-muted-foreground" />;
};


export default async function TickerDashboardPage({ params }: TickerDashboardPageProps) {
  const ticker = params.ticker.toUpperCase();
  const data = await getDashboardData(ticker);
  

  if (!data) {
    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle>Data not available</CardTitle>
                    <CardDescription>
                        Could not load dashboard data for {ticker}. The data may be in the process of being generated, or the ticker may not be supported. Please check back later.
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
  }

  const { titleInfo, kpis, priceChartData, optionsHeader, topSignalSummary, stockLevelAnalysis } = data;
  const isBullish = optionsHeader ? (kpis.trendStrength.price > kpis.trendStrength.sma50 && optionsHeader.optionType === 'call') : (kpis.trendStrength?.price > kpis.trendStrength?.sma50);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3">
          <span className="truncate">{titleInfo.companyName}</span>
          <Badge variant="secondary">{ticker}</Badge>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
            AI-Powered Options & Equity Analysis as of {new Date(data.runDate).toLocaleDateString()}
        </p>
      </header>

      {optionsHeader ? (
          <Card className={cn("border-2", isBullish ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10")}>
              <CardHeader>
                   {topSignalSummary && (
                    <CardDescription className="mb-2">
                        <Markdown content={topSignalSummary} className="prose-sm prose-invert max-w-none" />
                    </CardDescription>
                  )}
                  <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp size={20} />
                      Top {optionsHeader.optionType === 'call' ? 'Call' : 'Put'} Setup
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
                      <div className="p-2 bg-background/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Strike</p>
                          <p className="text-md font-semibold">${optionsHeader.strikePrice.toFixed(2)}</p>
                      </div>
                      <div className="p-2 bg-background/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Expiration</p>
                          <p className="text-md font-semibold">{new Date(optionsHeader.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                       <div className="p-2 bg-background/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Implied Vol.</p>
                          <p className={cn("text-md font-semibold", getSentimentClasses(optionsHeader.ivSignal))}>
                              {(optionsHeader.ivValue * 100).toFixed(1)}%
                          </p>
                      </div>
                       <div className="p-2 bg-background/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Days to Exp.</p>
                          <p className="text-md font-semibold">{optionsHeader.dte}</p>
                      </div>
                      <div className="p-2 bg-background/50 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground">Setup Quality</p>
                           <Badge variant={getSignalBadgeVariant(optionsHeader.setupQuality)} className="mt-1">
                                {optionsHeader.setupQuality}
                            </Badge>
                      </div>
                  </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">{optionsHeader.contractSymbol}</p>
              </CardFooter>
          </Card>
      ) : (
        <Card className="border-border/50 bg-card/80">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                    <XCircle size={20} />
                    No Top Option Setup Available
                </CardTitle>
                <CardDescription>
                    Our AI did not identify a high-probability call or put setup for {ticker} at this time. This can happen when market conditions are uncertain or risk/reward is unfavorable.
                </CardDescription>
            </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard title="Price vs. 50-Day SMA" value={`$${kpis.trendStrength?.price?.toFixed(2) ?? 'N/A'}`} subValue={`SMA: $${kpis.trendStrength?.sma50?.toFixed(2) ?? 'N/A'}`} indicator={getIndicator(isBullish ? 'bullish' : 'bearish', ArrowUp, ArrowDown, Minus)} tooltip={kpis.trendStrength?.tooltip ?? ''} />
        <KpiCard title="RSI (14-Day)" value={kpis.rsi?.value?.toFixed(1) ?? 'N/A'} indicator={getIndicator(kpis.rsi?.signal, TrendingUp, TrendingUp, Minus)} tooltip={kpis.rsi?.tooltip ?? ''} />
        <KpiCard title="Volume Surge (vs 30D)" value={`${kpis.volumeSurge?.value?.toFixed(0) ?? 'N/A'}%`} indicator={getIndicator(kpis.volumeSurge?.signal, BarChart2, BarChart2, Minus)} tooltip={kpis.volumeSurge?.tooltip ?? ''} />
        <KpiCard title="30-Day Volatility" value={`${kpis.historicalVolatility?.value?.toFixed(1) ?? 'N/A'}%`} indicator={<Rss size={16} className="text-muted-foreground" />} tooltip={kpis.historicalVolatility?.tooltip ?? ''} />
        <KpiCard title="30-Day Change" value={`${kpis.thirtyDayChange?.value?.toFixed(1) ?? 'N/A'}%`} indicator={getIndicator(kpis.thirtyDayChange?.value > 0 ? 'bullish' : 'bearish', ArrowUp, ArrowDown, Minus)} tooltip={kpis.thirtyDayChange?.tooltip ?? ''} />
      </div>
      
      <section>
          {priceChartData ? (
                <PriceChart priceData={priceChartData} />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Price Chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Price chart data is not available for this ticker.</p>
                    </CardContent>
                </Card>
            )}
      </section>
      
        <div className="space-y-6">
            {stockLevelAnalysis && (
                <Card>
                        <CardHeader>
                            <CardTitle>AI Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>View Full Analysis</AccordionTrigger>
                                    <AccordionContent>
                                        <Markdown content={stockLevelAnalysis} className="prose prose-sm prose-invert max-w-none" />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </CardContent>
                    </Card>
            )}
        </div>

    </div>
  );
}
