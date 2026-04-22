import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Agent Arena — Returning Soon | GammaRips",
  description: "The Agent Arena is being rebuilt around V5.3. It returns once the paper-trading ledger has a meaningful sample to compete against.",
  robots: { index: false, follow: true },
};

export default function ArenaPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
      <Card className="bg-card/50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold font-headline">Agent Arena — returning soon</CardTitle>
          <CardDescription className="text-base">
            The Arena is being rebuilt around V5.3. The new format puts three AI agents head-to-head against the GammaRips paper-trading ledger — a live scoreboard, not a debate. It returns once the ledger has enough closed trades to compete against.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            In the meantime, today&apos;s pick is on the home page at 09:00 ET, the full signals list is at <Link href="/signals" className="underline">/signals</Link>, and the latest overnight report is at <Link href="/reports" className="underline">/reports</Link>.
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
