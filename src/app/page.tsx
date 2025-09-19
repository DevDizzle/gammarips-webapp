
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Bot, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TickerSearch } from "@/components/ticker-search";
import WinnersDashboard from "@/app/dashboard/winners-dashboard";

const faqs = [
    {
        question: "What kind of signals do you provide?",
        answer: "We provide daily BUY/SELL ratings on stocks and high-potential CALL/PUT signals on options for the Russell 1000."
    },
    {
        question: "How often are ratings updated?",
        answer: "Daily. We refresh signals to reflect new price action, news, and company updates to ensure you have a timely edge."
    },
    {
        question: "Is this financial advice?",
        answer: "No. ProfitScout provides research ratings and AI-driven insights to support your decisions. It is not financial advice."
    },
    {
        question: "Who is this for?",
        answer: "Our platform is designed for active traders and investors who want to leverage AI to find actionable signals in the market without spending hours on research."
    }
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            ProfitScout
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <TickerSearch />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-24">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
            Find Your Next Winning Trade
          </h2>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Get AI-powered stock and options signals on the Russell 1000.
            <br />
            Stop chasing noise. Start acting on actionable intelligence.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <a href="#winners-dashboard">
                <Button size="lg" className="font-bold">
                    See Today’s Top Signals
                    <ArrowRight className="ml-2 h-5 w-5 inline-block" />
                </Button>
            </a>
            <p className="text-sm text-muted-foreground">
              Daily signals curated from today’s market—one click away.
            </p>
          </div>
        </section>

        {/* Winners Dashboard Section */}
        <section id="winners-dashboard" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
            <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold font-headline">Today's Top Signals</h2>
                 <p className="mt-2 text-muted-foreground">AI-curated stock and options opportunities, refreshed daily.</p>
            </div>
            <WinnersDashboard />
        </section>

        {/* FAQs Section */}
        <section
          id="faq"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                               {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

        {/* Pricing */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h3 className="text-3xl font-bold font-headline mb-4">Go Unlimited</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Start free with 5 AI analyses. Go unlimited anytime for $8/month.
          </p>
          <ul className="space-y-2 text-muted-foreground mb-8">
            <li>✅ Unlimited access to AI-driven Stock & Options signals</li>
            <li>✅ Refreshed daily across the Russell 1000</li>
            <li>✅ Simple plan, cancel anytime</li>
          </ul>
          <Button asChild size="lg" className="font-bold">
            <Link href="/dashboard">
              Get Started Free{" "}
              <ArrowRight className="ml-2 h-5 w-5 inline-block" />
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
