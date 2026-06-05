import Link from "next/link";
import { getAllOvernightSummaries } from "@/lib/firebase-admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Reports — GammaRips V6",
  description: "Every trading day, GammaRips publishes the V6 daily pick (or a documented skip) alongside market context across 5,230+ tickers. Paper-trading, educational only.",
  alternates: { canonical: 'https://gammarips.com/reports' },
};

export default async function ReportsPage() {
  const summaries = await getAllOvernightSummaries(50);

  const indexSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "GammaRips V6 Daily Reports",
    "description": "Every trading day, GammaRips publishes the V6 daily pick with entry, stop, target, and exit — or a documented skip.",
    "url": "https://gammarips.com/reports",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": summaries.map((summary, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Article",
          "url": `https://gammarips.com/reports/${summary.report_date || summary.scan_date}`,
          "name": summary.headline || summary.title || "Daily Overnight Signals",
          "headline": summary.headline || summary.title || "Daily Overnight Signals",
          "description": `${summary.total_signals || 0} Signals Scanned. Bullish: ${summary.bullish_count || 0}. Bearish: ${summary.bearish_count || 0}.`,
          "datePublished": `${summary.report_date || summary.scan_date}T08:30:00Z`
        }
      }))
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(indexSchema) }} />    
      <main className="flex-1 container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" items={[{ name: "Home", href: "/" }, { name: "Daily Reports" }]} />
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">The Morning Briefing</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Every trading day, we publish what institutional money did overnight. Pick a date. See what happened.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((summary) => {
            const dateStr = summary.report_date || summary.scan_date;
            return (
            <Card key={dateStr} className="hover:border-primary/50 transition-colors">
              <Link href={`/reports/${dateStr}`} className="block h-full">
                <CardHeader>
                  <div className="text-sm text-muted-foreground mb-2">
                    {new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    {summary.headline || summary.title || "Daily Overnight Signals"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                     <span className="font-semibold text-foreground">{summary.total_signals || 0}</span> Signals
                     <span>•</span>
                     <span className="text-green-500">{summary.bullish_count || 0} Bull</span>
                     <span>•</span>
                     <span className="text-red-500">{summary.bearish_count || 0} Bear</span>
                  </div>
                  
                  {summary.top_themes && (
                    <div className="flex flex-wrap gap-2">
                      {summary.top_themes.slice(0, 3).map((theme) => (
                        <Badge key={theme} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          )})}
          
          {summaries.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No reports found.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
