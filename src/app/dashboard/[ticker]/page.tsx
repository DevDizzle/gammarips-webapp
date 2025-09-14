
import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowDown, ArrowUp } from 'lucide-react';

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

const sentimentColorClasses = {
  good: 'border-green-500/80',
  bad: 'border-red-500/80',
  neutral: 'border-border',
};

const sentimentIcon = {
    good: <ArrowUp className="h-4 w-4 text-green-500" />,
    bad: <ArrowDown className="h-4 w-4 text-red-500" />,
    neutral: null
}

export default async function TickerDashboardPage({ params }: TickerDashboardPageProps) {
  const ticker = params.ticker.toUpperCase();
  const data = await getDashboardData(ticker);

  if (!data) {
    notFound();
  }

  const { company_name, kpis, ai_analyst_recommendation, charts } = data;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          {company_name || ticker}
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
            {Object.entries(kpis).map(([key, kpi]: [string, any]) => (
              <Card key={key} className={`text-center ${sentimentColorClasses[kpi.sentiment as keyof typeof sentimentColorClasses] || 'border-border'}`}>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{formatKey(key)}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                   {kpi.comparison && (
                    <p className={`text-xs flex items-center justify-center gap-1 ${kpi.sentiment === 'good' ? 'text-green-500' : kpi.sentiment === 'bad' ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {sentimentIcon[kpi.sentiment as keyof typeof sentimentIcon]}
                        {kpi.comparison}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* AI Analyst Recommendation */}
      {ai_analyst_recommendation && (
        <section>
          <h2 className="text-2xl font-headline font-bold mb-4">AI Analyst Recommendation</h2>
          <Card>
            <CardHeader>
              <CardTitle>
                <Badge variant={ai_analyst_recommendation.rating === 'BUY' ? 'default' : (ai_analyst_recommendation.rating === 'SELL' ? 'destructive' : 'secondary')}>
                  {ai_analyst_recommendation.rating}
                </Badge>
              </CardTitle>
              <CardDescription>{ai_analyst_recommendation.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48 w-full rounded-md border p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ai_analyst_recommendation.full_analysis}</p>
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
                        <CardContent>
                            <div className="relative aspect-video">
                                <Image 
                                    src={convertGcsUriToUrl(chart.uri)}
                                    alt={chart.alt}
                                    fill
                                    className="object-contain rounded-md"
                                />
                            </div>
                             <p className="text-xs text-muted-foreground mt-2">{chart.alt}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
      )}

    </div>
  );
}
