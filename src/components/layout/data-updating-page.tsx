import { Bot } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function DataUpdatingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center text-center px-4">
        <Card className="max-w-xl w-full">
            <CardHeader>
                <Bot className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4 font-headline text-2xl">Data Refresh in Progress</CardTitle>
                <CardDescription>
                    Our AI is currently analyzing the latest market data to bring you the freshest insights. This process happens throughout the day to ensure our signals are timely.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    The dashboard will be available again shortly. Please check back in a few minutes.
                </p>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
