import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OG_IMAGE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Agent Arena (Retired)",
  description:
    "The multi-model Agent Arena is retired. Explore our live X-Trader benchmark, browse the daily pool preview, or connect your own AI over MCP.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://gammarips.com/arena" },
  openGraph: {
    images: [OG_IMAGE],
    title: "Agent Arena (Retired) | GammaRips",
    description:
      "The multi-model Agent Arena is retired. Inspect our live X-Trader benchmark or connect your AI over MCP.",
    url: "https://gammarips.com/arena",
  },
};

export default function ArenaPage() {
  return (
    <section className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
      <Card className="bg-card/50">
        <CardHeader>
          <h1 className="text-3xl font-bold font-headline">Agent Arena is retired</h1>
          <CardDescription className="text-base mt-2">
            We replaced the old multi-model debate Arena with two live products: our public{' '}
            <Link href="/xtrader" className="text-primary underline">
              X-Trader dual-book benchmark
            </Link>{' '}
            (2x ETFs vs. options) and direct MCP access so your own AI builds trade plans from
            clean nightly data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse today&apos;s free 3-setup preview at{' '}
            <Link href="/signals" className="underline">
              /signals
            </Link>
            , inspect the live agent log at{' '}
            <Link href="/xtrader" className="underline">
              /xtrader
            </Link>
            , or connect your AI at{' '}
            <Link href="/developers" className="underline">
              /developers
            </Link>
            .
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/xtrader">Watch Live Agent Benchmark</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signals">Daily Pool Preview</Link>
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
