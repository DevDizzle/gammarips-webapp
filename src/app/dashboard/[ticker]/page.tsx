

'use client';

import { notFound, useRouter, useParams } from 'next/navigation';
import { getDashboardData, incrementDashboardViewCount } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, TrendingUp, Rss, BarChart2, Info, XCircle, TrendingDown, ArrowRight, Loader2, MailCheck, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceChart } from '@/components/price-chart';
import { Markdown } from '@/components/markdown';
import SignalTracker from './noteworthy-options';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import UpcomingEarnings from './upcoming-events';
import DashboardPageClient from '../dashboard-client';
import DataUpdatingPage from '@/components/layout/data-updating-page';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

const getSentimentClasses = (signal: string) => {
    if (!signal) return 'text-muted-foreground border-border bg-card';
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('strong') || lowerSignal.includes('positive') || lowerSignal.includes('strengthening')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('weak') || lowerSignal.includes('negative') || lowerSignal.includes('weakening') || lowerSignal.includes('underperforming')) {
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    if (lowerSignal.includes('low') || lowerSignal.includes('cheap')) {
        return 'text-green-500 border-green-500/20 bg-green-500/10';
    }
     if (lowerSignal.includes('high') || lowerSignal.includes('expensive')) {
        return 'text-red-500 border-red-500/20 bg-red-500/10';
    }
    return 'text-muted-foreground border-border bg-card';
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

function TickerDashboard({ data, ticker }: { data: any, ticker: string }) {
  const { titleInfo, kpis, priceChartData, stockLevelAnalysis, industry, optionsHeader, topSignalSummary } = data;

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

  const trendStrengthValue = kpis?.trendStrength?.price
    ? `$${kpis.trendStrength.price.toFixed(2)}`
    : 'N/A';
  
  const trendStrengthSubValue = kpis?.trendStrength?.sma50 
    ? `50-Day Avg: $${kpis.trendStrength.sma50.toFixed(2)}`
    : undefined;

  // Correctly format the run date to avoid timezone issues
  const formattedRunDate = new Date(data.runDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Treat the date string as UTC to prevent day-before errors
  });


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="truncate">{titleInfo.companyName} ({ticker})</span>
          {industry && <Badge variant="secondary">{industry}</Badge>}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
            AI-Powered Options & Equity Analysis as of {formattedRunDate} at 5:00 AM EST
        </p>
      </header>

      {optionsHeader && (
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Star className="text-primary" />
                    Top-Rated Option
                </CardTitle>
                 <CardDescription>{topSignalSummary}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-4">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-background/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Type</p>
                                <Badge variant="outline" className={cn('mt-1 font-semibold', optionsHeader.optionType === 'call' ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50')}>
                                    {optionsHeader.optionType.toUpperCase()}
                                </Badge>
                            </div>
                             <div className="bg-background/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Strike Price</p>
                                <p className="font-semibold text-lg">${optionsHeader.strikePrice.toFixed(2)}</p>
                            </div>
                             <div className="bg-background/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Exp. Date</p>
                                <p className="font-semibold text-lg">{new Date(optionsHeader.expirationDate).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                             <div className="bg-background/50 p-3 rounded-lg">
                                <p className="text-xs text-muted-foreground">Days to Exp.</p>
                                <p className="font-semibold text-lg">{optionsHeader.dte}</p>
                            </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono bg-background/50 p-2 rounded text-center">
                            {optionsHeader.contractSymbol}
                        </div>
                    </div>
                     <div className="flex-shrink-0 sm:w-48 space-y-2">
                        <Badge className={cn("w-full justify-center", getSentimentClasses(optionsHeader.setupQuality))}>
                            Setup Quality: {optionsHeader.setupQuality}
                        </Badge>
                        <Badge className={cn("w-full justify-center", getSentimentClasses(optionsHeader.trendSignal))}>
                            Stock Trend: {optionsHeader.trendSignal}
                        </Badge>
                         <Badge className={cn("w-full justify-center", getSentimentClasses(optionsHeader.volatilitySignal))}>
                            Volatility: {optionsHeader.volatilitySignal}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* KPI Section with Carousel */}
      <div className="lg:hidden -mx-4 sm:-mx-6 lg:-mx-8">
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="px-4 sm:px-6 lg:px-8">
                {kpis?.trendStrength && <CarouselItem className="basis-3/4"><KpiCard title="Trend Strength" value={trendStrengthValue} subValue={trendStrengthSubValue} signal={kpis.trendStrength.signal} tooltip={"Price vs. its 50-day moving average."} icon={getIndicator(kpis.trendStrength.signal, ArrowUp, ArrowDown, Minus)} /></CarouselItem>}
                {kpis?.rsiMomentum && <CarouselItem className="basis-3/4"><KpiCard title="RSI Momentum" value={kpis.rsiMomentum.currentRsi?.toFixed(1)} subValue={rsiChangeDisplay ? `Change: ${rsiChangeDisplay}` : undefined} signal={kpis.rsiMomentum.signal} tooltip={"The 30-day change in the 14-day RSI."} icon={getIndicator(kpis.rsiMomentum.signal, TrendingUp, TrendingDown, Minus)}><RsiContextBadge /></KpiCard></CarouselItem>}
                {kpis?.volumeSurge && <CarouselItem className="basis-3/4"><KpiCard title="Volume Surge" value={volumeSurgeDisplay} subValue={`vs. 30-Day Avg`} signal={kpis.volumeSurge.signal} tooltip={"Recent daily volume compared to its 30-day average."} icon={<BarChart2 size={16} className="text-muted-foreground" />} /></CarouselItem>}
                {kpis?.historicalVolatility && <CarouselItem className="basis-3/4"><KpiCard title="30-Day Volatility" value={`${kpis.historicalVolatility.value?.toFixed(1)}%`} signal={kpis.historicalVolatility.signal} tooltip={"The stock's realized volatility over the last 30 days."} icon={<Rss size={16} className="text-muted-foreground" />} /></CarouselItem>}
                {kpis?.thirtyDayChange && <CarouselItem className="basis-3/4"><KpiCard title="30-Day Return" value={`${kpis.thirtyDayChange.value?.toFixed(1)}%`} subValue={`Industry Avg: ${kpis.thirtyDayChange.industryAverage?.toFixed(1)}%`} signal={kpis.thirtyDayChange.comparisonSignal} tooltip={"The stock's 30-day price change vs. its industry."} icon={getIndicator(kpis.thirtyDayChange.signal, ArrowUp, ArrowDown, Minus)} /></CarouselItem>}
            </CarouselContent>
            <CarouselPrevious className="absolute left-[-10px]" />
            <CarouselNext className="absolute right-[-10px]" />
        </Carousel>
      </div>

      <div className="hidden lg:grid grid-cols-5 gap-4">
        {kpis?.trendStrength && <KpiCard title="Trend Strength" value={trendStrengthValue} subValue={trendStrengthSubValue} signal={kpis.trendStrength.signal} tooltip={"Price vs. its 50-day moving average."} icon={getIndicator(kpis.trendStrength.signal, ArrowUp, ArrowDown, Minus)} />}
        {kpis?.rsiMomentum && <KpiCard title="RSI Momentum" value={kpis.rsiMomentum.currentRsi?.toFixed(1)} subValue={rsiChangeDisplay ? `Change: ${rsiChangeDisplay}` : undefined} signal={kpis.rsiMomentum.signal} tooltip={"The 30-day change in the 14-day RSI."} icon={getIndicator(kpis.rsiMomentum.signal, TrendingUp, TrendingDown, Minus)}><RsiContextBadge /></KpiCard>}
        {kpis?.volumeSurge && <KpiCard title="Volume Surge" value={volumeSurgeDisplay} subValue={`vs. 30-Day Avg`} signal={kpis.volumeSurge.signal} tooltip={"Recent daily volume compared to its 30-day average."} icon={<BarChart2 size={16} className="text-muted-foreground" />} />}
        {kpis?.historicalVolatility && <KpiCard title="30-Day Volatility" value={`${kpis.historicalVolatility.value?.toFixed(1)}%`} signal={kpis.historicalVolatility.signal} tooltip={"The stock's realized volatility over the last 30 days."} icon={<Rss size={16} className="text-muted-foreground" />} />}
        {kpis?.thirtyDayChange && <KpiCard title="30-Day Return" value={`${kpis.thirtyDayChange.value?.toFixed(1)}%`} subValue={`Industry Avg: ${kpis.thirtyDayChange.industryAverage?.toFixed(1)}%`} signal={kpis.thirtyDayChange.comparisonSignal} tooltip={"The stock's 30-day price change vs. its industry."} icon={getIndicator(kpis.thirtyDayChange.signal, ArrowUp, ArrowDown, Minus)} />}
      </div>
      
      <UpcomingEarnings ticker={ticker} />

      <section>
        <Card>
            <CardHeader>
                <CardTitle>Interactive Price Chart</CardTitle>
                <CardDescription>Analyze price action with volume, 50-day, and 200-day moving averages. For a better experience, view on desktop.</CardDescription>
            </CardHeader>
            <CardContent className="relative">
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
                   <Markdown content={stockLevelAnalysis} className="prose-sm prose-invert max-w-none" />
              </CardContent>
          </Card>
      )}

      <SignalTracker ticker={ticker} />

      {stockLevelAnalysis && (
        <div className="flex justify-center mt-6">
          <Button asChild variant="outline" size="lg">
              <Link href={`/stocks/${ticker}`}>
                  View Full Analyst Report <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function TickerDashboardPage() {
  const params = useParams<{ ticker: string }>();
  const ticker = params.ticker || '';
  const { user, dbUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !dbUser) return; // Wait for auth state to be resolved by DashboardPageClient

    // Increment usage count for free trial users
    if (!dbUser.isSubscribed) {
        incrementDashboardViewCount(user.uid).catch(console.error);
    }

    const fetchData = async () => {
      if (!ticker) return;
      setLoading(true);
      setError(null); // Reset error on new fetch
      try {
        const dashboardData = await getDashboardData(ticker.toUpperCase());
        if (!dashboardData) {
          throw new Error(`Could not load dashboard data for ${ticker.toUpperCase()}.`);
        }
        setData(dashboardData);
      } catch (e: any) {
        console.error("Failed to fetch dashboard data", e);
        setError(e.message || "An unknown error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [ticker, user, dbUser]);


  if (loading) {
      return (
          <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
              <Loader2 className="h-10 w-10 animate-spin" />
          </div>
      )
  }
  
  const content = (
    data && !error
        ? <TickerDashboard data={data} ticker={ticker.toUpperCase()} />
        : <DataUpdatingPage />
  )

  return (
    <DashboardPageClient>
        {content}
    </DashboardPageClient>
  );
}
