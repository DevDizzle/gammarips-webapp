
import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowDown, ArrowUp, HelpCircle, Minus } from 'lucide-react';
import { Markdown } from '@/components/markdown';
import { PriceChart } from '@/components/price-chart';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request to ensure data is fresh
export const dynamic = 'force-dynamic';

const getSignalMeta = (signal?: string) => {
    switch (signal?.toLowerCase()) {
        case 'bullish':
        case 'high':
             return { color: 'text-green-500', icon: <ArrowUp className="h-4 w-4" /> };
        case 'bearish':
        case 'low':
            return { color: 'text-red-500', icon: <ArrowDown className="h-4 w-4" /> };
        default:
            return { color: 'text-muted-foreground', icon: <Minus className="h-4 w-4" /> };
    }
};

const formatKpiKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

export default async function TickerDashboardPage({ params }: TickerDashboardPageProps) {
  const ticker = params.ticker.toUpperCase();
  const data = await getDashboardData(ticker);

  if (!data) {
    notFound();
  }

  const { titleInfo, kpis, priceChartData, stockLevelAnalysis } = data;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold font-headline tracking-tight flex items-center gap-2">
          {titleInfo?.companyName || ticker}
          <Badge variant="secondary">{ticker}</Badge>
        </h1>
        <p className="text-muted-foreground mt-1">
            As of {new Date(titleInfo.asOfDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>
      
      {/* KPIs Section */}
      {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TooltipProvider>
            {Object.entries(kpis).map(([key, kpi]: [string, any]) => {
              const signalMeta = getSignalMeta(kpi.signal);
              const displayValue = typeof kpi.value === 'number' ? kpi.value.toFixed(1) : kpi.value;
              return (
                <Tooltip key={key}>
                    <TooltipTrigger asChild>
                        <Card className="text-center">
                        <CardHeader className="p-4 pb-2 flex-row items-center justify-center gap-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{formatKpiKey(key)}</CardTitle>
                            {kpi.tooltip && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${signalMeta.color}`}>
                                {signalMeta.icon}
                                {displayValue}
                            </p>
                        </CardContent>
                        </Card>
                    </TooltipTrigger>
                    {kpi.tooltip && (
                        <TooltipContent>
                            <p>{kpi.tooltip}</p>
                        </TooltipContent>
                    )}
                </Tooltip>
              );
            })}
            </TooltipProvider>
          </div>
      )}

      {/* Main Content Stack */}
      <div className="flex flex-col gap-6">
        
        {/* AI Stock Analysis */}
        <Card>
             <CardHeader>
                <CardTitle>AI Stock Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm prose-invert max-w-none">
                    <Markdown content={stockLevelAnalysis || "No analysis available."} />
                </div>
            </CardContent>
        </Card>

        {/* Price Chart */}
        <Card>
            <CardHeader>
                <CardTitle>Price Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
                {priceChartData ? (
                    <PriceChart priceData={priceChartData} />
                ) : (
                    <div className="h-[400px] flex items-center justify-center">
                        <p className="text-muted-foreground">Price chart data is not available.</p>
                    </div>
                )}
            </CardContent>
        </Card>
        
      </div>

    </div>
  );
}
