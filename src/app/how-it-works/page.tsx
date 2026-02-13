import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicHeader } from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "How The Overnight Edge Works | Institutional Options Flow Analysis",
  description: "Learn how our scanner analyzes overnight institutional options flow across 5,230+ tickers. Understand our scoring system, enrichment process, and what makes a high-conviction signal.",
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6">
              How It Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We track the smart money while you sleep. Here is how we turn millions of data points into actionable morning signals.
            </p>
          </header>

          <div className="space-y-20">
            {/* Section 1: UOA */}
            <section className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-primary font-bold mb-2 uppercase tracking-wide text-sm">Step 1</div>
                <h2 className="text-3xl font-bold font-headline mb-4">What is Unusual Options Activity?</h2>
                <div className="prose dark:prose-invert text-muted-foreground">
                  <p className="mb-4">
                    Institutions often position themselves before major moves using the options market. 
                    They leave footprints: massive volume relative to open interest, sweep orders, and aggressive premiums.
                  </p>
                  <p>
                    Our scanner monitors <strong>5,230+ tickers</strong> overnight. We look for:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-foreground">
                    <li><strong>High Vol/OI Ratios:</strong> When today's volume exceeds the total existing contracts.</li>
                    <li><strong>Net Dollar Flow:</strong> Aggressive buying of calls vs. puts.</li>
                    <li><strong>Strike Concentration:</strong> Big money targeting specific price levels.</li>
                  </ul>
                </div>
              </div>
              <div className="bg-muted p-8 rounded-xl border">
                 {/* Visual placeholder */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-mono">TICKER</span>
                        <span className="font-mono">VOL/OI</span>
                        <span className="font-mono">FLOW</span>
                    </div>
                    <div className="flex justify-between items-center text-green-500 font-bold">
                        <span>XYZ</span>
                        <span>4.2x</span>
                        <span>+$12.4M</span>
                    </div>
                    <div className="flex justify-between items-center text-red-500 font-bold opacity-50">
                        <span>ABC</span>
                        <span>0.8x</span>
                        <span>-$1.2M</span>
                    </div>
                 </div>
              </div>
            </section>

            {/* Section 2: Scoring */}
            <section className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
              <div className="md:order-2">
                 <div className="text-primary font-bold mb-2 uppercase tracking-wide text-sm">Step 2</div>
                <h2 className="text-3xl font-bold font-headline mb-4">Our Scoring System</h2>
                <div className="prose dark:prose-invert text-muted-foreground">
                  <p className="mb-4">
                    Not all flow is equal. A hedge looks different from a speculative bet. 
                    We score every signal from <strong>1 to 10</strong>.
                  </p>
                  <ul className="space-y-4 mt-4">
                    <li className="flex gap-3">
                        <span className="bg-primary/10 text-primary font-bold rounded px-2 py-1 h-fit">Score 1-4</span>
                        <span>Low conviction or mixed signals. Often hedging or noise.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-primary/20 text-primary font-bold rounded px-2 py-1 h-fit">Score 5-7</span>
                        <span>Moderate conviction. Worth watching. Good flow but maybe lacking technical confirmation.</span>
                    </li>
                    <li className="flex gap-3">
                        <span className="bg-primary text-primary-foreground font-bold rounded px-2 py-1 h-fit">Score 8-10</span>
                        <span><strong>High Conviction.</strong> The "Overnight Edge" signals. Massive alignment of flow, technicals, and positioning.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:order-1 bg-muted p-8 rounded-xl border flex items-center justify-center">
                 <div className="text-center">
                    <div className="text-6xl font-black text-primary mb-2">9.2</div>
                    <div className="text-sm uppercase tracking-widest text-muted-foreground">Conviction Score</div>
                 </div>
              </div>
            </section>

            {/* Section 3: Enrichment */}
            <section className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-primary font-bold mb-2 uppercase tracking-wide text-sm">Step 3</div>
                <h2 className="text-3xl font-bold font-headline mb-4">The Enrichment Layer</h2>
                <div className="prose dark:prose-invert text-muted-foreground">
                  <p className="mb-4">
                    Raw data isn't enough. Why are they buying?
                  </p>
                  <p>
                    For our top signals, our AI Analyst (GammaMolt) performs a deep-dive analysis:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 mt-4 text-foreground">
                    <li><strong>News Catalyst:</strong> Scanning recent headlines, earnings, and filings.</li>
                    <li><strong>Technical Levels:</strong> Identifying key support, resistance, and moving averages.</li>
                    <li><strong>Trade Thesis:</strong> Synthesizing the data into a clear "Why" and "How".</li>
                  </ul>
                </div>
              </div>
              <div className="bg-card border p-6 rounded-xl shadow-sm">
                 <div className="text-xs text-muted-foreground mb-2">AI ANALYSIS PREVIEW</div>
                 <h4 className="font-bold text-lg mb-2">Bullish Thesis: Breakout Imminent</h4>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                    "Institutional flow shows aggressive call buying at the $140 strike, targeting a 3-week expiry. 
                    Technicals confirm a breakout above the 50-day SMA. Recent earnings beat provides fundamental tailwind."
                 </p>
              </div>
            </section>

             {/* Section 4: Reading a Signal */}
             <section className="bg-muted/30 rounded-2xl p-8 md:p-12 border">
                <h2 className="text-3xl font-bold font-headline mb-8 text-center">Reading a Signal</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                         <h3 className="text-xl font-bold">The Anatomy of a Trade</h3>
                         <p className="text-muted-foreground">
                            Here is an example of a Score 9 signal (FSLY). Notice the alignment:
                         </p>
                         <ul className="space-y-2 text-sm">
                            <li className="flex justify-between border-b py-2">
                                <span>Positioning Size</span>
                                <span className="font-bold font-mono">$12.4M</span>
                            </li>
                            <li className="flex justify-between border-b py-2">
                                <span>Vol/OI Ratio</span>
                                <span className="font-bold font-mono text-green-500">4.5x</span>
                            </li>
                            <li className="flex justify-between border-b py-2">
                                <span>Directional Imbalance</span>
                                <span className="font-bold font-mono text-green-500">+76% Call Flow</span>
                            </li>
                            <li className="flex justify-between border-b py-2">
                                <span>Strikes Active</span>
                                <span className="font-bold font-mono">58</span>
                            </li>
                         </ul>
                    </div>
                    <div className="bg-background rounded-lg border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-2xl font-bold">FSLY</h4>
                            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">BULLISH</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                            <strong>Thesis:</strong> Heavy institutional accumulation ahead of cloud security conference.
                            Multiple blocks traded above ask.
                        </p>
                        <Button size="sm" variant="outline" className="w-full">View Full Analysis</Button>
                    </div>
                </div>
             </section>

             {/* Section 5: Disclaimer */}
             <section className="text-center max-w-2xl mx-auto pt-10">
                <h2 className="text-2xl font-bold font-headline mb-4">Signal vs. Recommendation</h2>
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-lg text-left">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        <strong>Important:</strong> These signals represent <em>institutional flow data</em>. 
                        They show you what big players are doing, but they are not financial advice. 
                        Institutions hedge, they make mistakes, and they have different time horizons. 
                        Always do your own due diligence.
                    </p>
                </div>
             </section>
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold mb-6">Ready to see what they're buying?</h2>
            <Button size="lg" className="h-12 px-8 text-lg" asChild>
                <Link href="/pricing">Get The Edge</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
