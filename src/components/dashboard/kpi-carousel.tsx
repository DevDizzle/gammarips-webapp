'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Minus, TrendingUp, Rss, BarChart2, TrendingDown } from 'lucide-react';
import { DashboardDataV2 } from '@/lib/types/dashboard-v2';

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

const KpiCard = ({ title, value, subValue, tooltip, icon, children }: { title: string; value: string; subValue?: string; tooltip: string, icon: React.ReactNode, children?: React.ReactNode }) => (
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

export function KpiCarousel({ kpis }: { kpis: DashboardDataV2['kpis'] }) {
    if (!kpis) return null;

    // Calculate RSI change for display
    const rsiChange = kpis.rsiMomentum?.currentRsi && kpis.rsiMomentum?.rsi30DaysAgo
      ? Number(kpis.rsiMomentum.currentRsi) - Number(kpis.rsiMomentum.rsi30DaysAgo)
      : null;
    const rsiChangeDisplay = rsiChange !== null 
      ? `${rsiChange > 0 ? '+' : ''}${rsiChange.toFixed(1)}` 
      : null;
      
    // Calculate Volume Surge percentage
    const volumeSurgePct = kpis.volumeSurge?.volume && kpis.volumeSurge?.avgVolume30d
      ? ((Number(kpis.volumeSurge.volume) - Number(kpis.volumeSurge.avgVolume30d)) / Number(kpis.volumeSurge.avgVolume30d)) * 100
      : null;
    const volumeSurgeDisplay = volumeSurgePct !== null ? `${volumeSurgePct > 0 ? '+' : ''}${volumeSurgePct.toFixed(0)}%` : 'N/A';
  
    const RsiContextBadge = () => {
      if (!kpis.rsiMomentum?.currentRsi) return null;
      const rsi = Number(kpis.rsiMomentum.currentRsi);
      if (rsi > 70) {
        return <Badge variant="outline" className="text-xs text-red-500 border-red-500/50">Overbought</Badge>;
      }
      if (rsi < 30) {
        return <Badge variant="outline" className="text-xs text-green-500 border-green-500/50">Oversold</Badge>;
      }
      return null;
    };
  
    const trendStrengthValue = kpis.trendStrength?.price
      ? `$${Number(kpis.trendStrength.price).toFixed(2)}`
      : 'N/A';
    
    const trendStrengthSubValue = kpis.trendStrength?.sma50 
      ? `50-Day Avg: $${Number(kpis.trendStrength.sma50).toFixed(2)}`
      : undefined;

    return (
        <>
            {/* Mobile Carousel */}
            <div className="-mx-4 sm:-mx-6 lg:hidden lg:-mx-8">
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent className="px-4 sm:px-6 lg:px-8">
                        {kpis.trendStrength && <CarouselItem className="basis-3/4"><KpiCard title="Trend Strength" value={trendStrengthValue} subValue={trendStrengthSubValue} tooltip={kpis.trendStrength.tooltip} icon={getIndicator(kpis.trendStrength.signal, ArrowUp, ArrowDown, Minus)} /></CarouselItem>}
                        {kpis.rsiMomentum && <CarouselItem className="basis-3/4"><KpiCard title="RSI Momentum" value={Number(kpis.rsiMomentum.currentRsi)?.toFixed(1)} subValue={rsiChangeDisplay ? `Change: ${rsiChangeDisplay}` : undefined} tooltip={kpis.rsiMomentum.tooltip} icon={getIndicator(kpis.rsiMomentum.signal, TrendingUp, TrendingDown, Minus)}><RsiContextBadge /></KpiCard></CarouselItem>}
                        {kpis.volumeSurge && <CarouselItem className="basis-3/4"><KpiCard title="Volume Surge" value={volumeSurgeDisplay} subValue={`vs. 30-Day Avg`} tooltip={kpis.volumeSurge.tooltip} icon={<BarChart2 size={16} className="text-muted-foreground" />} /></CarouselItem>}
                        {kpis.historicalVolatility && <CarouselItem className="basis-3/4"><KpiCard title="30-Day Volatility" value={`${Number(kpis.historicalVolatility.value)?.toFixed(1)}%`} tooltip={kpis.historicalVolatility.tooltip} icon={<Rss size={16} className="text-muted-foreground" />} /></CarouselItem>}
                        {kpis.thirtyDayChange && <CarouselItem className="basis-3/4"><KpiCard title="30-Day Return" value={`${Number(kpis.thirtyDayChange.value)?.toFixed(1)}%`} subValue={`Industry Avg: ${Number(kpis.thirtyDayChange.industryAverage)?.toFixed(1)}%`} tooltip={kpis.thirtyDayChange.tooltip} icon={getIndicator(kpis.thirtyDayChange.signal, ArrowUp, ArrowDown, Minus)} /></CarouselItem>}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-[-10px]" />
                    <CarouselNext className="absolute right-[-10px]" />
                </Carousel>
            </div>

            {/* Desktop Grid */}
            <div className="hidden lg:grid grid-cols-5 gap-4">
                {kpis.trendStrength && <KpiCard title="Trend Strength" value={trendStrengthValue} subValue={trendStrengthSubValue} tooltip={kpis.trendStrength.tooltip} icon={getIndicator(kpis.trendStrength.signal, ArrowUp, ArrowDown, Minus)} />}
                {kpis.rsiMomentum && <KpiCard title="RSI Momentum" value={Number(kpis.rsiMomentum.currentRsi)?.toFixed(1)} subValue={rsiChangeDisplay ? `Change: ${rsiChangeDisplay}` : undefined} tooltip={kpis.rsiMomentum.tooltip} icon={getIndicator(kpis.rsiMomentum.signal, TrendingUp, TrendingDown, Minus)}><RsiContextBadge /></KpiCard>}
                {kpis.volumeSurge && <KpiCard title="Volume Surge" value={volumeSurgeDisplay} subValue={`vs. 30-Day Avg`} tooltip={kpis.volumeSurge.tooltip} icon={<BarChart2 size={16} className="text-muted-foreground" />} />}
                {kpis.historicalVolatility && <KpiCard title="30-Day Volatility" value={`${Number(kpis.historicalVolatility.value)?.toFixed(1)}%`} tooltip={kpis.historicalVolatility.tooltip} icon={<Rss size={16} className="text-muted-foreground" />} />}
                {kpis.thirtyDayChange && <KpiCard title="30-Day Return" value={`${Number(kpis.thirtyDayChange.value)?.toFixed(1)}%`} subValue={`Industry Avg: ${Number(kpis.thirtyDayChange.industryAverage)?.toFixed(1)}%`} tooltip={kpis.thirtyDayChange.tooltip} icon={getIndicator(kpis.thirtyDayChange.signal, ArrowUp, ArrowDown, Minus)} />}
            </div>
        </>
    );
}
