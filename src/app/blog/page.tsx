import { getBlogPostsAdmin } from "@/lib/firebase-admin";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";
import { OG_IMAGE } from '@/lib/constants';

// ISR: pick up newly published posts without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "AI Trading Agents, MCP & Options Flow Guides",
  description:
    "Step-by-step guides to trading MCP servers, Claude trading bots, options flow analysis, and walk-forward market research across stocks, 2x ETFs, and options.",
  alternates: { canonical: "https://gammarips.com/blog" },
  openGraph: {
    images: [OG_IMAGE],
    title: "AI Trading Agents, MCP & Options Flow Guides | GammaRips",
    description:
      "Plain-English guides to trading MCP servers, Claude trading bots, options flow, and walk-forward market research across stocks, 2x ETFs, and options.",
    type: "website",
    url: "https://gammarips.com/blog",
  },
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogIndexPage() {
  const posts = await getBlogPostsAdmin();

  const listSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "GammaRips Blog",
    "description": "Walk-forward options microstructure research, Combo A dataset engineering, and MCP setup guides for AI trading agents.",
    "url": "https://gammarips.com/blog",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `https://gammarips.com/blog/${p.slug}`,
        "name": p.title,
      })),
    },
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }} />

      <Breadcrumbs className="mb-6" items={[{ name: "Home", href: "/" }, { name: "Blog" }]} />

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight mb-3">
          AI Trading Agent, MCP &amp; Options Flow Guides
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
          Practical guides for building AI trading bots with Claude, ChatGPT, and MCP, reading
          options flow across stocks and 2x ETFs, and auditing real market liquidity data.
        </p>
      </header>

      <section aria-label="Featured Guides and Research" className="mb-12">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
          Featured Guides &amp; Research
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/blog/best-mcp-servers-for-trading-and-finance"
            className="block rounded-lg border border-primary/30 bg-card/50 p-5 hover:bg-muted/40 transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">2026 Comparison · Setup</p>
            <h3 className="text-lg font-bold font-headline text-foreground">Best MCP Servers for Trading &amp; Stock Market Data</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Compare GammaRips, Alpaca, Robinhood, Polygon/Massive, TradingView, and SEC EDGAR MCP servers with copy-paste setup steps.
            </p>
          </Link>
          <Link
            href="/blog/how-to-build-a-trading-bot-with-claude"
            className="block rounded-lg border border-primary/30 bg-card/50 p-5 hover:bg-muted/40 transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Claude &amp; MCP Walkthrough</p>
            <h3 className="text-lg font-bold font-headline text-foreground">How to Build a Trading Bot with Claude &amp; MCP</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Connect Claude to nightly stock, 2x ETF, and options data, verify live morning liquidity, and build risk-sized trade plans.
            </p>
          </Link>
          <Link
            href="/blog/catalyst-lab-combo-a-options-microstructure-audit"
            className="block rounded-lg border border-muted bg-card/30 p-5 hover:bg-muted/40 transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Walk-Forward Audit · N = 5,575</p>
            <h3 className="text-lg font-bold font-headline text-foreground">Auditing 5,575 Overnight Setups: Why Liquidity &amp; Vol Value Win</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Why we killed black-box ML pick scores and built our filter around real order-book depth, pricing floors, and realized-vs-implied volatility.
            </p>
          </Link>
          <Link
            href="/blog/how-to-read-options-volume-vs-open-interest"
            className="block rounded-lg border border-muted bg-card/30 p-5 hover:bg-muted/40 transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Plain-English Guide</p>
            <h3 className="text-lg font-bold font-headline text-foreground">Options Volume vs. Open Interest: Spotting Fresh Money</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              How to read volume-to-open-interest ratios, tell new institutional positioning from closing trades, and avoid wide spreads.
            </p>
          </Link>
        </div>
      </section>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No posts published yet — check back soon.</p>
      ) : (
        <div className="grid gap-6">
          {posts.map((post) => (
            <article key={post.slug} className="border border-muted rounded-lg p-6 hover:bg-muted/30 transition-colors">
              <Link href={`/blog/${post.slug}`} className="group">
                <h2 className="text-2xl font-semibold font-headline group-hover:underline underline-offset-4">
                  {post.title}
                </h2>
              </Link>
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-3">
                {post.publishedAt && <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>}
                {post.readingTimeMin > 0 && <span>· {post.readingTimeMin} min read</span>}
              </div>
              {post.description && (
                <p className="mt-3 text-muted-foreground leading-relaxed">{post.description}</p>
              )}
              <Link
                href={`/blog/${post.slug}`}
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
