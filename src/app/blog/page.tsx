import { getBlogPostsAdmin } from "@/lib/firebase-admin";
import Link from "next/link";
import { Metadata } from "next";

// ISR: pick up newly published posts without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog — Options Flow Methodology & Research | GammaRips",
  description: "How GammaRips reads institutional options flow: methodology, the research we trade on, and plain-English explainers on unusual options activity, V/OI, moneyness, and the overnight scan.",
  alternates: { canonical: "https://gammarips.com/blog" },
  openGraph: {
    title: "GammaRips Blog — Options Flow Methodology & Research",
    description: "Methodology, research, and plain-English explainers on overnight options flow.",
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
    "description": "Methodology, research, and explainers on overnight institutional options flow.",
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

      <header className="mb-10">
        <h1 className="text-4xl font-bold font-headline tracking-tight mb-3">Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          How the engine reads institutional options flow — methodology, the research we trade on, and plain-English explainers. No hype, no advice; the mechanics in the open.
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
