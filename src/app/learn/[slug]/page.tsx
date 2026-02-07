import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getArticle, articles } from "@/lib/learn-content";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: `${article.title} | GammaRips Learn`,
    description: article.description,
    alternates: {
      canonical: `/learn/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      publishedTime: article.date,
      authors: ["GammaRips Team"],
    },
  };
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);

  if (!article) {
    return notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "datePublished": article.date,
    "author": {
      "@type": "Organization",
      "name": "GammaRips"
    },
    "publisher": {
      "@type": "Organization",
      "name": "GammaRips",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gammarips.com/icon.png"
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground">
            <Link href="/learn" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>
        </Button>
      </div>

      <article className="prose prose-invert max-w-none">
        <h1 className="font-headline text-4xl mb-4">{article.title}</h1>
        <div className="text-sm text-muted-foreground mb-8">
            Published on {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </article>

      <div className="mt-16 pt-8 border-t">
        <h3 className="text-xl font-bold font-headline mb-4">Ready to apply what you've learned?</h3>
        <p className="text-muted-foreground mb-6">
            See real-time options flow and AI-driven trade setups on the dashboard.
        </p>
        <Button asChild size="lg">
            <Link href="/dashboard">Explore the Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
