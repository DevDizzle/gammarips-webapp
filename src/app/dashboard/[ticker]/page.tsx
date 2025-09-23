

import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, TrendingUp, Rss, BarChart2, Info, XCircle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceChart } from '@/components/price-chart';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Markdown } from '@/components/markdown';
import NoteworthyOptions from './noteworthy-options';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';


interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

export const dynamic = 'force-dynamic';

const getSentimentClasses = (signal: string) => {
    if (!signal) return 'text-muted-foreground border-border bg-card';
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('strong') || lowerSignal.includes('positive') || lowerSignal.includes('strengthening')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('weak') || lowerSignal.includes('negative') || lowerSignal.includes('weakening') || lowerSignal.includes('underperforming')) {
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    if (lowerSignal.includes('low')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
     if (lowerSignal.includes('high')) {
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

const getIndicator = (signal: string | undefined, IconUp: React.ElementType, IconDown: React.ElementType, IconNeutral: React.ElementType) => {
    if (!signal) return <IconNeutral className="h-4 w-4 text-muted-foreground" />;
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('positive') || lowerSignal.includes('strong') || lowerSignal.includes('strengthening')) {
        return <IconUp className="h-4 w-4 text-green-500" />;
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('negative') || lowerSignal.includes('weak') || lowerSignal.includes('weakening') || lowerSignal.includes('underperforming')) {
        return <IconDown className="h-4 w-4 text-red-500" />;
    }
    return <IconNeutral className="h-4 w-4 text-muted-foreground" />;
};


const KpiCard = ({ title, value, subValue, signal, tooltip, icon, children }: { title: string; value: string; subValue?: string; signal?: string, tooltip: string, icon: React.ReactNode, children?: React.ReactNode }) => (
    <Card className="h-full">
        <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-xs">
                {icon}
                <span>{title}</span>
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
                {value}
                {children}
            </CardTitle>
        </CardHeader>
        {subValue && (
            <CardContent className="pb-2">
                <p className="text-xs text-muted-foreground">{subValue}</p>
            </CardContent>
        )}
         <CardFooter className="pt-2">
            <p className="text-xs text-muted-foreground leading-tight">{tooltip}</p>
        </CardFooter>
    </Card>
);

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
  const isBullish = kpis?.trendStrength?.signal?.toLowerCase().includes('bullish');

  // Calculate RSI change for display
  const rsiChange = kpis?.rsiMomentum?.currentRsi && kpis?.rsiMomentum?.rsi30DaysAgo
    ? kpis.rsiMomentum.currentRsi - kpis.rsiMomentum.rsi30DaysAgo
    : null;
  const rsiChangeDisplay = rsiChange !== null 
    ? `${rsiChange > 0 ? '+' : ''}${rsiChange.toFixed(1)}` 
    : null;
    
  // Calculate Volume Surge percentage
  const volumeSurgePct = kpis?.volumeSurge?.volume && kpis?.volumeSurge?.avgVolume30d
    ? ((kpis.volumeSurge.volume - kpis.volumeSurge.avgVolume30d) / kpis.volumeSurge.avgVolume30d) * 100
    : null;
  const volumeSurgeDisplay = volumeSurgePct !== null ? `${volumeSurgePct > 0 ? '+' : ''}${volumeSurgePct.toFixed(0)}%` : 'N/A';

  const RsiContextBadge = () => {
    if (!kpis?.rsiMomentum?.currentRsi) return null;
    const rsi = kpis.rsiMomentum.currentRsi;
    if (rsi > 70) {
      return <Badge variant="outline" className="text-xs text-red-500 border-red-500/50">Overbought</Badge>;
    }
    if (rsi < 30) {
      return <Badge variant="outline" className="text-xs text-green-500 border-green-500/50">Oversold</Badge>;
    }
    return null;
  };


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

      <NoteworthyOptions ticker={ticker} />

      {/* KPI Section with Carousel */}
      <div className="lg:hidden">
        <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
                {kpis?.trendStrength && <CarouselItem className="basis-3/4"><KpiCard title="Trend Strength" value={`$${kpis.trendStrength.price?.toFixed(2)}`} subValue={`50-Day Avg: $${kpis.trendStrength.sma50?.toFixed(2)}`} signal={kpis.trendStrength.signal} tooltip={"Price vs. its 50-day moving average."} icon={getIndicator(kpis.trendStrength.signal, ArrowUp, ArrowDown, Minus)} /></CarouselItem>}
                {kpis?.rsiMomentum && <CarouselItem className="basis-3/4"><KpiCard title="RSI Momentum" value={kpis.rsiMomentum.currentRsi?.toFixed(1)} subValue={rsiChangeDisplay ? `30D Change: ${rsiChangeDisplay}` : undefined} signal={kpis.rsiMomentum.signal} tooltip={"The 30-day change in the 14-day RSI."} icon={getIndicator(kpis.rsiMomentum.signal, TrendingUp, TrendingDown, Minus)}><RsiContextBadge /></KpiCard></CarouselItem>}
                {kpis?.volumeSurge && <CarouselItem className="basis-3/4"><KpiCard title="Volume Surge" value={volumeSurgeDisplay} subValue={`vs. 30-Day Avg`} signal={kpis.volumeSurge.signal} tooltip={"Recent daily volume compared to its 30-day average."} icon={<BarChart2 size={16} className="text-muted-foreground" />} /></CarouselItem>}
                {kpis?.historicalVolatility && <CarouselItem className="basis-3/4"><KpiCard title="30-Day Volatility" value={`${kpis.historicalVolatility.value?.toFixed(1)}%`} signal={kpis.historicalVolatility.signal} tooltip={"The stock's realized volatility over the last 30 days."} icon={<Rss size={16} className="text-muted-foreground" />} /></CarouselItem>}
                {kpis?.thirtyDayChange && <CarouselItem className="basis-3/4"><KpiCard title="30-Day Return" value={`${kpis.thirtyDayChange.value?.toFixed(1)}%`} subValue={`Industry Avg: ${kpis.thirtyDayChange.industryAverage?.toFixed(1)}%`} signal={kpis.thirtyDayChange.comparisonSignal} tooltip={"The stock's 30-day price change vs. its industry."} icon={getIndicator(kpis.thirtyDayChange.signal, ArrowUp, ArrowDown, Minus)} /></CarouselItem>}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-10px]" />
            <CarouselNext className="absolute right-[-10px]" />
        </Carousel>
      </div>

      <div className="hidden lg:grid grid-cols-5 gap-4">
        {kpis?.trendStrength && <KpiCard title="Trend Strength" value={`$${kpis.trendStrength.price?.toFixed(2)}`} subValue={`50-Day Avg: $${kpis.trendStrength.sma50?.toFixed(2)}`} signal={kpis.trendStrength.signal} tooltip={"Price vs. its 50-day moving average."} icon={getIndicator(kpis.trendStrength.signal, ArrowUp, ArrowDown, Minus)} />}
        {kpis?.rsiMomentum && <KpiCard title="RSI Momentum" value={kpis.rsiMomentum.currentRsi?.toFixed(1)} subValue={rsiChangeDisplay ? `30D Change: ${rsiChangeDisplay}` : undefined} signal={kpis.rsiMomentum.signal} tooltip={"The 30-day change in the 14-day RSI."} icon={getIndicator(kpis.rsiMomentum.signal, TrendingUp, TrendingDown, Minus)}><RsiContextBadge /></KpiCard>}
        {kpis?.volumeSurge && <KpiCard title="Volume Surge" value={volumeSurgeDisplay} subValue={`vs. 30-Day Avg`} signal={kpis.volumeSurge.signal} tooltip={"Recent daily volume compared to its 30-day average."} icon={<BarChart2 size={16} className="text-muted-foreground" />} />}
        {kpis?.historicalVolatility && <KpiCard title="30-Day Volatility" value={`${kpis.historicalVolatility.value?.toFixed(1)}%`} signal={kpis.historicalVolatility.signal} tooltip={"The stock's realized volatility over the last 30 days."} icon={<Rss size={16} className="text-muted-foreground" />} />}
        {kpis?.thirtyDayChange && <KpiCard title="30-Day Return" value={`${kpis.thirtyDayChange.value?.toFixed(1)}%`} subValue={`Industry Avg: ${kpis.thirtyDayChange.industryAverage?.toFixed(1)}%`} signal={kpis.thirtyDayChange.comparisonSignal} tooltip={"The stock's 30-day price change vs. its industry."} icon={getIndicator(kpis.thirtyDayChange.signal, ArrowUp, ArrowDown, Minus)} />}
      </div>
      
      <section>
        <Card>
            <CardHeader>
                <CardTitle>Interactive Price Chart</CardTitle>
                <CardDescription>Analyze price action with volume, 50-day, and 200-day moving averages.</CardDescription>
            </CardHeader>
            <CardContent>
                {priceChartData ? (
                    <PriceChart priceData={priceChartData} />
                ) : (
                    <p className="text-muted-foreground">Price chart data is not available for this ticker.</p>
                )}
            </CardContent>
        </Card>
      </section>
      
      {stockLevelAnalysis && (
          <Card>
              <CardHeader>
                  <CardTitle>AI Analyst Briefing</CardTitle>
                  <CardDescription>Our AI translates complex data—from fundamentals to momentum—into a clear, straightforward outlook.</CardDescription>
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
  );

    

    

    




    

    
