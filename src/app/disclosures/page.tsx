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
    "What GammaRips is and is not: educational only, not investment advice, complete track records only, no trading for you, and no registered investment advisor.",
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
      "GammaRips never places an order for you or for any subscriber, and no subscriber order reaches an exchange through GammaRips. The pool data, the opportunity surfaces, and the research cohorts are tracked on a paper-trading basis: no capital is at risk on them.",
      "The live record on the Track Record page is the one real-money record we publish. It is the founder's own Claude Code agent trading contracts from the GammaRips pool in the founder's own brokerage account, shown as realized broker fills, every trade, wins and losses. That account may hold positions in contracts that also appear in the pool. GammaRips manages no account for anyone else.",
      "The pool outcome record is a forward simulator: it ingests Polygon options data, applies fixed tracking rules at the same timestamps a live trader would face, and records the result. The same data feeds the public Track Record page.",
      "If you act on anything you read here in your own brokerage account, that is your decision, your capital, and your risk. We do not place trades for you, hold positions for you, or receive any commission tied to trades you place.",
    ],
  },
  {
    icon: AlertTriangle,
    number: '02',
    title: 'Educational only. Not investment advice.',
    body: [
      "GammaRips publishes options-flow data, methodology writeups, research findings, a paper-trading research ledger, and a real-money agent record as educational content. Nothing on this site, in our emails, over the MCP API, on @gammarips on X, or in any direct communication constitutes investment, financial, tax, accounting, or legal advice, and anything an AI agent concludes from our data is the user's own analysis, not a GammaRips recommendation.",
      "We do not know your financial situation, risk tolerance, time horizon, or tax position. A trade that would be reasonable for one person can be ruinous for another. Consult a registered investment advisor before making any trading decision based on what you read here.",
      "Options trading involves risk and is not suitable for every investor. The seller of an uncovered short option faces theoretically unlimited loss. The buyer of an option faces total loss of premium. Read the OCC's Characteristics and Risks of Standardized Options before trading any option.",
    ],
  },
  {
    icon: Clock,
    number: '03',
    title: 'Every trade, from trade 1, with its N and window.',
    body: [
      "The live record on the Track Record page shows every trade from the first one: wins and losses, each with its entry, exit, and realized result, and the record as a whole with its trade count (N) and its date window. Nothing is edited after the fact, and the page states the date it was last updated.",
      "We publish complete cohorts only. Every number we show covers every trade or every contract in its stated window. We never show a cherry-picked subset, a run of early winners, or a blended return built from selected results. Every candidate the engine surfaces is tracked to its realized outcome in the public pool record, winners and losers counted the same way, with sample sizes attached. The research baselines, including whole-pool results under fixed exit rules, are on the Methodology page.",
      "Past results do not promise future results. A record of this size can change quickly as trades are added. We never promise a return or a win rate for your own trades.",
    ],
  },
  {
    icon: Eye,
    number: '04',
    title: 'Past performance does not predict future results.',
    body: [
      "Pool figures are paper-tracked against historical or near-real-time data. Real execution introduces slippage, fills, partial fills, halt-and-pause behavior, and human latency that paper tracking does not capture. The live record uses real fills, and your fills, timing, and sizing will differ from it.",
      "Market regimes change. A strategy that worked in one volatility environment can fail in another. The 2026 regime behind these results is not necessarily the regime you will trade in if you act on this data later.",
      "There is no claim, express or implied, that any past outcome, paper or live, is indicative of any future result.",
    ],
  },
  {
    icon: UserX,
    number: '05',
    title: 'Founder is not a registered investment advisor.',
    body: [
      "GammaRips is built by Evan Parra. Evan is not a registered investment advisor, broker-dealer, securities lawyer, CFP, CFA, or licensed financial professional of any kind. GammaRips is not a registered investment advisory firm, broker-dealer, or money-management business.",
      `We do not solicit, manage, or accept assets under management. We sell access to data and software tools: a pipeline that publishes options-flow data on a paper-trading basis, plus programmatic (MCP) access for subscribers' own AI agents. The ${PRICE_MONTHLY}/month Agent Access subscription is a data-and-tools subscription, not an advisory or management fee, and the service deliberately provides no personalized recommendation of any kind.`,
      "If you require advice on options trading specifically tailored to your situation, the responsible path is to consult a licensed advisor in your jurisdiction. We can build the engine but we cannot give you advice; that is, by design, not what this is.",
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
            page, read the headlines below. Those are the load-bearing claims.
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
              covers every threshold, every data source, and the research record behind the pool.
            </li>
            <li>
              <Link href="/scorecard" className="text-primary underline underline-offset-2 hover:no-underline">
                Track Record
              </Link>{' '}
              shows every real-money trade of the live agent record and the pool hit rates, each with its N and window.
            </li>
            <li>
              <Link href="/about" className="text-primary underline underline-offset-2 hover:no-underline">
                About
              </Link>{' '}
              covers the engine, the data, and the person behind it.
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
            Reply to any GammaRips email. It goes straight to Evan. No autoresponder, no support
            queue.
          </p>
          <Button asChild variant="outline">
            <Link href="/about">
              Contact <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>

        <p className="text-xs text-muted-foreground text-center mt-16">
          Last reviewed: October 2026. Disclosures may be updated as the engine, regulatory posture,
          or business model changes; updates will be dated.
        </p>
      </main>
    </>
  );
}
