import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, BookOpen, Eye, Clock, UserX, Code2 } from 'lucide-react';
import {
  BUILD_STANDARD_PRICE,
  OG_IMAGE,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
} from '@/lib/constants';

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata: Metadata = {
  title: 'Disclosures: What GammaRips Is and Is Not',
  description:
    'Six plain-English disclosures: educational market data & work-for-hire software only, not investment advice, no trade execution on your behalf.',
  alternates: { canonical: 'https://gammarips.com/disclosures' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Disclosures: What GammaRips Is and Is Not | GammaRips',
    description:
      'Six explicit disclosures about what GammaRips is and is not across market data, leveraged ETFs, options, and custom agent builds.',
    url: 'https://gammarips.com/disclosures',
  },
};

const disclosures = [
  {
    icon: BookOpen,
    number: '01',
    title: 'GammaRips does not trade for you.',
    body: [
      'GammaRips is a market-data and software-engineering vendor. We never place orders for you, never hold custody of your capital, and never store your brokerage credentials on GammaRips servers.',
      'Our nightly pool, 3-day historical move tracking, walk-forward Lab audits, and the live X-Trader benchmark all run on a historical or paper-trading basis for transparency and education.',
      'Any trade you place in your own brokerage account — whether in US stocks, 2x/inverse ETFs, or options — is strictly your decision, your capital, and your risk.',
    ],
  },
  {
    icon: AlertTriangle,
    number: '02',
    title: 'Educational market data only. Not investment advice.',
    body: [
      "Nothing on gammarips.com, in our emails, over the MCP API, on @GammaRips on X, or in any custom software handoff constitutes investment, financial, tax, or legal advice. Anything your AI agent concludes from GammaRips data is your own analysis, not a GammaRips recommendation.",
      'We do not know your financial situation, risk tolerance, or goals. Consult a licensed financial advisor before making investment decisions.',
      "Options and leveraged/inverse single-stock ETFs carry substantial risk of loss. Option buyers can lose 100% of premium; 2x/inverse ETFs reset daily and experience compounding decay in choppy markets, making them unsuitable for passive buy-and-hold investing. Read the OCC's Characteristics and Risks of Standardized Options and each ETF's prospectus before trading.",
    ],
  },
  {
    icon: Code2,
    number: '03',
    title: 'Custom Agent Builds are work-for-hire software only.',
    body: [
      `When you commission a ${BUILD_STANDARD_PRICE} Custom Trading Agent Build (/build), you supply and own the written trading rules, risk limits, server environment, and brokerage API keys. GammaRips implements your rules as work-for-hire software engineering — we do not recommend strategies or promise profitability.`,
      'Every custom build ships in Paper Mode by default with limit-only order guards and fill-derived stops. Switching a bot to live brokerage funds is entirely your choice and responsibility.',
    ],
  },
  {
    icon: Clock,
    number: '04',
    title: 'Complete historical cohorts only, with sample size (N) and window.',
    body: [
      'Every research audit and X-Trader benchmark record publishes the complete cohort for its stated date window, wins and losses alike, with sample size (N) attached.',
      'We never cherry-pick subsets or show blended returns that omit losing sessions. Full details live on our Methodology and Research Lab pages.',
    ],
  },
  {
    icon: Eye,
    number: '05',
    title: 'Past performance does not predict future results.',
    body: [
      'Historical fill rates, 3-day move statistics, and paper-trading benchmarks cannot fully replicate live brokerage latency, partial fills, spreads, trading halts, or changing volatility regimes.',
      'There is no claim, express or implied, that any historical metric or paper benchmark will repeat in live trading.',
    ],
  },
  {
    icon: UserX,
    number: '06',
    title: 'Founder is not a registered investment advisor.',
    body: [
      'GammaRips is built by Evan Parra. Evan is an ML engineer and software developer — not a registered investment advisor, broker-dealer, CFP, CFA, or licensed financial professional.',
      `The ${PRICE_MONTHLY}/mo (${PRICE_ANNUAL}/yr) Pro MCP subscription pays for market data and API tools, and the ${BUILD_STANDARD_PRICE} Custom Build fee pays for software engineering. Neither is an advisory or money-management fee.`,
    ],
  },
];

const disclosureSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GammaRips Disclosures: What we are NOT',
  description:
    'Six explicit disclosures about what GammaRips is and is not.',
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
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
        <header className="mb-12">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Disclosures</p>
          <h1 className="text-3xl sm:text-5xl font-bold font-headline tracking-tight mb-4">
            What GammaRips is NOT.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Six explicit disclosures, written plainly. If you only have ninety seconds for this
            page, read the headlines below.
          </p>
        </header>

        <div className="space-y-6 mb-14">
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
                        <h2 className="text-xl font-bold font-headline">{d.title}</h2>
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

        <Separator className="my-10" />

        <section className="mb-12">
          <h2 className="text-2xl font-bold font-headline mb-4">Where to read more</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/how-it-works" className="text-primary underline underline-offset-2 hover:no-underline">
                How It Works
              </Link>{' '}
              explains our nightly pipeline, live morning liquidity checks, and walk-forward filter audits.
            </li>
            <li>
              <Link href="/methodology" className="text-primary underline underline-offset-2 hover:no-underline">
                Methodology
              </Link>{' '}
              documents every threshold, data source, ETF mapping, and 3-day move tracking rule.
            </li>
            <li>
              <Link href="/build" className="text-primary underline underline-offset-2 hover:no-underline">
                Custom Agent Build
              </Link>{' '}
              details our fixed-scope work-for-hire Python trading bot engineering and safety guardrails.
            </li>
            <li>
              <Link href="/terms" className="text-primary underline underline-offset-2 hover:no-underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
                Privacy Policy
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

        <Separator className="my-10" />

        <section className="text-center">
          <h2 className="text-2xl font-bold font-headline mb-3">Questions about a specific disclosure?</h2>
          <p className="text-muted-foreground mb-6">
            Reply to any GammaRips email or send a note directly to Evan.
          </p>
          <Button asChild variant="outline">
            <Link href="/about#contact">
              Contact <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-14">
          Last reviewed: November 25, 2026. Disclosures are updated whenever our data pipeline,
          offerings, or policies change.
        </p>
      </main>
    </>
  );
}
