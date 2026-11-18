import { getBlogPostsAdmin } from "@/lib/firebase-admin";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Metadata } from "next";
import { OG_IMAGE } from '@/lib/constants';

// ISR: pick up newly published posts without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  // Root layout applies the `%s | GammaRips` title template — no suffix here.
  title: "Blog — Agentic Options Trading, MCP Guides & Microstructure Research",
  description:
    "Walk-forward options microstructure research from Catalyst Lab (N = 5,575 contracts) and practical MCP guides for Claude, ChatGPT, Cursor, and Codex.",
  alternates: { canonical: "https://gammarips.com/blog" },
  openGraph: {
    images: [OG_IMAGE],
    title: "GammaRips Blog — Agentic Options Trading, MCP Guides & Research",
    description: "Catalyst Lab walk-forward research (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, RV/IV >= 0.85) and MCP implementation guides for AI trading agents.",
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
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-3">Research &amp; MCP Guides</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Catalyst Lab walk-forward microstructure audits, Combo A contract gates, and step-by-step guides for connecting Claude, ChatGPT, Cursor, and Codex to real US options data over MCP.
        </p>
      </header>

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
