import { getBlogPostAdmin } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { McpConversionCard } from "@/components/mcp-conversion-card";
import { OG_IMAGE } from '@/lib/constants';

// ISR: serve published posts and pick up edits without a redeploy.
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

/** Strip a leading `# Heading` line from markdown when we render `<h1>{post.title}</h1>` directly. */
function stripLeadingH1(md: string): string {
  return md.replace(/^\s*#\s+[^\n]+\n+/, '');
}

/** Extract `### Question?` + answer blocks from markdown for FAQPage JSON-LD (AI Overviews). */
function extractMarkdownFaqs(md: string): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const regex = /^###\s+([^\n?]+\?)\s*\n+([\s\S]*?)(?=\n#{2,3}\s+|\n---\s*$|$)/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(md)) !== null) {
    const q = match[1].replace(/[*_`]/g, '').trim();
    const rawA = match[2]
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`>#]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (q.length >= 10 && rawA.length >= 25) {
      faqs.push({ q, a: rawA.slice(0, 800) });
    }
  }
  return faqs;
}

// High-ROI SERP title/description overrides for top-ranking Firestore blog
// posts (backed by live GSC audit: keeps rendered `<title>` <= 62 chars, fixes
// truncated 88-97 char titles, removes stale "30-day trial", restores "Trading Bot",
// and broadens beyond options-only).
const BLOG_SEO_OVERRIDES: Record<
  string,
  { title: string; description: string; h1?: string }
> = {
  "best-mcp-servers-for-trading-and-finance": {
    title: "Best Trading & Stock Market MCP Servers (2026)",
    description:
      "Compare top MCP servers for stock trading, options flow, 2x ETFs & hedge fund research. Free tier + Pro ($29/mo, 7-day trial) with 10-second Claude setup.",
  },
  "how-to-build-a-trading-bot-with-claude": {
    title: "How to Build a Trading Bot with Claude & MCP (2026)",
    h1: "How to Build a Trading Bot with Claude & MCP (2026 Guide)",
    description:
      "Build an AI trading bot with Claude Desktop or Claude Code over MCP across stocks, 2x ETFs, and options — with live liquidity checks, risk sizing, and stops.",
  },
  "how-to-read-options-volume-vs-open-interest": {
    title: "Options Volume vs. Open Interest Explained (2026)",
    description:
      "Learn what options volume vs. open interest (V/OI) means, how to spot fresh institutional money vs. closing trades, and why book depth improves order fills.",
  },
  "filtering-0dte-options-flow": {
    title: "0DTE vs. Swing Options Flow: Cut Noise & Bad Fills",
    description:
      "Why intraday option orders get rejected, how to avoid 0DTE decay traps, and simple liquidity filters that separate institutional flow from retail noise.",
  },
  "how-to-analyze-options-flow": {
    title: "How to Analyze Options Flow: Plain-English Guide",
    description:
      "Step-by-step guide to reading options flow: volume vs. open interest, sweeps vs. hedges, book depth, and realized-vs-implied volatility checks.",
  },
  "options-block-trade-vs-sweep": {
    title: "Options Block Trade vs. Sweep: Spot Smart Money",
    description:
      "Learn the difference between block trades and sweeps across stocks and options, where to track them, and how to tell institutional conviction from hedging.",
  },
  "options-flow-scanner-free-vs-paid": {
    title: "Free vs. Paid Options Flow Scanners: What to Watch",
    description:
      "Compare free and paid options flow scanners in 2026: what free tools show, where delayed quotes and thin books hurt fills, and what AI agents actually need.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostAdmin(slug);
  if (!post) {
    return { title: "Post not found" };
  }
  const override = BLOG_SEO_OVERRIDES[post.slug];
  const seoTitle = override?.title || post.title;
  const seoDescription = override?.description || post.description;
  return {
    // Root layout applies the `%s | GammaRips` title template — do NOT add the
    // suffix here or it doubles ("… | GammaRips | GammaRips").
    title: seoTitle,
    description: seoDescription,
    keywords: post.keywords,
    authors: [{ name: "Evan Parra", url: "https://gammarips.com/about" }],
    alternates: { canonical: `https://gammarips.com/blog/${post.slug}` },
    openGraph: {
      images: [OG_IMAGE],
      title: seoTitle,
      description: seoDescription,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || post.publishedAt || undefined,
      authors: ["Evan Parra"],
      url: `https://gammarips.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostAdmin(slug);
  if (!post) return notFound();

  const override = BLOG_SEO_OVERRIDES[post.slug];
  const displayTitle = override?.h1 || post.title;
  const displayDescription = override?.description || post.description;
  const publishedISO = post.publishedAt || new Date().toISOString();
  const modifiedISO = post.updatedAt || publishedISO;
  const cleanMarkdown = stripLeadingH1(post.markdown || '');
  const wordCount = cleanMarkdown ? cleanMarkdown.trim().split(/\s+/).length : undefined;
  const extractedFaqs = extractMarkdownFaqs(cleanMarkdown);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": displayTitle,
    "image": "https://gammarips.com/og-image.png?v=4",
    "datePublished": publishedISO,
    "dateModified": modifiedISO,
    "description": displayDescription,
    "author": {
      "@type": "Person",
      "name": "Evan Parra",
      "jobTitle": "Founder & CEO",
      "url": "https://gammarips.com/about",
    },
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "url": "https://gammarips.com",
      "logo": { "@type": "ImageObject", "url": "https://gammarips.com/icon.png" },
    },
    ...(post.keywords?.length ? { "keywords": post.keywords.join(", ") } : {}),
    ...(post.readingTimeMin > 0 ? { "timeRequired": `PT${post.readingTimeMin}M` } : {}),
    ...(wordCount ? { "wordCount": wordCount } : {}),
    "mainEntityOfPage": `https://gammarips.com/blog/${post.slug}`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Blog", "item": "https://gammarips.com/blog" },
      { "@type": "ListItem", "position": 2, "name": post.title, "item": `https://gammarips.com/blog/${post.slug}` },
    ],
  };

  const faqSchema = extractedFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": extractedFaqs.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a },
    })),
  } : null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <Breadcrumbs
        className="mb-6"
        emitJsonLd={false}
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: post.title },
        ]}
      />

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline tracking-tight text-balance mb-3">
          {displayTitle}
        </h1>
        <div className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            By{" "}
            <Link href="/about" className="text-foreground hover:text-primary font-medium">
              Evan Parra
            </Link>
          </span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </time>
            </>
          )}
          {post.updatedAt && post.updatedAt.slice(0, 10) !== post.publishedAt.slice(0, 10) && (
            <>
              <span>·</span>
              <span>
                Updated{" "}
                <time dateTime={post.updatedAt}>
                  {new Date(post.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </time>
              </span>
            </>
          )}
          {post.readingTimeMin > 0 && (
            <>
              <span>·</span>
              <span>{post.readingTimeMin} min read</span>
            </>
          )}
        </div>
      </header>

      <article className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanMarkdown}</ReactMarkdown>
      </article>

      <div className="mt-12 space-y-6">
        <McpConversionCard source={`blog_${post.slug}`} />

        <nav className="border-t pt-6 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/blog/best-mcp-servers-for-trading-and-finance" className="text-muted-foreground hover:text-primary">
              Best Trading MCP Servers →
            </Link>
            <Link href="/blog/how-to-build-a-trading-bot-with-claude" className="text-muted-foreground hover:text-primary">
              Claude Trading Bot Guide →
            </Link>
            <Link href="/build" className="text-muted-foreground hover:text-primary">
              Custom Agent Build ($1,000) →
            </Link>
          </div>
          <Link href="/blog" className="text-primary hover:underline font-medium">
            All research &amp; guides →
          </Link>
        </nav>
      </div>
    </div>
  );
}
