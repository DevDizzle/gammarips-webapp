'use client';

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const router = useRouter();

  const handleViewSignals = () => {
    if (date) {
      // In a real app, this would route to a page fetching that date's data
      // router.push(`/signals?date=${format(date, 'yyyy-MM-dd')}`);
      alert(`Would load signals for ${format(date, 'yyyy-MM-dd')}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline mb-2">Historical Performance</h1>
            <p className="text-muted-foreground">
                Review past signals and performance.
            </p>
         </div>

         <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Select a Date</CardTitle>
                    <CardDescription>View overnight signals from previous sessions.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        disabled={(date) => date > new Date() || date < new Date('2024-01-01')}
                    />
                    <Button className="w-full mt-4" onClick={handleViewSignals} disabled={!date}>
                        View Signals
                    </Button>
                </CardContent>
            </Card>

            <Card className="bg-muted/10 border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
                    <h3 className="text-xl font-bold mb-2">Track Record (Coming Soon)</h3>
                    <p className="text-muted-foreground">
                        We are building a comprehensive performance dashboard showing win rates, average returns, and sector analysis for all historical signals.
                    </p>
                </CardContent>
            </Card>
         </div>
      </main>
    </div>
  );
}
