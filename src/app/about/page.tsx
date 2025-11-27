
import type { Metadata } from 'next';
import { FileText, Mic, BarChart3, TrendingUp, Shield, CheckCircle2, ArrowRight, Target, Gem, Bot, Newspaper, Scale, Github, BookOpen } from 'lucide-react';
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
    description: 'We analyze SEC 10-K and 10-Q filings to assess financial health, long-term strategy, and potential risks identified by management.',
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: 'Earnings Call Transcripts',
    description: 'We go beyond the numbers to evaluate management tone, forward-looking guidance, and the conviction behind their answers to analyst questions.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Financial Statements',
    description: 'We scrutinize the balance sheet, income statement, and cash flow trends to understand a company\'s performance, stability, and fundamental strength.',
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Price & Technicals',
    description: 'Our models analyze price trends, volume, momentum, and key support/resistance levels to understand what\'s moving the market right now.',
  },
  {
      icon: <Scale className="h-8 w-8 text-primary" />,
      title: 'Options Chain Analysis',
      description: 'We process daily options chain data to identify contracts with ideal liquidity, volatility, and risk/reward profiles, scoring setups based on these criteria for both Calls and Puts.'
  },
  {
    icon: <Newspaper className="h-8 w-8 text-primary" />,
    title: 'News & Sentiment',
    description: 'Our system tracks recent news and market sentiment to identify catalysts that could introduce risks or create new opportunities.',
  },
];

const benefits = [
    {
        icon: <Bot size={24} className="text-primary" />,
        title: "AI-Powered Market Analysis",
        description: "Instead of a simple rating, you get a nuanced, five-tier analytical view for each stock (from \"Strongly Bullish\" to \"Strongly Bearish\"), complete with a concise summary of the key drivers behind the analysis."
    },
    {
        icon: <Target size={24} className="text-primary" />,
        title: "Daily Rippers (Highest-Scoring Options Ideas)",
        description: "A filtered list of the highest-scoring Call and Put options based on our data model, allowing you to identify potential Rippers that align with your market view."
    },
    {
        icon: <Gem size={24} className="text-primary" />,
        title: "The Confluence Dashboard",
        description: "A daily snapshot of stocks that have a strong bullish or bearish analysis and also feature a high-scoring Ripper on our options scanner, highlighting where our stock and options data models align. Every Ripper is tracked from the moment it’s published, so you can see how ideas actually played out over time-not just in backtests."
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
            GammaRips exists to give active options traders fewer, better ideas-not more noise. Our mission is to turn complex fundamentals, options data, and market context into a small, focused list of “Rippers” you can actually act on, with clear stats and clear risks.
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
              We use state-of-the-art AI to analyze thousands of data points and synthesize a balanced, forward-looking view of every asset we cover. Then our engine scores the options chain to surface a short list of potential Rippers-call and put contracts where stock conviction, liquidity, and risk/reward line up.
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
                <p className="text-sm font-semibold text-primary">Result</p>
                <CardTitle className="font-headline text-3xl">What You Receive</CardTitle>
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
                            <h3 className="text-lg font-semibold">An Interactive Dashboard</h3>
                            <p className="text-muted-foreground">A powerful, user-friendly interface to explore all our data, compare stocks, and support your personal research process.</p>
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
              <CardTitle className="font-headline text-2xl">Our Methodology, In Plain English</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
                We believe in transparency. Instead of hiding behind “secret sauce,” we explain how the GammaRips engine thinks-stock-first scoring, options quality filters, risk flags, and how we define a “Ripper.”
              </p>
              <Button asChild size="lg" variant="outline">
                <a href="#">
                  <BookOpen className="mr-2 h-5 w-5"/>
                  Methodology Overview
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12 sm:my-16" />

        <section>
             <Card className="text-center bg-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Ready to Get Started?</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4 max-w-xl mx-auto">Go from analysis to informed decision. Instantly access today's data-driven Call and Put Rippers, backed by AI scores and daily market data.</p>
                    <Button asChild size="lg">
                        <Link href="/">
                            Start Your Research <ArrowRight className="ml-2 h-5 w-5"/>
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
              GammaRips provides educational and informational content only-it is not financial advice. All trading and investment decisions involve risk. Always conduct your own research and consider consulting a licensed financial advisor before making investment decisions.
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
