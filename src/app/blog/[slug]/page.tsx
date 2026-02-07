import { getPostBySlug } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { PublicHeader } from '@/components/layout/public-header';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';
import Image from 'next/image';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found | GammaRips',
    };
  }

  return {
    title: `${post.title} | GammaRips Blog`,
    description: post.description,
    openGraph: post.image ? {
      images: [post.image],
    } : undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "image": post.image ? [post.image] : undefined,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.publishDate,
    "dateModified": post.publishDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://gammarips.com/blog/${slug}`
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
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <Link 
          href="/blog" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        <article className="prose prose-invert prose-lg max-w-none">
          {post.image && (
            <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden border border-border">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <header className="mb-8 not-prose border-b border-border pb-8">
            <div className="flex gap-2 mb-4">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight mb-4 text-foreground">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              {post.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-foreground">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.publishDate}>
                  {new Date(post.publishDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>
          </header>

          <div className="text-foreground">
            <MDXRemote source={post.content} />
          </div>
        </article>
      </main>
    </div>
  );
}