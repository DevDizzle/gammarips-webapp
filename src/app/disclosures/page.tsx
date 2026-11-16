import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, BookOpen, Eye, Clock, UserX } from 'lucide-react';
import { PRICE_MONTHLY, OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'GammaRips Disclosures: What we are NOT',
  description:
    'What GammaRips is and is not: educational market data only, not investment advice, point-in-time historical outcome cohorts, no trading for you, and no registered investment advisor.',
  alternates: { canonical: 'https://gammarips.com/disclosures' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'GammaRips Disclosures: What we are NOT',
    description:
      'Five explicit disclosures about what GammaRips is and is not.',
    url: 'https://gammarips.com/disclosures',
  },
};

const disclosures = [
  {
    icon: BookOpen,
    number: '01',
    title: 'GammaRips does not trade for you.',
    body: [
      'GammaRips is a financial data vendor. GammaRips never places an order for you or for any subscriber, and no subscriber order reaches an exchange through GammaRips. The nightly Combo A options pool, the 3-day excursion outcome surfaces, and the Catalyst Lab research cohorts are tracked on a historical and paper-trading basis.',
      'The outcome pipeline ingests Polygon options data, applies deterministic tracking rules from the 10:00 ET morning reference window across the subsequent 3 trading days, and records Maximum Favorable Excursion (MFE) and Maximum Adverse Excursion (MAE) in BigQuery (enriched_option_outcomes).',
      'If you act on anything you read here or over the MCP API in your own brokerage account, that is your decision, your capital, and your risk. We do not place trades for you, hold positions for you, or receive any commission tied to trades you place.',
    ],
  },
  {
    icon: AlertTriangle,
    number: '02',
    title: 'Educational market data only. Not investment advice.',
    body: [
      "GammaRips publishes curated options market data, point-in-time feature vectors, methodology writeups, and Catalyst Lab research findings as educational and analytical content. Nothing on this site, in our emails, over the MCP API, on @GammaRips on X, or in any direct communication constitutes investment, financial, tax, accounting, or legal advice, and anything an AI agent concludes from our data is the user's own analysis, not a GammaRips recommendation.",
      'We do not know your financial situation, risk tolerance, time horizon, or tax position. A trade that would be reasonable for one person can be ruinous for another. Consult a registered investment advisor before making any trading decision.',
      "Options trading involves substantial risk and is not suitable for every investor. The seller of an uncovered short option faces theoretically unlimited loss. The buyer of an option faces total loss of premium. Read the OCC's Characteristics and Risks of Standardized Options before trading any option.",
    ],
  },
  {
    icon: Clock,
    number: '03',
    title: 'Complete cohorts only, with sample size (N) and window.',
    body: [
      'We publish complete research cohorts only. Every Catalyst Lab study and excursion metric covers every qualifying contract in its stated date window, with sample size (N) attached.',
      'We never publish cherry-picked subsets or selected-positive blended returns. Every contract surfaced in the pool is logged to the outcome warehouse (enriched_option_outcomes) under the same deterministic rules. Full methodology details live on the Methodology and Learn pages.',
      'Past historical outcomes do not promise future results. We never promise a return, win rate, or guaranteed edge for your own trades.',
    ],
  },
  {
    icon: Eye,
    number: '04',
    title: 'Past performance does not predict future results.',
    body: [
      'Historical excursion and fill figures are measured against historical and intraday option tape data. Live brokerage execution introduces slippage, partial fills, queue priority, halt-and-pause behavior, and latency that historical tracking cannot fully replicate.',
      'Market regimes change. A microstructure or volatility filter that performed well in one volatility environment can degrade in another.',
      'There is no claim, express or implied, that any historical excursion or research finding is indicative of any future result.',
    ],
  },
  {
    icon: UserX,
    number: '05',
    title: 'Founder is not a registered investment advisor.',
    body: [
      'GammaRips is built by Evan Parra. Evan is not a registered investment advisor, broker-dealer, securities lawyer, CFP, CFA, or licensed financial professional of any kind. GammaRips is not a registered investment advisory firm, broker-dealer, or money-management business.',
      `We do not solicit, manage, or accept assets under management. We sell access to data and software tools: a pipeline that publishes curated options market data and historical excursion outcomes over MCP for subscribers' own AI agents. The ${PRICE_MONTHLY}/month Agent Access subscription is a data-and-tools subscription, not an advisory or management fee, and the service provides no personalized recommendation of any kind.`,
      'If you require advice on options trading tailored to your situation, consult a licensed advisor in your jurisdiction.',
    ],
  },
];

const disclosureSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GammaRips Disclosures: What we are NOT',
  description:
    'Five explicit disclosures about what GammaRips is and is not.',
  url: 'https://gammarips.com/disclosures',
  publisher: {
    '@type': 'Organization',
    name: 'GammaRips',
    logo: { '@type': 'ImageObject', url: 'https://gammarips.com/og-image.png?v=4' },
  },
};

export default function DisclosuresPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(disclosureSchema) }}
      />
      <main className="container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Disclosures</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            What GammaRips is NOT.
          </h1>
          <p className="text-lg text-muted-foreground">
            Five explicit disclosures, written plainly. If you only have ninety seconds for this
            page, read the headlines below.
          </p>
        </header>

        <div className="space-y-6 mb-16">
          {disclosures.map((d) => {
            const Icon = d.icon;
            return (
              <Card key={d.number}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <span className="text-3xl font-bold text-muted-foreground/40 font-mono">
                        {d.number}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">{d.title}</h2>
                      </div>
                      {d.body.map((para, i) => (
                        <p key={i} className="text-sm text-muted-foreground mb-3 last:mb-0 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-12" />

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Where to read more</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/how-it-works" className="text-primary underline underline-offset-2 hover:no-underline">
                Learn (How It Works)
              </Link>{' '}
              covers the overnight pipeline, 10-minute intraday liquidity checks, and the Catalyst Lab walk-forward research behind Combo A.
            </li>
            <li>
              <Link href="/methodology" className="text-primary underline underline-offset-2 hover:no-underline">
                Methodology
              </Link>{' '}
              covers every threshold, data source, point-in-time leakage wall, and 3-day excursion outcome labeling.
            </li>
            <li>
              <Link href="/about" className="text-primary underline underline-offset-2 hover:no-underline">
                About
              </Link>{' '}
              covers the engine, the data architecture, and the builder behind it.
            </li>
            <li>
              <Link href="/terms" className="text-primary underline underline-offset-2 hover:no-underline">
                Terms of service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
                Privacy policy
              </Link>
              .
            </li>
            <li>
              <a
                href="https://www.theocc.com/Company-Information/Documents-and-Archives/Options-Disclosure-Document"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:no-underline"
              >
                OCC Characteristics and Risks of Standardized Options
              </a>{' '}
              (mandatory pre-trade reading per FINRA).
            </li>
          </ul>
        </section>

        <Separator className="my-12" />

        <section className="text-center">
          <h2 className="text-2xl font-bold mb-3">Questions about a specific disclosure?</h2>
          <p className="text-muted-foreground mb-6">
            Reply to any GammaRips email. It goes straight to Evan.
          </p>
          <Button asChild variant="outline">
            <Link href="/about#contact">
              Contact <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-16">
          Last reviewed: November 2026. Disclosures may be updated as the engine, regulatory posture,
          or business model changes; updates will be dated.
        </p>
      </main>
    </>
  );
}
