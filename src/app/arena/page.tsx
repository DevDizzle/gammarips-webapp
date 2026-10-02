import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Agent Arena (retired)",
  description: "The multi-model Agent Arena is retired. Today your own AI builds the trade plan from the GammaRips pool, in Claude, ChatGPT, Cursor, or Codex.",
  robots: { index: false, follow: true },
  alternates: { canonical: '/arena' },
};

export default function ArenaPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Agent Arena is retired</CardTitle>
          <CardDescription className="text-base">
            The multi-model debate Arena is retired. Today your own AI does the work: it reads the nightly pool of better-quality contracts, sets the target and the stop from the exit lab, and builds the trade plan with you. <Link href="/how-it-works" className="underline">See how it works</Link>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse the pool free at <Link href="/signals" className="underline">/signals</Link>, read the latest overnight report at <Link href="/reports" className="underline">/reports</Link>, or add GammaRips to your AI from <Link href="/developers" className="underline">the connect steps</Link>.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/signals">Browse the pool</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">Pricing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
