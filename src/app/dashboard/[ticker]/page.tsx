
import { notFound } from 'next/navigation';
import { getOptionsSignals } from '@/app/actions';
import type { OptionsSignal } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request to ensure data is fresh
export const dynamic = 'force-dynamic';

const getSignalColor = (signal: string) => {
    const lowerSignal = signal.toLowerCase();
    if (lowerSignal.includes('bullish') || lowerSignal.includes('strong')) {
      return 'text-green-400';
    }
    if (lowerSignal.includes('bearish') || lowerSignal.includes('weak')) {
      return 'text-red-400';
    }
    if (lowerSignal.includes('low')) {
        return 'text-green-400';
    }
     if (lowerSignal.includes('high')) {
        return 'text-red-400';
    }
    return 'text-muted-foreground';
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
                            <TableHead>Strike</TableHead>
                            <TableHead>Expiration</TableHead>
                            <TableHead>Setup Quality</TableHead>
                            <TableHead>Price Trend</TableHead>
                            <TableHead>IV Signal</TableHead>
                            <TableHead className="w-[40%]">AI Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((option) => (
                            <TableRow key={option.contract_symbol}>
                                <TableCell className="font-medium">${option.strike_price.toFixed(2)}</TableCell>
                                <TableCell>{new Date(option.expiration_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
                                <TableCell>
                                    <Badge variant={option.setup_quality_signal.toLowerCase() === 'strong' ? 'default': 'secondary'} className={cn(getSignalColor(option.setup_quality_signal))}>
                                        {option.setup_quality_signal}
                                    </Badge>
                                </TableCell>
                                <TableCell className={cn("flex items-center gap-1", getSignalColor(option.stock_price_trend_signal))}>
                                    {option.stock_price_trend_signal.toLowerCase() === 'bullish' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                                    {option.stock_price_trend_signal}
                                </TableCell>
                                <TableCell className={cn(getSignalColor(option.iv_signal))}>
                                    {option.iv_signal}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">{option.summary}</TableCell>
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
  const data = await getOptionsSignals(ticker);

  if (!data) {
    notFound();
  }

  const { calls, puts, company_name } = data;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <header className="mb-6">
        <h1 className="text-4xl font-bold font-headline tracking-tight flex items-center gap-2">
          {company_name || ticker}
          <Badge variant="secondary">{ticker}</Badge>
        </h1>
        <p className="text-muted-foreground mt-1">
            AI-Powered Options Signals
        </p>
      </header>
      
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
