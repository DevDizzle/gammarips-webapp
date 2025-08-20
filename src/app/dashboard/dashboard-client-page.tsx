"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/markdown";

// Types for results
interface AnalysisResult {
  ticker: string;
  recommendation: "BUY" | "HOLD" | "SELL";
  score: number;
  summary: string;
  highlights: string[];
}

interface Stock {
  id: string;
  result: AnalysisResult;
}

interface DashboardClientPageProps {
  initialStocks: Stock[];
}

function DashboardClientPage({ initialStocks }: DashboardClientPageProps) {
  const [stocks] = useState<Stock[]>(initialStocks);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero CTA */}
      <section className="text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">Your AI Stock Dashboard</h2>
        <p className="mt-2 text-muted-foreground">
          Explore today’s strongest opportunities, updated regularly.
        </p>
        <div className="mt-4">
          <Button asChild size="lg" className="font-bold">
            <Link href="/dashboard?mode=top-pick">
              See Today’s AI Top Picks{" "}
              <ArrowRight className="ml-2 h-5 w-5 inline-block" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Strong stock signals, one click away.
          </p>
        </div>
      </section>

      {/* Stock Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stocks.map((stock) => (
          <Card key={stock.id} className="shadow-lg">
            <CardHeader>
              <CardTitle>
                {stock.result.ticker} — {stock.result.recommendation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-muted-foreground">{stock.result.summary}</p>
              <Accordion type="single" collapsible>
                <AccordionItem value="highlights">
                  <AccordionTrigger>Key Highlights</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {stock.result.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ✅ Default export so page.tsx can import cleanly
export default DashboardClientPage;
