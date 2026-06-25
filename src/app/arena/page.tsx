import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Agent Arena — Retired | GammaRips",
  description: "The multi-model Agent Arena has been retired. GammaRips now selects each day's pick with a single-model randomized bracket tournament — see how it works.",
  robots: { index: false, follow: true },
};

export default function ArenaPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Agent Arena — retired</CardTitle>
          <CardDescription className="text-base">
            The multi-model debate Arena has been retired. As of June 2026 the live engine selects each day&apos;s single pick with a randomized <Link href="/how-it-works" className="underline">bracket tournament</Link> — three independent brackets over the ~50 bullish setups, with the consensus winner becoming the pick. No debate transcript, no five-model panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Today&apos;s pick is on the home page at 09:50 ET, the full signals list is at <Link href="/signals" className="underline">/signals</Link>, and the latest overnight report is at <Link href="/reports" className="underline">/reports</Link>.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/">See today&apos;s pick</Link>
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
