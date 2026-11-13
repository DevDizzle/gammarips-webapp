import type { Metadata } from 'next';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Bot, User, CheckCircle2 } from 'lucide-react';
import ContactForm from './contact-form';
import { TOOL_COUNT, TRIAL_DAYS, OG_IMAGE, MCP_PRO_ENDPOINT, HARNESS_REPO } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About GammaRips: The Options Dataset & Catalyst Lab Engine',
  description:
    'Who builds GammaRips and why: a nightly liquidity and volatility pipeline scanning ~3,500 optionable US stocks, filtering to the Combo A options dataset, and serving AI agents over MCP. Educational only. Not investment advice.',
  alternates: { canonical: 'https://gammarips.com/about' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'About GammaRips: The Options Dataset & Catalyst Lab Engine',
    description:
      'The options-flow data layer and Catalyst Lab microstructure research behind GammaRips. Educational only. Not investment advice.',
    url: 'https://gammarips.com/about',
  },
};

const catalystStats = [
  { value: '50.1%', label: '5-min fast fill rate at OI >= 500 (vs 30.3% baseline)' },
  { value: '35.4%', label: '3-day MFE >= +40% in Delta 0.22–0.48, DTE 10–45 (vs 27.6%)' },
  { value: '>= 0.85', label: 'RV/IV ratio gate (#1 excursion predictor across N = 5,575)' },
  { value: '$1.00+', label: 'Mid price floor to escape $0.05 sub-dollar tick friction' },
];

const engineSteps = [
  'At 23:00 ET, the scanner walks ~3,500 optionable US stocks, keeps the top 100 liquid universe (3M+ shares, 25+ listed strikes), and selects one bullish call per name passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45.',
  'At 05:30 ET, the enrichment pipeline computes point-in-time Realized-vs-Implied Volatility (rv_iv_ratio), technical indicators, flow context, and Gemini grounded news catalysts.',
  'By 06:30–07:00 ET, the leakage-checked dbt feature view (enriched_features_v1) and daily intelligence report publish.',
  'From 09:02 to 16:52 ET, 10-minute intraday liquidity snapshots capture resting open interest and active session volume across the pool.',
];

const whyList = [
  'Microstructure first. Combo A contract floors (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45) ensure your AI starts from liquid, responsive option contracts.',
  'Primitives over black-box picks. Walk-forward Catalyst Lab audits showed black-box composite scores fail out-of-sample, whereas transparent microstructure and volatility primitives (rv_iv_ratio) hold up.',
  'Your AI builds the plan. GammaRips serves the dataset and 3-day MFE/MAE outcome surfaces over MCP so your AI builds a plan tailored to your risk budget.',
  'Point-in-time leakage wall. Every column carries its as-of timestamp boundary, documented in get_playbook(name="schema").',
];

interface AboutPageProps {
  searchParams: Promise<{ welcome?: string; session_id?: string }>;
}

export default async function AboutPage({ searchParams }: AboutPageProps) {
  const { welcome, session_id } = await searchParams;
  const isWelcome = welcome === '1';

  // Provision entitlement synchronously from the checkout session, redundant
  // with the Stripe webhook on purpose: the paying user's first landing must
  // not depend on webhook registration or delivery. Idempotent; never throws.
  if (isWelcome && session_id) {
    const { provisionFromCheckoutSession } = await import('@/lib/stripe-sync');
    await provisionFromCheckoutSession(session_id);
  }

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About GammaRips',
    description:
      'The options-flow data layer for AI agents: a nightly liquidity and volatility pipeline scanning ~3,500 optionable US stocks, filtered under Combo A gates and served over MCP. Educational only. Not investment advice.',
    url: 'https://gammarips.com/about',
    publisher: {
      '@type': 'Organization',
      name: 'GammaRips',
      logo: { '@type': 'ImageObject', url: 'https://gammarips.com/og-image.png?v=3' },
    },
  };

  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {isWelcome && (
          <Card className="bg-primary/5 border-primary/40 mb-12">
            <CardHeader>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Welcome to Agent Access
              </p>
              <CardTitle className="font-headline text-2xl sm:text-3xl">
                You&apos;re in. Let&apos;s get your AI connected.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3 text-sm text-foreground/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 1: Add GammaRips to your AI.</strong> In Claude, ChatGPT, Cursor, or Codex, add{' '}
                    <code className="text-primary break-all">{MCP_PRO_ENDPOINT}</code> and sign in with this account. Or create an API key on your{' '}
                    <Link href="/account?welcome=1" className="text-primary hover:underline">
                      account page
                    </Link>{' '}
                    (it is shown once, so copy it right then). Exact steps per client are on the{' '}
                    <Link href="/developers#connect" className="text-primary hover:underline">
                      developer page
                    </Link>
                    . Any trouble, email{' '}
                    <a href="mailto:evan@gammarips.com" className="text-primary hover:underline">
                      evan@gammarips.com
                    </a>{' '}
                    and we&apos;ll sort it immediately.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 2: Query the dataset and build a plan.</strong> Ask your AI to pull tonight&apos;s pool (<code className="text-primary">get_pool(view=&quot;enriched&quot;)</code>), check 10-minute morning liquidity and earnings, and evaluate targets and stops from the 3-day excursion history (<code className="text-primary">query_outcomes</code>).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Step 3: You decide.</strong> The plan is your AI&apos;s analysis with you. You choose what to trade, in your own account.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>
                    Your trial is active for {TRIAL_DAYS} days. Cancel anytime from your account page. No charge if you cancel before day {TRIAL_DAYS}.
                  </span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild variant="outline">
                  <Link href="/developers#connect">Connect steps per client</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/account">Manage subscription</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
                Educational only. Not investment advice. What your AI concludes is its analysis with you, and you trade your own account.
              </p>
            </CardContent>
          </Card>
        )}

        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">About</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
            Built by an ML engineer.
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Grounded in Catalyst Lab microstructure research.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            GammaRips filters the US options market every trading night through deterministic liquidity, spread, convexity, and volatility gates (Combo A) and serves the curated dataset, 10-minute intraday liquidity snapshots, and 3-day excursion history to your AI over {TOOL_COUNT} MCP tools.
          </p>
        </header>

        <Separator className="my-12 sm:my-16" />

        <section id="research" className="scroll-mt-24">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">
              Catalyst Lab Microstructure &amp; Volatility Research
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Every Combo A gate in the pipeline was validated on walk-forward historical cohorts (N = 5,575 enriched option contracts across 66 scan dates) joined to BigQuery <code className="text-xs text-foreground">enriched_option_outcomes</code>.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {catalystStats.map((s) => (
              <Card key={s.label} className="bg-card/50">
                <CardContent className="p-5 text-center space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">{s.value}</div>
                  <p className="text-xs text-muted-foreground leading-snug">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/how-it-works">Read the research &amp; pipeline &rarr;</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={HARNESS_REPO} target="_blank" rel="noopener noreferrer">
                Explore gammarips-harness on GitHub
              </a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Historical walk-forward research on paper-tracked option cohorts. Educational only, not investment advice.
          </p>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section id="team" className="scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Who builds it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline">Evan Parra</h3>
                    <p className="text-sm text-muted-foreground">Founder &amp; data architect</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  ML engineer and AI architect who builds production data pipelines on Google Cloud. He built GammaRips end to end: the nightly scan, the Combo A microstructure and volatility filter, the BigQuery feature and outcome warehouse, and the MCP server your AI connects to.
                </p>
                <p className="text-sm text-muted-foreground">
                  Also runs{' '}
                  <Link href="https://evanparra.ai" target="_blank" className="underline hover:text-primary">
                    evanparra.ai
                  </Link>{' '}
                  for AI strategy and data integration consulting.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center h-14 w-14 rounded-lg bg-primary/10">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-headline">Open-Source Agent Harness</h3>
                    <p className="text-sm text-muted-foreground">gammarips-harness</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alongside direct MCP support in Claude, ChatGPT, Cursor, and Codex, we maintain the open-source{' '}
                  <a href={HARNESS_REPO} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    gammarips-harness
                  </a>{' '}
                  for traders who want a structured agent workflow over the {TOOL_COUNT} MCP tools: Stage 1 dataset ingestion, live X/web catalyst verification, and 3-day excursion analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">How the engine works</h2>
          </div>
          <ol className="space-y-3 max-w-2xl mx-auto">
            {engineSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-primary/10 text-xs font-bold text-primary flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-muted-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed">
            Read the full technical specification on the{' '}
            <Link href="/methodology" className="text-primary hover:underline">
              methodology page
            </Link>
            .
          </p>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-headline">Why it&apos;s built this way</h2>
          </div>
          <ul className="space-y-3 max-w-2xl mx-auto">
            {whyList.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-primary mt-1 shrink-0">✓</span>
                <span className="text-muted-foreground leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/pricing">Start your {TRIAL_DAYS}-day free trial &rarr;</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signals">View 3-contract preview</Link>
            </Button>
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-headline text-3xl text-foreground">Trust &amp; responsibility</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              GammaRips is a data vendor. It publishes curated options market data, historical excursion outcomes, and methodology research for educational and analytical use. Your AI builds the plan with you, and you decide and trade your own account. GammaRips never places trades for you and never manages your money.
            </p>
          </div>
          <aside className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Disclaimer</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Educational market data and historical research only. Not investment advice. You trade your own account. GammaRips does not manage your money. Past performance is not a guarantee of future results.
            </p>
          </aside>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section id="contact" className="scroll-mt-20">
          <ContactForm />
        </section>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
    </>
  );
}
