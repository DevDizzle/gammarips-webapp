
import type { Metadata } from 'next';
import { FileText, Mic, BarChart3, Calculator, Newspaper, Shield, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | ProfitScout',
  description: 'Learn about the methodology and mission of ProfitScout, an AI-powered tool providing clear, data-driven investment insights.',
};

const features = [
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Company Filings',
    description: 'SEC 10-K and 10-Q to assess financial health, risks, and management’s discussion.',
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: 'Earnings Call Transcripts',
    description: 'Management tone, forward-looking statements, and responses to analyst questions.',
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    title: 'Financial Statements',
    description: 'Balance sheet, income statement, and cash flow trends for performance and stability.',
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary" />,
    title: 'Key Ratios & Metrics',
    description: 'Valuation and profitability trends for a grounded perspective.',
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Price & Technicals',
    description: 'Trend, support/resistance, and momentum context to understand what’s moving now.',
  },
  {
    icon: <Newspaper className="h-8 w-8 text-primary" />,
    title: 'News & Sentiment',
    description: 'Recent developments that may act as catalysts or introduce risks.',
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Page Header */}
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Mission</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
            About ProfitScout
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            ProfitScout simplifies investment research with clear, data-driven insights powered by AI. Our mission is to help investors of all levels navigate the market with confidence.
          </p>
           <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Our ratings blend price action, news flow, earnings, and fundamentals—designed to highlight near-term potential without losing long-term context.
          </p>
          <a href="#how-it-works" className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">
            See how it works &darr;
          </a>
        </header>

        <Separator className="my-12 sm:my-16" />

        {/* How it Works Section */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-headline">How ProfitScout Works</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              We use state-of-the-art AI and large language models to analyze high-volume financial information and synthesize a balanced view guided by E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
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
                <p className="text-lg font-semibold">A clear Buy / Hold / Sell rating for each stock we cover in the Russell 1000, refreshed daily.</p>
                <p className="mt-2 text-muted-foreground">
                    Every rating includes a concise summary of the key factors behind the decision—so you see the why without the jargon.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Fundamental analysis (revenue, earnings)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Valuation and key metric trends</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Price and technical context</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Identified risks and opportunities</li>
                </ul>
            </CardContent>
          </Card>
        </section>
        
        <Separator className="my-12 sm:my-16" />

        {/* Trust & Responsibility Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="prose prose-invert max-w-none">
            <h2 className="font-headline text-3xl text-foreground">Trust & Responsibility</h2>
            <p className="text-muted-foreground">
              Financial content falls under “Your Money or Your Life” (YMYL). Accuracy and reliability matter. ProfitScout aims to present well-sourced, balanced information with clear explanations.
            </p>
          </div>
          <aside className="bg-muted/50 p-6 rounded-lg">
            <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Important Disclaimer</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              ProfitScout provides educational information—not financial advice. Always do your own research and consider consulting a licensed financial advisor before making investment decisions.
            </p>
          </aside>
        </section>

        <Separator className="my-12 sm:my-16" />
        
        {/* Contact Section */}
        <section className="text-center">
             <h2 className="text-3xl font-bold font-headline">Contact</h2>
             <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
                Have questions or ideas to improve ProfitScout? We’d love to hear from you.
             </p>
             <div className="mt-6">
                <a href="mailto:admin@profitscout.app" className="font-semibold text-primary hover:underline">
                    admin@profitscout.app
                </a>
             </div>
        </section>

      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ProfitScout",
          "url": "https://profitscout.app",
          "email": "admin@profitscout.app"
        })}}
      />
    </>
  );
}
