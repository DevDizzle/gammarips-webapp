import { getSignalByTicker, getLatestOvernightSummary, getBlogPostsAdmin, getMostRecentSignalForTicker, getRelatedSignals } from "@/lib/firebase-admin";
import SignalClientPage from "./signal-client";
import { BlogTeaserList } from "@/components/blog/blog-teaser-list";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  const T = ticker.toUpperCase();

  // NOTE: the root layout applies the `%s | GammaRips` title template, so titles
  // here must NOT include a "| GammaRips" suffix (that produced the duplicated
  // "... | GammaRips | GammaRips" titles). Engine seoTitle is brand-free too.
  let title = `${T} Unusual Options Flow`;
  let description = `Institutional options flow analysis for ${T}.`;

  try {
    const summary = await getLatestOvernightSummary();
    const signal =
      (summary ? await getSignalByTicker(summary.scan_date, T) : null) ||
      (await getMostRecentSignalForTicker(ticker));

    if (signal?.seoMetadata?.seoTitle || signal?.seoMetadata?.seoDescription) {
      // Best case: the engine wrote per-ticker SEO metadata for this signal.
      title = signal.seoMetadata.seoTitle || title;
      description = signal.seoMetadata.seoDescription || description;
    } else if (signal) {
      // Historical tickers (resolved via getMostRecentSignalForTicker) often have
      // no engine seoMetadata. Build a unique, query-relevant title/description
      // from the signal's own fields instead of the generic boilerplate, so every
      // ticker page carries distinct metadata.
      const dir = (signal.direction || "").toUpperCase();
      const dirWord = dir === "BULLISH" ? "Bullish" : dir === "BEARISH" ? "Bearish" : "";
      title = dirWord ? `${T} Unusual Options Flow — ${dirWord}` : `${T} Unusual Options Flow`;
      description = buildSignalDescription(signal, T);
    }
  } catch (error) {
    console.error("Error fetching signal metadata:", error);
  }

  return {
    title,
    description,
    // Canonical must be the UPPERCASE url regardless of the casing that arrived:
    // the route resolves case-insensitively, and the case-preserving redirects in
    // next.config.ts (/:ticker, /stocks/:ticker) feed lowercase variants in. A
    // raw-casing canonical made /signals/aapl and /signals/AAPL compete as
    // duplicates in GSC (48 pages). src/middleware.ts 308s non-uppercase paths
    // before render — the component-level check below never fired in production.
    alternates: { canonical: `https://gammarips.com/signals/${T}` },
  };
}

/** Compose a 140-160 char meta description from a signal's own fields when no
 *  engine seoMetadata is present. Leads with ticker + direction + the
 *  load-bearing datum (catalyst/headline/flow), no hype. */
function buildSignalDescription(signal: any, T: string): string {
  const dir = (signal.direction || "").toUpperCase();
  const dirWord = dir === "BULLISH" ? "bullish" : dir === "BEARISH" ? "bearish" : "directional";

  // Prefer the analyst thesis if it exists; trim to a clean sentence boundary.
  const thesis = (signal.thesis || "").trim();
  if (thesis.length >= 80) {
    const lead = `${T} ${dirWord} options flow: `;
    const room = 158 - lead.length;
    let body = thesis.slice(0, room);
    if (thesis.length > room) {
      const cut = body.lastIndexOf(" ");
      if (cut > room * 0.6) body = body.slice(0, cut);
      body = body.replace(/[\s,;:.]+$/, "") + "…";
    }
    return lead + body;
  }

  // Otherwise assemble from structured fields.
  const flow = Math.max(signal.call_dollar_volume || 0, signal.put_dollar_volume || 0);
  const flowStr =
    flow >= 1_000_000 ? `$${(flow / 1_000_000).toFixed(1)}M` : flow > 0 ? `$${Math.round(flow / 1000)}K` : "";
  const catalyst = (signal.key_headline || signal.catalyst_type || "").trim();
  const sector = (signal.sector || "").trim();

  const parts = [
    `${T} flagged for ${dirWord} unusual options activity`,
    flowStr ? `on ${flowStr} directional flow` : "",
    sector ? `in ${sector}` : "",
  ].filter(Boolean);
  let out = parts.join(" ") + ".";
  if (catalyst && out.length + catalyst.length + 2 <= 158) out += ` ${catalyst}.`;
  return out.slice(0, 160);
}

export default async function SignalPage({ params }: PageProps) {
  const { ticker } = await params;

  // Fallback only — src/middleware.ts does the real 308 before this renders.
  // Kept because it costs nothing and covers a platform that skips middleware;
  // do NOT rely on it, it does not produce a 308 on Firebase App Hosting (the
  // head is already streamed by the time this throws).
  if (ticker !== ticker.toUpperCase()) {
    permanentRedirect(`/signals/${ticker.toUpperCase()}`);
  }

  // Latest scan first; fall back to the most recent scan that contained this
  // ticker so historical (ranking) detail pages resolve instead of 404ing.
  const summary = await getLatestOvernightSummary();
  const signal =
    (summary ? await getSignalByTicker(summary.scan_date, ticker.toUpperCase()) : null) ||
    (await getMostRecentSignalForTicker(ticker));

  if (!signal) {
    return notFound();
  }

  // Sibling signals from the same scan/direction (intra-/signals link mesh) and
  // recent blog posts (cross-link the blog from our largest page inventory).
  const [relatedSignals, blogPosts] = await Promise.all([
    getRelatedSignals(signal.scan_date, signal.ticker, signal.direction, 6, signal.sector),
    getBlogPostsAdmin(),
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": signal.seoMetadata?.seoTitle || `${signal.ticker} Institutional Options Flow Analysis`,
    "image": "https://gammarips.com/og-image.png?v=3",
    "datePublished": `${signal.scan_date}T08:00:00Z`,
    "dateModified": signal.updated_at ? new Date(signal.updated_at).toISOString() : `${signal.scan_date}T08:00:00Z`,
    "description": signal.seoMetadata?.seoDescription || signal.thesis || `Options analysis for ${ticker.toUpperCase()}`,
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": { "@type": "Organization", "name": "GammaRips", "logo": { "@type": "ImageObject", "url": "https://gammarips.com/icon.png" } },
    ...(signal.seoMetadata?.keywords ? { "keywords": signal.seoMetadata.keywords.join(', ') } : {}),
    "articleBody": signal.thesis || `Institutional ${signal.direction} options flow analysis for ${signal.ticker}.`,
    "mainEntity": {
      "@type": "FinancialProduct",
      "name": signal.recommended_contract || `${signal.ticker} Options`,
      "category": "Options Contract",
      "description": `Options flow for ${signal.ticker} indicating ${signal.direction} intent. Strike: ${signal.recommended_strike}, Expiration: ${signal.recommended_expiration}`
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <SignalClientPage signal={signal} relatedSignals={relatedSignals} />
      {/* Back-link to the morning briefing this signal came from.
       *
       * Ticker pages are the largest inventory on the site (~800) and linked to
       * no report at all, while the reports are the surface that actually ranks
       * (GSC 90d: pos 3.0 and 9.3 on dated analyst queries). This points the
       * bulk inventory at the surface that earns, and gives the reader the
       * market context the ticker page alone does not carry. */}
      {signal.scan_date && (
        <section className="container mx-auto px-4 pb-8 max-w-4xl">
          <div className="rounded-lg border border-muted bg-muted/20 p-4 text-sm">
            <Link
              href={`/reports/${signal.scan_date}`}
              className="text-primary hover:underline font-medium"
            >
              Read the {signal.scan_date} morning briefing
            </Link>
            <span className="text-muted-foreground">
              {" "}
              for the full scan this {signal.ticker} signal came from: the bull and bear
              split, the themes institutional money leaned into, and every other ticker
              that cleared the bar that day.
            </span>
          </div>
        </section>
      )}
      {blogPosts.length > 0 && (
        <section className="container mx-auto px-4 pb-12 max-w-4xl">
          <BlogTeaserList
            posts={blogPosts}
            heading="How We Read This Flow"
            subheading="Plain-English explainers on the methodology behind signals like this one."
            limit={3}
          />
        </section>
      )}
    </>
  );
}
