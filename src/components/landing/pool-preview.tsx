import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

// Proof that the data is real and current. Data comes from the page (Firestore
// via firebase-admin); this component only renders it.
//
// Two deliberate omissions. The pool is bullish-only by design, so a "bear: 0"
// counter is noise. And no per-name score is shown: the pool measured
// indistinguishable from matched random on returns (selection research closed
// 2026-08-22), so a ranked-looking list would imply an edge we cannot show.

type Props = {
  summary: any;
  report: any;
  reportDate: string | null;
  signals: any[];
};

export function PoolPreview({ summary, report, reportDate, signals }: Props) {
  if (!summary) return null;

  const dateKey = reportDate || summary.scan_date;
  const enriched = report?.total_signals || summary.total_signals;
  const bullish = report?.bullish_count || summary.bullish_count || 0;

  return (
    <section>
      <Card className="border-primary/30 bg-card/80">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {new Date(dateKey).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold font-headline mt-1">
                {report?.title || summary.headline || "Today's pool"}
              </h2>
            </div>
            <Link href={`/reports/${dateKey}`} className="shrink-0">
              <Button variant="outline" size="sm">
                Full report <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 mb-4">
            <div>
              <span className="text-3xl font-bold">{enriched}</span>
              <span className="text-sm text-muted-foreground ml-2">
                contracts in the pool
              </span>
            </div>
            <div>
              <span className="text-3xl font-bold text-green-500">{bullish}</span>
              <span className="text-sm text-muted-foreground ml-2">
                bullish names, one call each
              </span>
            </div>
          </div>

          {summary.market_narrative && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {summary.market_narrative}
            </p>
          )}

          {summary.top_themes && summary.top_themes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {summary.top_themes.slice(0, 5).map((theme: string) => (
                <Badge key={theme} variant="secondary" className="text-xs">
                  {theme}
                </Badge>
              ))}
            </div>
          )}

          {signals.length > 0 && (
            <div className="mt-6 border-t border-border/60 pt-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold font-headline">A sample of the pool</h3>
                <Link
                  href="/signals"
                  className="text-sm text-primary hover:underline"
                >
                  See every name, free &rarr;
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Every name in the pool is free to read on this site. The pool is
                not ranked, and nothing here is a recommendation.
              </p>
              <div className="grid gap-2">
                {signals.map((signal: any) => (
                  <div
                    key={signal.id}
                    className="rounded-lg border bg-card/50 p-3 flex items-center gap-4"
                  >
                    <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/20 text-green-500 shrink-0">
                      BULL
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold font-headline">
                        {signal.ticker}
                      </span>
                      {signal.thesis && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {signal.thesis}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
