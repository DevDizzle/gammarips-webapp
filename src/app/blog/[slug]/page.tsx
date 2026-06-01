import { getBlogPostAdmin } from "@/lib/firebase-admin";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ISR: serve published posts and pick up edits without a redeploy.
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostAdmin(slug);
  if (!post) {
    return { title: "Post not found | GammaRips" };
  }
  return {
    title: `${post.title} | GammaRips`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://gammarips.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      url: `https://gammarips.com/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostAdmin(slug);
  if (!post) return notFound();

  const publishedISO = post.publishedAt || new Date().toISOString();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": "https://gammarips.com/og-image.png?v=3",
    "datePublished": publishedISO,
    "dateModified": publishedISO,
    "description": post.description,
    "author": { "@type": "Organization", "name": "GammaRips", "url": "https://gammarips.com" },
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "logo": { "@type": "ImageObject", "url": "https://gammarips.com/og-image.png?v=3" },
    },
    ...(post.keywords?.length ? { "keywords": post.keywords.join(", ") } : {}),
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/blog" className="hover:underline">← All posts</Link>
      </nav>

      {(post.publishedAt || post.readingTimeMin > 0) && (
        <div className="mb-6 text-sm text-muted-foreground flex items-center gap-3">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          )}
          {post.readingTimeMin > 0 && <span>· {post.readingTimeMin} min read</span>}
        </div>
      )}

      <article className="prose prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.markdown}</ReactMarkdown>
      </article>
    </div>
  );
}
