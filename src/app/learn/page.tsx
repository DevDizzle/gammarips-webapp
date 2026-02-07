import Link from "next/link";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { articles } from "@/lib/learn-content";

export const metadata: Metadata = {
  title: "Learn Options Trading & AI Analysis | GammaRips Academy",
  description: "Educational resources on options flow, gamma exposure, and AI-driven trading strategies. Master the market with GammaRips.",
  alternates: {
    canonical: "/learn",
  },
};

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline mb-4">GammaRips Academy</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Master the mechanics of the market. Learn how to interpret options flow, understand gamma exposure, and trade with data-driven confidence.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <Link key={article.slug} href={`/learn/${article.slug}`}>
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{article.title}</CardTitle>
                <CardDescription>{article.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {article.description}
                </p>
                <span className="text-primary text-sm font-medium mt-4 inline-block">
                  Read Article &rarr;
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
