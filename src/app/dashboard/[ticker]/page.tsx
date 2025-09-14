
import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Markdown } from '@/components/markdown';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request to ensure data is fresh
export const dynamic = 'force-dynamic';

// Helper to convert GCS URI to a public URL
const convertGcsUriToUrl = (gcsUri: string) => {
  if (!gcsUri?.startsWith('gs://')) return '';
  return gcsUri.replace('gs://', 'https://storage.googleapis.com/');
};

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

  const { titleInfo, kpis, aiAnalystRecommendation, charts } = data;

  // Helper to format KPI values
  const formatValue = (key: string, kpi: any) => {
    if (key === 'dailyChangePct' || key === 'thirtyDayChange' || key === 'revenueQoQ' || key === 'epsGrowth') {
        return `${kpi.value?.toFixed(2)}%`;
    }
    if (typeof kpi.value === 'number') {
        return kpi.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return kpi.value;
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          {titleInfo?.companyName || ticker}
        </h1>
        <div className="text-muted-foreground">
          AI-Powered Dashboard for <Badge variant="secondary">{ticker}</Badge>
        </div>
      </header>
      
      {/* KPIs Section */}
      {kpis && (
        <section>
          <h2 className="text-2xl font-headline font-bold mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(kpis).map(([key, kpi]: [string, any]) => {
              const sentiment = getSentimentMeta(kpi.signal || (key === 'aiScore' ? kpi.recommendation : undefined));
              
              let comparisonText = null;
              if (kpi.vsIndustry) {
                  comparisonText = `vs Industry: ${kpi.vsIndustry.toFixed(2)}%`;
              } else if (key === 'price' && kpi.dailyChangePct) {
                  comparisonText = `${kpi.dailyChangePct > 0 ? '+' : ''}${kpi.dailyChangePct.toFixed(2)}% Today`;
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
        </section>
      )}

      {/* AI Analyst Recommendation */}
      {aiAnalystRecommendation && (
        <section>
          <h2 className="text-2xl font-headline font-bold mb-4">AI Analyst Recommendation</h2>
          <Card>
            <CardHeader>
              <CardTitle>{aiAnalystRecommendation.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72 w-full rounded-md border p-4">
                 <Markdown content={aiAnalystRecommendation.markdownContent} />
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Charts Section */}
      {charts && (
        <section>
            <h2 className="text-2xl font-headline font-bold mb-4">Charts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(charts).map(([key, chart]: [string, any]) => (
                    <Card key={key}>
                        <CardHeader>
                            <CardTitle>{formatKey(key)}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative aspect-video">
                                <Image 
                                    src={convertGcsUriToUrl(chart.uri)}
                                    alt={chart.alt}
                                    fill
                                    className="object-contain rounded-b-lg"
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      )}

    </div>
  );
}
