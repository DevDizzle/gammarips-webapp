
import { notFound } from 'next/navigation';
import { getDashboardData } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface TickerDashboardPageProps {
  params: {
    ticker: string;
  };
}

// Re-render this page on every request
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

// Helper to render different value types
const renderValue = (value: any) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return <p className="text-sm text-muted-foreground">{String(value)}</p>;
    }
    if (Array.isArray(value)) {
        return (
             <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {value.map((item, index) => <li key={index}>{renderValue(item)}</li>)}
            </ul>
        )
    }
    if (typeof value === 'object' && value !== null) {
        return (
            <div className="mt-2 space-y-2 rounded-lg bg-background p-3">
                {Object.entries(value).map(([key, val]) => (
                    <div key={key}>
                        <p className="font-semibold text-foreground">{formatKey(key)}</p>
                        {renderValue(val)}
                    </div>
                ))}
            </div>
        )
    }
    return null;
}

export default async function TickerDashboardPage({ params }: TickerDashboardPageProps) {
  const ticker = params.ticker.toUpperCase();
  const data = await getDashboardData(ticker);

  if (!data) {
    notFound();
  }

  const { company_name, ticker: dataTicker, ...restOfData } = data;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          {company_name || ticker}
        </h1>
        <div className="text-muted-foreground">
          AI-Powered Dashboard for <Badge variant="secondary">{ticker}</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(restOfData).map(([key, value]) => (
          <Card key={key} className="col-span-1 lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle>{formatKey(key)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              {renderValue(value)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
