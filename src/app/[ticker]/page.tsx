import { getDashboardData } from '@/app/actions';
import { ExecutionDeck } from '@/components/dashboard/execution-deck';
import { KpiCarousel } from '@/components/dashboard/kpi-carousel';
import { AnalystBrief } from '@/components/dashboard/analyst-brief';
import { PriceChart } from '@/components/price-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UpcomingEarnings from './upcoming-events';
import ActiveSignalTracker from './signal-tracker';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ ticker: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ticker } = await params;
  const data = await getDashboardData(ticker);

  if (!data || !data.seo) {
    return {
      title: `${ticker.toUpperCase()} Stock Analysis | GammaRips`,
      description: `Real-time AI analysis, options flow, and technical signals for ${ticker.toUpperCase()}.`,
    };
  }

  return {
    title: data.seo.title,
    description: data.seo.metaDescription,
    keywords: data.seo.keywords,
  };
}

export default async function Page({ params }: Props) {
  const { ticker } = await params;
  const data = await getDashboardData(ticker);

  if (!data) {
    return notFound();
  }

  return (
    <div className="space-y-8 container py-6 mx-auto max-w-5xl">
      {data.schemaOrg && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data.schemaOrg) }}
        />
      )}
      <ExecutionDeck data={data} />
      
      <KpiCarousel kpis={data.kpis} />
      
      <div className="space-y-8">
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>Price Action</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Visualizing daily price movements and technical trends to spot potential entry and exit points.
                </p>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 min-h-[300px]">
                    {data.priceChartData ? (
                        <PriceChart priceData={data.priceChartData} />
                    ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Chart data unavailable
                    </div>
                    )}
            </CardContent>
        </Card>

        <AnalystBrief analysis={data.analysis} />

        <UpcomingEarnings ticker={ticker} />
        
        <ActiveSignalTracker ticker={ticker} />
      </div>
    </div>
  );
}

