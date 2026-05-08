import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, AlertTriangle, BookOpen, Eye, Clock, UserX } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GammaRips Disclosures — What we are NOT',
  description:
    'Five explicit disclosures about what GammaRips is and is not. Paper-trading only, educational only, no track record marketing pre-30-trades, no registered investment advisor, past performance does not predict future results.',
  alternates: { canonical: 'https://gammarips.com/disclosures' },
  openGraph: {
    title: 'GammaRips Disclosures — What we are NOT',
    description:
      'Five explicit disclosures about what GammaRips is and is not.',
    url: 'https://gammarips.com/disclosures',
  },
};

const disclosures = [
  {
    icon: BookOpen,
    number: '01',
    title: 'Paper-trading only — no live execution.',
    body: [
      "Every V5.3 pick is paper-traded. There is no brokerage account behind these signals, no real capital at risk on any signal we publish, and no order ever hits a real exchange via GammaRips.",
      "The forward paper-trading ledger is a forward simulator: it ingests Polygon end-of-day options data, applies the V5.3 entry and exit rules at the same timestamps a live trader would, and records the outcome. The same data feeds the public scorecard.",
      "If you act on a signal in your own brokerage account, that is your decision, your capital, and your risk. We do not place trades, hold positions, or receive any commission tied to trades you place.",
    ],
  },
  {
    icon: AlertTriangle,
    number: '02',
    title: 'Educational only. Not investment advice.',
    body: [
      "GammaRips publishes options signals, methodology writeups, and a paper-trading ledger as educational content. Nothing on this site, in our emails, in the WhatsApp group, on @gammarips on X, or in any direct communication constitutes investment, financial, tax, accounting, or legal advice.",
      "We do not know your financial situation, risk tolerance, time horizon, or tax position. A trade that would be reasonable for one person can be ruinous for another. Consult a registered investment advisor before making any trading decision based on what you read here.",
      "Options trading involves risk and is not suitable for every investor. The seller of an uncovered short option faces theoretically unlimited loss. The buyer of an option faces total loss of premium. Read the OCC's Characteristics and Risks of Standardized Options before trading any option.",
    ],
  },
  {
    icon: Clock,
    number: '03',
    title: 'No track-record marketing pre-30-trades.',
    body: [
      "The V5.3 strategy went live on the forward paper-trader on April 17, 2026. Until the V5.3 ledger has 30 closed paper trades, GammaRips does not publish or market any aggregate performance number — no win rate, no Sharpe ratio, no expectancy claim, no \"we returned X%.\"",
      "Below 30 closed trades the sample size is too small for any statistic to be informative. We say this explicitly in every channel and we will not be talked into selectively quoting early winners.",
      "Once the 30-trade gate is reached, all aggregate performance numbers will be published with their confidence intervals, the full sample, and the methodology used to compute them. Until then: methodology only.",
    ],
  },
  {
    icon: Eye,
    number: '04',
    title: 'Past performance does not predict future results.',
    body: [
      "Even after the 30-trade gate is reached, all performance numbers will be paper-trading performance against historical or near-real-time data. Real execution introduces slippage, fills, partial fills, halt-and-pause behavior, and human latency that paper-trading does not capture.",
      "Market regimes change. A strategy that worked in one volatility environment can fail in another. The 2026-Q1/Q2 regime that V5.3 is being tested in is not necessarily the regime you will trade in if you act on these signals later.",
      "There is no claim, express or implied, that any past V5.3 paper-trade outcome is indicative of any future result, paper or live.",
    ],
  },
  {
    icon: UserX,
    number: '05',
    title: 'Founder is not a registered investment advisor.',
    body: [
      "GammaRips is built by Evan Parra. Evan is not a registered investment advisor, broker-dealer, securities lawyer, CFP, CFA, or licensed financial professional of any kind. GammaRips is not a registered investment advisory firm, broker-dealer, or money-management business.",
      "We do not solicit, manage, or accept assets under management. We sell access to a software pipeline that publishes options signals on a paper-trading basis. The $39/month subscription is a content subscription, not an advisory or management fee.",
      "If you require advice on options trading specifically tailored to your situation, the responsible path is to consult a licensed advisor in your jurisdiction. We can build the engine but we cannot give you advice — that is, by design, not what this is.",
    ],
  },
];

const disclosureSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GammaRips Disclosures — What we are NOT',
  description:
    'Five explicit disclosures about what GammaRips is and is not.',
  url: 'https://gammarips.com/disclosures',
  publisher: {
    '@type': 'Organization',
    name: 'GammaRips',
    logo: { '@type': 'ImageObject', url: 'https://gammarips.com/og-image.png?v=3' },
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
            page, read the headlines below — those are the load-bearing claims.
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
              <Link href="/methodology" className="text-primary underline underline-offset-2 hover:no-underline">
                Methodology
              </Link>{' '}
              — every threshold, every data source, every tiebreaker behind a V5.3 pick.
            </li>
            <li>
              <Link href="/about" className="text-primary underline underline-offset-2 hover:no-underline">
                About
              </Link>{' '}
              — the engine, the routine, and the person behind it.
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
            Reply to any GammaRips email — it goes straight to Evan. No autoresponder, no support
            queue.
          </p>
          <Button asChild variant="outline">
            <Link href="/about">
              Contact <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-16">
          Last reviewed: April 2026. Disclosures may be updated as the engine, regulatory posture,
          or business model changes; updates will be dated.
        </p>
      </main>
    </>
  );
}
