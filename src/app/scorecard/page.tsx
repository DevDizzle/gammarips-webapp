import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FlaskConical, LineChart, Scale, Beaker } from 'lucide-react';
import { getPoolOutcomes } from '@/lib/firebase-admin';
import { PoolOutcomesTiles } from '@/components/landing/pool-outcomes-tiles';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Track Record — Every Candidate, Tracked',
  description:
    'The full GammaRips pool outcome record: every candidate the engine surfaces is tracked to its realized outcome — peak excursions, drawdowns, and the honest blind-buy baseline (which loses). Distributions with sample sizes, not a highlight reel. Paper-trading data, educational only.',
  alternates: { canonical: 'https://gammarips.com/scorecard' },
  openGraph: {
    title: 'Track Record — Every Candidate, Tracked | GammaRips',
    description:
      'The whole pool, tracked to outcome — excursion distributions and the honest blind-buy baseline. No highlight reel.',
    url: 'https://gammarips.com/scorecard',
  },
};

export default async function TrackRecordPage() {
  const outcomes = await getPoolOutcomes();

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'GammaRips Pool Outcome Record',
    description:
      'Realized outcomes for every candidate in the GammaRips curated options-flow pool: per-contract peak/trough excursions (the opportunity surface) and fixed-bracket baseline labels, tracked daily on a paper-trading basis. Published as distributions with sample sizes; the blind-buy composite baseline is negative and published as such. Not investment advice.',
    url: 'https://gammarips.com/scorecard',
    creator: { '@type': 'Organization', name: 'GammaRips', url: 'https://gammarips.com' },
    license: 'https://gammarips.com/disclosures',
    isAccessibleForFree: true,
    ...(outcomes
      ? { temporalCoverage: `${outcomes.first_scan_date}/${outcomes.last_scan_date}` }
      : {}),
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Track Record</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
          Every candidate, tracked.
        </h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Not a highlight reel and not one lucky account: every contract the engine
          surfaces enters the outcome record and is tracked to its result — winners
          and losers counted the same way, nothing edited after the fact.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      <PoolOutcomesTiles outcomes={outcomes} />

      <Separator className="my-12 sm:my-16" />

      {/* How to read these numbers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50">
          <CardContent className="p-5 space-y-2">
            <LineChart className="h-5 w-5 text-primary" />
            <h2 className="font-bold font-headline">The opportunity surface</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For each contract we record how far it actually ran (peak) and how far
              it fell (drawdown) over its tracked window. That&apos;s profit{' '}
              <em>potential</em> — what was there for someone with the right exit —
              not a return anyone earned. The median candidate touched a meaningful
              peak; the tail touched very large ones. The drawdowns are published
              with equal prominence.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-5 space-y-2">
            <Scale className="h-5 w-5 text-primary" />
            <h2 className="font-bold font-headline">The honest baseline</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              &ldquo;Blind-buy baseline&rdquo; answers the question every visitor
              should ask: what if you just bought everything? Under a fixed same-day
              bracket, the whole pool <strong className="text-foreground">loses</strong>. We
              publish that number on purpose — it&apos;s why we sell data instead of
              picks, and why selection and exits are your agent&apos;s job, not a
              subscription&apos;s promise.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="p-5 space-y-2">
            <Beaker className="h-5 w-5 text-primary" />
            <h2 className="font-bold font-headline">The validation cohort</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Separately, a small paper-traded cohort exercises the engine&apos;s
              selection methodology every market day under fixed mechanical rules.
              It exists to test the machinery against reality — a measurement
              instrument, not a strategy — and per our{' '}
              <Link href="/disclosures" className="text-primary hover:underline">
                disclosures
              </Link>{' '}
              we make no marketing claims from small cohorts.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12 sm:my-16" />

      <section className="text-center space-y-4">
        <div className="flex justify-center">
          <FlaskConical className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-headline">
          The research these numbers power
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This outcome record is the substrate the Lab runs experiments on — including
          the ones that killed our own ideas — and the same data your agent can query
          over MCP: per-contract excursions, cohort aggregates, and exit-rule
          simulation across the full history.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button asChild size="lg">
            <Link href="/lab">Read the Lab</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/developers">Put your agent on this data</Link>
          </Button>
        </div>
      </section>

      <p className="mt-16 text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        Paper-trading data, educational content only. Not investment advice.
        Excursion figures are realized per-contract extremes, conditional on the
        stated tracking windows — not returns achieved by any account. Past
        performance is not a guarantee of future results.
      </p>
    </section>
  );
}
