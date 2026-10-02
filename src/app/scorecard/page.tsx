import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight } from 'lucide-react';
import { getPoolOutcomes } from '@/lib/firebase-admin';
import { LifeDistribution } from '@/components/scorecard/life-distribution';
import { LiveRecord } from '@/components/scorecard/live-record';
import { PoolHitRates } from '@/components/scorecard/pool-hit-rates';
import { OG_IMAGE, TRIAL_DAYS } from '@/lib/constants';
import { LIVE_RECORD, POOL_HIT_RATES, int, pct, usd } from '@/lib/receipts';

export const revalidate = 300;

const headline = `${LIVE_RECORD.wins} of ${LIVE_RECORD.trades} real-money trades closed at a profit`;

export const metadata: Metadata = {
  title: `Track Record: ${headline}`,
  description: `${headline}, ${usd(LIVE_RECORD.netUsd)} net, ${LIVE_RECORD.windowLabel}: Claude Code trading the GammaRips pool. Every trade listed, plus pool hit rates with N. Educational only, not investment advice.`,
  alternates: { canonical: 'https://gammarips.com/scorecard' },
  openGraph: {
    images: [OG_IMAGE],
    title: `Track Record: ${headline} | GammaRips`,
    description: `Claude Code trading the GammaRips pool with real money: ${headline}, ${usd(LIVE_RECORD.netUsd)} net, ${LIVE_RECORD.windowLabel}. Every trade, wins and losses. Educational only, not investment advice.`,
    url: 'https://gammarips.com/scorecard',
  },
};

export default async function TrackRecordPage() {
  const outcomes = await getPoolOutcomes();

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'GammaRips Track Record',
    description: `The GammaRips track record. (1) The live record: every real-money trade Claude Code made from the GammaRips pool, ${LIVE_RECORD.windowLabel}, with realized broker fills: ${headline}, ${usd(LIVE_RECORD.netUsd)} net. (2) Pool hit rates: of ${int(POOL_HIT_RATES.n)} pool contracts (${POOL_HIT_RATES.windowLabel}), ${pct(POOL_HIT_RATES.hit25, 1)} hit +25%, ${pct(POOL_HIT_RATES.hit50, 1)} hit +50%, and ${pct(POOL_HIT_RATES.hit100, 1)} hit +100% within ${POOL_HIT_RATES.horizon}. A hit is a touch, not profit kept. (3) The full-life outcome distributions for every expired pool contract, from the 10:00 ET surfacing fill to expiration with no exit rule, tracked on a paper basis and published with sample sizes. Contracts surfaced before the morning of 2026-08-25 (scan dates before 2026-08-24) came from the earlier unusual-activity funnel and are not one population with the liquid-universe funnel that replaced it. Educational only. Not investment advice.`,
    url: 'https://gammarips.com/scorecard',
    creator: { '@type': 'Organization', name: 'GammaRips', url: 'https://gammarips.com' },
    license: 'https://gammarips.com/disclosures',
    isAccessibleForFree: true,
    ...(outcomes
      ? { temporalCoverage: `${outcomes.first_scan_date}/${LIVE_RECORD.asOf}` }
      : {}),
  };

  return (
    <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />

      <LiveRecord />

      <Separator className="my-12 sm:my-16" />

      <PoolHitRates />

      <Separator className="my-12 sm:my-16" />

      <LifeDistribution outcomes={outcomes} />

      <Separator className="my-12 sm:my-16" />

      <section className="text-center space-y-4">
        <h2 className="text-2xl font-bold font-headline">
          Give your AI the same pool.
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The agent behind this record reads the same nightly pool your AI gets
          over MCP, in Claude, ChatGPT, Cursor, or Codex. Add the exit lab, and
          your AI builds the trade plan with you: candidates, entry, target,
          stop, and size. You decide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button asChild size="lg">
            <Link href="/pricing">
              Start your {TRIAL_DAYS}-day free trial <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/developers">Add it to your AI</Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Or <Link href="/signals" className="text-primary hover:underline">browse the pool free</Link>,
          no account needed.
        </p>
      </section>

      <p className="mt-16 text-xs text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed">
        The live record is real-money trades in the founder&apos;s agent
        account, entered on this page by hand from realized broker fills. Pool
        figures are historical data tracked on a paper basis. Hit and excursion
        figures are per-contract touches inside the stated window, not returns
        earned by any account. Educational content only. Not investment advice.
        Past results do not promise future results.
      </p>
    </section>
  );
}
