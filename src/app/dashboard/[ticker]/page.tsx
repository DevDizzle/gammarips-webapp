

import { notFound } from 'next/navigation';
import { getOptionsSignals, getDashboardData } from '@/app/actions';
import type { OptionsSignal } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PriceChart } from '@/components/price-chart';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request to ensure data is fresh
export const dynamic = 'force-dynamic';

const getSignalColor = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish')) {
      return 'text-green-400';
    }
    if (lowerSignal.includes('bearish')) {
      return 'text-red-400';
    }
    if (lowerSignal === 'low') {
        return 'text-green-400';
    }
     if (lowerSignal === 'high') {
        return 'text-red-400';
    }
    return 'text-foreground';
};

const OptionsTable = ({ title, description, data }: { title: string; description: string, data: OptionsSignal[] }) => {
    if (!data || data.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No options signals available for this ticker at this time.</p>
                </CardContent>
            </Card>
        );
    }
    
    const getQualityVariant = (signal: string) => {
        const lower = signal.toLowerCase();
        if (lower === 'strong') return 'default';
        if (lower === 'weak') return 'destructive';
        return 'secondary';
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-left">Strike</TableHead>
                            <TableHead className="text-left">Expiration</TableHead>
                            <TableHead className="text-left">Setup Quality</TableHead>
                            <TableHead className="text-left">Price Trend</TableHead>
                            <TableHead className="text-left">IV Signal</TableHead>
                            <TableHead className="w-[40%] text-left">AI Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((option) => (
                            <TableRow key={option.contract_symbol}>
                                <TableCell className="font-medium text-left">${option.strike_price.toFixed(2)}</TableCell>
                                <TableCell className="text-left">{new Date(option.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                                <TableCell className="text-left">
                                    <Badge variant={getQualityVariant(option.setup_quality_signal)}>
                                        {option.setup_quality_signal}
                                    </Badge>
                                </TableCell>
                                <TableCell className={cn("flex items-center gap-1 text-left", getSignalColor(option.stock_price_trend_signal))}>
                                    {option.stock_price_trend_signal.toLowerCase() === 'bullish' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                    {option.stock_price_trend_signal}
                                </TableCell>
                                <TableCell className={cn("text-left", getSignalColor(option.iv_signal))}>
                                    {option.iv_signal}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs text-left">{option.summary}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default async function TickerDashboardPage({ params }: TickerDashboardPageProps) {
  const ticker = params.ticker.toUpperCase();
  const optionsData = await getOptionsSignals(ticker);
  const chartData = await getDashboardData(ticker);

  if (!optionsData) {
    notFound();
  }

  const { calls, puts, company_name } = optionsData;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold font-headline tracking-tight flex items-center gap-2">
          {company_name || ticker}
          <Badge variant="secondary">{ticker}</Badge>
        </h1>
        <p className="text-muted-foreground mt-1">
            AI-Powered Options & Price Analysis
        </p>
      </header>

      <section>
          {chartData ? (
                <PriceChart priceData={chartData} />
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
      
      <div className="flex flex-col gap-8">
        <OptionsTable 
            title="Bullish Call Options"
            description="AI-identified call options that may benefit from an expected upward move in the stock price."
            data={calls}
        />
        <OptionsTable 
            title="Bearish Put Options"
            description="AI-identified put options that may benefit from an expected downward move in the stock price."
            data={puts}
        />
      </div>

    </div>
  );
}
