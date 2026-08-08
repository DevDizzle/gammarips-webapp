import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FlaskConical } from 'lucide-react';
import { getPoolOutcomes } from '@/lib/firebase-admin';
import { LifeDistribution } from '@/components/scorecard/life-distribution';
import { OG_IMAGE } from '@/lib/constants';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Track Record — Surfaced to Expiration, Every Contract',
  description:
    "What every surfaced contract did from morning to expiration, as distributions with sample sizes. No win rate, no average ROI. Paper-trading only.",
  alternates: { canonical: 'https://gammarips.com/scorecard' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Track Record — Surfaced to Expiration | GammaRips',
    description:
      'Every surfaced contract, tracked from that morning to expiration: the ceiling and the floor, as distributions. No highlight reel.',
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
      'Realized outcomes for every candidate in the GammaRips curated options-flow pool: the full-life surface from surfacing to expiration — peak/trough excursion distributions (the ceiling) and hold-to-settlement distributions (the floor) — tracked daily on a paper-trading basis. Published as distributions with sample sizes; the blind-buy composite baseline is negative and stated as such. Not investment advice.',
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
          We track every contract to the end.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Every morning we surface about 50 contracts. We follow every one from
          that morning until it expires — nothing gets edited out. Here is what
          actually happens to them.
        </p>
      </header>

      <Separator className="my-12 sm:my-16" />

      <LifeDistribution outcomes={outcomes} />

      <Separator className="my-12 sm:my-16" />

      <section className="text-center space-y-4">
        <div className="flex justify-center">
          <FlaskConical className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-headline">
          Want to work this data?
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Everything on this page — and the contract-by-contract detail behind
          it — is what your AI agent gets over MCP. Our Lab publishes the
          experiments we run on it, including the ideas that failed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button asChild size="lg">
            <Link href="/developers">Put your agent on this data</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/lab">Read the Lab</Link>
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
