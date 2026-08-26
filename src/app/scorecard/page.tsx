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
  title: 'Track Record: Every Contract, Surfaced to Expiration',
  description:
    'What every surfaced contract did from the 10:00 ET fill to expiration, as distributions with sample sizes. Paper trading, educational only, not investment advice.',
  alternates: { canonical: 'https://gammarips.com/scorecard' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Track Record: Every Contract, Surfaced to Expiration | GammaRips',
    description:
      'Every surfaced contract, tracked from the 10:00 ET fill to expiration: the ceiling and the floor, as distributions. No highlight reel. Paper trading, educational only.',
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
      'Realized outcomes for every candidate in the GammaRips curated options-flow pool. The full-life window runs from the 10:00 ET surfacing fill to expiration with no exit rule: peak and trough excursion distributions (the ceiling) and hold-to-settlement distributions (the floor), tracked daily on a paper-trading basis. A separate baseline applies one fixed same-day bracket to every contract (10:00 ET entry, +40% target, -30% stop, flat 15:45 ET). That composite is negative and stated as such. Published as distributions with sample sizes. Contracts surfaced before the morning of 2026-08-25 (scan dates before 2026-08-24) came from the earlier unusual-activity funnel and are not one population with the liquid-universe funnel that replaced it. Not investment advice.',
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
          Every morning we surface roughly 40 to 50 contracts. We follow every
          one from the 10:00 ET fill until it expires. Nothing gets edited out.
          Here is what happened to them.
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
          Everything on this page, plus the contract-by-contract detail behind
          it, is what your AI agent gets over MCP. Our Lab publishes the
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
        stated tracking window. They are not returns achieved by any account.
        Past performance is not a guarantee of future results.
      </p>
    </section>
  );
}
