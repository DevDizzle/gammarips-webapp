import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserNav } from "@/components/auth/user-nav";
import { ArrowRight, Bot, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Timely Edge",
    description:
      "We blend price action, news flow, earnings tone, and core fundamentals to surface stocks with near-term potential—refreshed daily so you can act when it matters.",
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: "Clear, Actionable Ratings",
    description:
      "Every ticker gets a simple Buy, Hold, or Sell rating with concise highlights you can skim in seconds.",
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "Balanced by the Basics",
    description:
      "Signals reflect what’s moving the market and what supports it—financials and fundamentals keep you grounded, not chasing noise.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            ProfitScout
          </Link>
          <UserNav />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-32">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
            Smarter Investing Starts Here
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-guided Buy, Hold, Sell ratings on every stock in the Russell 1000.
            <br />
            Stop guessing. Start investing with confidence.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <Button asChild size="lg" className="font-bold">
              <Link href="/dashboard?mode=top-pick">
                See Today’s AI Top Picks{" "}
                <ArrowRight className="ml-2 h-5 w-5 inline-block" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Timely signals curated from today’s market—one click away.
            </p>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold font-headline">Why investors use ProfitScout</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="bg-card/50 border-border/50 text-center"
              >
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold font-headline">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h3 className="text-3xl font-bold font-headline mb-4">Go Unlimited</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Start free with 5 AI stock analyses. Go unlimited anytime for $8/month.
          </p>
          <ul className="space-y-2 text-muted-foreground mb-8">
            <li>✅ Unlimited access to AI-driven Buy / Hold / Sell ratings</li>
            <li>✅ Refreshed daily across the Russell 1000</li>
            <li>✅ Simple plan, cancel anytime</li>
          </ul>
          <Button asChild size="lg" className="font-bold">
            <Link href="/dashboard">
              Get Started Free{" "}
              <ArrowRight className="ml-2 h-5 w-5 inline-block" />
            </Link>
          </Button>
          <p className="mt-2 text-sm text-muted-foreground">
            Clear ratings. Near-term opportunities. Less guesswork.
          </p>
        </section>
      </main>
    </div>
  );
}
