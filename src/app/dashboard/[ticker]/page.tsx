
import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request
// We can change this to generateStaticParams later if needed
export const dynamic = 'force-dynamic';


export default async function TickerDashboardPage({ params }: TickerDashboardPageProps) {
  const ticker = params.ticker.toUpperCase();
  const data = await getDashboardData(ticker);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          {data.company_name || ticker}
        </h1>
        <p className="text-muted-foreground">
          AI-Powered Dashboard for <Badge variant="secondary">{ticker}</Badge>
        </p>
      </div>
      
      {/* 
        For now, we will render the raw JSON to confirm data fetching.
        In the next steps, we can build a beautiful UI to present this data.
      */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Data</CardTitle>
          <CardDescription>Raw JSON data fetched for this ticker.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
