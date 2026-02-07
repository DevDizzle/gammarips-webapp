
import type { Metadata } from 'next';
import { FileText, Mic, BarChart3, TrendingUp, Shield, CheckCircle2, ArrowRight, Target, Gem, Bot, Newspaper, Scale, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ContactForm from './contact-form';
import Faq, { faqs } from '@/components/landing/faq';

export const metadata: Metadata = {
  title: 'About Us | GammaRips',
  description: 'Learn about GammaRips\'s mission to transform complex financial data into clear, actionable insights for stock and options traders using advanced AI.',
};

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Company Filings',
    description: 'We analyze SEC 10-K and 10-Q filings. We assess financial health, long-term strategy, and the risks hidden in the fine print.',
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: 'Earnings Call Transcripts',
    description: 'We go beyond the numbers. We evaluate management tone and the conviction behind their answers to analyst questions.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Financial Statements',
    description: 'We scrutinize the balance sheet, income statement, and cash flow. We look for fundamental strength and stability.',
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Price & Technicals',
    description: 'Our models analyze price trends, volume, and momentum. We identify key levels to understand what is moving the market right now.',
  },
  {
      icon: <Scale className="h-8 w-8 text-primary" />,
      title: 'Options Chain Analysis',
      description: 'We process daily options data. We hunt for contracts with ideal liquidity and gamma profiles. We score setups for both Calls and Puts.',
  },
  {
    icon: <Newspaper className="h-8 w-8 text-primary" />,
    title: 'News & Sentiment',
    description: 'Our system tracks recent headlines. We identify catalysts that could introduce risk or ignite a move.',
  },
];

const benefits = [
    {
        icon: <Bot size={24} className="text-primary" />,
        title: "AI-Powered Outlooks",
        description: "Instead of a simple rating, you get a nuanced view for each stock. From \"Strongly Bullish\" to \"Strongly Bearish.\" We include a concise summary of the drivers behind the score."
    },
    {
        icon: <Target size={24} className="text-primary" />,
        title: "Daily Rips",
        description: "This is the core product. It is a filtered list of the highest-scoring Call and Put options based on our model. We find the setups. You run the trade."
    },
    {
        icon: <Gem size={24} className="text-primary" />,
        title: "The Confluence Dashboard",
        description: "This is a snapshot where our stock model and our options model align. We track every Rip from the moment it is published. You can see how ideas actually played out over time. This is live data, not just a backtest."
    },
]

export default function AboutPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Page Header */}
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Mission</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
            About GammaRips
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            GammaRips exists to give active options traders fewer, better ideas. We do not add to the noise. Our mission is to turn complex fundamentals, options data, and market context into a small, focused list of Rips. You get clear stats, clear risks, and ideas you can actually act on.
          </p>
          <a href="#how-it-works" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
            See how it works &darr;
          </a>
        </header>

        <Separator className="my-12 sm:my-16" />

        {/* How it Works Section */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">How GammaRips Works</h2>
            <p className="mt-3 max-w-3xl mx-auto text-muted-foreground">
              We use AI to analyze thousands of data points. We synthesize a balanced view of every asset we cover. Then our engine scores the options chain to surface a short list of potential Rips. These are contracts where stock conviction, liquidity, and risk/reward all line up.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center bg-card/50">
                <CardContent className="p-6">
                  <div className="flex justify-center items-center h-16 w-16 rounded-lg bg-primary/10 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="mt-6 text-lg font-bold font-headline">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* What You Receive Section */}
        <section>
          <Card className="border-primary/50 bg-primary/5">
             <CardHeader>
                <p className="text-sm font-semibold text-primary">The Output</p>
                <CardTitle className="font-headline text-3xl">What You Get</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {benefits.map(benefit => (
                         <div key={benefit.title} className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
                            <div>
                                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                                <p className="text-muted-foreground">{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                     <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1"><CheckCircle2 className="h-6 w-6 text-primary" /></div>
                        <div>
                            <h3 className="text-lg font-semibold">Interactive Tools</h3>
                            <p className="text-muted-foreground">Access a powerful interface to explore our data and compare stocks. Use it to support your own research process.</p>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        </section>
        
        <Separator className="my-12 sm:my-16" />

        <section>
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">No Secret Sauce. Just Logic.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
                We believe in transparency. We explain exactly how the GammaRips engine thinks. We show you the stock-first scoring, the options quality filters, and the risk flags. We define exactly what makes a Rip.
              </p>
              <Button asChild size="lg" variant="outline">
                <Link href="/options/call-setups">
                  <BookOpen className="mr-2 h-5 w-5"/>
                  Read the full Methodology Overview
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section>
             <Card className="text-center bg-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Ready to Start?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4 max-w-xl mx-auto">Go from analysis to informed decision. Instantly access today's data-driven Call and Put Rips.</p>
                    <Button asChild size="lg">
                        <Link href="/dashboard">
                            Explore the Dashboard <ArrowRight className="ml-2 h-5 w-5"/>
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* Developers Section */}
        <section>
          <Card className="text-center bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Building an Agent?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
                Our entire platform is built on the Model Context Protocol (MCP). You can connect your own AI agents to the same high-conviction signals that power our dashboard.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/developers">
                  <Bot className="mr-2 h-5 w-5"/>
                  Explore Developer API
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12 sm:my-16" />
        
        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-20">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
            </div>
            <Faq />
        </section>

        <Separator className="my-12 sm:my-16" />

        {/* Trust & Responsibility Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="prose prose-invert max-w-none">
            <h2 className="font-headline text-3xl text-foreground">Trust & Responsibility</h2>
            <p className="text-muted-foreground">
              Financial content falls under “Your Money or Your Life” (YMYL). Accuracy and reliability are paramount. GammaRips is committed to presenting well-sourced, balanced information with clear, transparent explanations.
            </p>
          </div>
          <aside className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Important Disclaimer</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              GammaRips provides educational and informational content only. It is not financial advice. All trading and investment decisions involve risk. Always conduct your own research and consider consulting a licensed financial advisor before making investment decisions.
            </p>
          </aside>
        </section>

        <Separator className="my-12 sm:my-16" />
        
        {/* Contact Section */}
        <section id="contact" className="scroll-mt-20">
            <ContactForm />
        </section>

      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema)}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "GammaRips",
          "url": "https://gammarips.com",
          "email": "admin@gammarips.com"
        })}}
      />
    </>
  );
}
