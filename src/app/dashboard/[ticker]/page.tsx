
import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowDown, ArrowUp, Calendar, Activity, Bot } from 'lucide-react';
import { Markdown } from '@/components/markdown';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request to ensure data is fresh
export const dynamic = 'force-dynamic';

// Helper to format keys into readable titles
const formatKey = (key: string) => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getSentimentMeta = (signal?: string) => {
    switch (signal?.toLowerCase()) {
        case 'strong':
        case 'positive':
        case 'outperform':
        case 'buy':
            return { color: 'text-green-500', icon: <ArrowUp className="h-4 w-4" /> };
        case 'weak':
        case 'negative':
        case 'underperform':
        case 'sell':
            return { color: 'text-red-500', icon: <ArrowDown className="h-4 w-4" /> };
        default:
            return { color: 'text-muted-foreground', icon: null };
    }
};

export default async function TickerDashboardPage({ params }: TickerDashboardPageProps) {
  const ticker = params.ticker.toUpperCase();
  const data = await getDashboardData(ticker);

  if (!data) {
    notFound();
  }

  const { titleInfo, kpis, aiAnalystRecommendation, calendar, options } = data;

  // Helper to format KPI values
  const formatValue = (key: string, kpi: any) => {
    if (key === 'dailyChangePct' || key === 'thirtyDayChange' || key === 'revenueQoQ' || key === 'epsGrowth') {
        const value = kpi.value ?? 0;
        return `${value.toFixed(2)}%`;
    }
    if (typeof kpi.value === 'number') {
        return kpi.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return kpi.value;
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight flex items-center gap-2">
          {titleInfo?.companyName || ticker}
          <Badge variant="secondary">{ticker}</Badge>
        </h1>
      </header>
      
      {/* KPIs Section */}
      {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(kpis).map(([key, kpi]: [string, any]) => {
              const sentiment = getSentimentMeta(kpi.signal || (key === 'aiScore' ? kpi.recommendation : undefined));
              
              let comparisonText = null;
              if (kpi.vsIndustry) {
                  const vsIndustryValue = kpi.vsIndustry ?? 0;
                  comparisonText = `vs Industry: ${vsIndustryValue.toFixed(2)}%`;
              } else if (key === 'price' && kpi.dailyChangePct) {
                  const dailyChange = kpi.dailyChangePct ?? 0;
                  comparisonText = `${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}% Today`;
              }

              return (
                <Card key={key} className="text-center">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{formatKey(key)}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{formatValue(key, kpi)}</p>
                    {comparisonText && (
                      <p className={`text-xs flex items-center justify-center gap-1 ${sentiment.color}`}>
                          {sentiment.icon}
                          {comparisonText}
                      </p>
                    )}
                     {key === 'aiScore' && kpi.recommendation && (
                        <Badge className={`mt-2 ${sentiment.color === 'text-green-500' ? 'bg-green-500/20 text-green-700' : sentiment.color === 'text-red-500' ? 'bg-red-500/20 text-red-700' : 'bg-secondary'}`}>
                            {kpi.recommendation}
                        </Badge>
                     )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Economic Events */}
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="text-primary" />
                    Economic Events
                </CardTitle>
                <CardDescription>Upcoming events for {ticker}.</CardDescription>
            </CardHeader>
            <CardContent>
                {calendar && Object.keys(calendar).length > 0 ? (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Event</TableHead>
                                <TableHead className="text-right">Impact</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.values(calendar).map((event: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{event.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={event.impact?.toLowerCase() === 'high' ? 'destructive' : 'secondary'}>
                                            {event.impact || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">No upcoming economic events found for this ticker.</p>
                )}
            </CardContent>
        </Card>

        {/* Options Trades */}
        <Card className="lg:col-span-1">
             <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="text-primary" />
                    Noteworthy Options
                </CardTitle>
                <CardDescription>Significant options activity for {ticker}.</CardDescription>
            </CardHeader>
            <CardContent>
                 {options && Object.keys(options).length > 0 ? (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Strike</TableHead>
                                <TableHead>Expiry</TableHead>
                                <TableHead className="text-right">Premium</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.values(options).map((opt: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Badge variant={opt.type === 'CALL' ? 'outline' : 'destructive'} className={opt.type === 'CALL' ? 'text-green-500 border-green-500/50' : 'text-red-500 border-red-500/50'}>
                                            {opt.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{`$${opt.strike_price?.toFixed(2)}`}</TableCell>
                                    <TableCell>{new Date(opt.expiry_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">{`$${opt.premium?.toFixed(2)}`}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">No noteworthy options trades found.</p>
                )}
            </CardContent>
        </Card>
        
        {/* AI Analyst Comments */}
        {aiAnalystRecommendation && (
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="text-primary" />
                        AI Analyst Comments
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-72 w-full rounded-md border p-4">
                        <Markdown content={aiAnalystRecommendation.markdownContent} />
                    </ScrollArea>
                </CardContent>
            </Card>
        )}
      </div>

    </div>
  );
}
