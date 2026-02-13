import { Metadata } from 'next';
import { PublicHeader } from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Signal Scorecard | Verified Performance | GammaRips",
  description: "Every Overnight Edge signal is timestamped and tracked. See our verified win rate and performance history. No cherry-picking — just data.",
};

export default function ScorecardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6">
            THE OVERNIGHT EDGE — SIGNAL SCORECARD
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Every signal is timestamped. Every result is tracked.<br />
            No cherry-picking. No hindsight bias. Just data.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
             <Card className="bg-muted/30 border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                        <span className="text-3xl">📊</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Performance Tracking Active</h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Win tracking for The Overnight Edge began in February 2026. 
                        We need a minimum of 30 days of data to display statistically significant performance metrics.
                    </p>
                    <div className="bg-background border px-4 py-2 rounded text-sm font-mono text-muted-foreground">
                        Check back for verified results soon.
                    </div>
                </CardContent>
             </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
