import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { PublicHeader } from '@/components/layout/public-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Blog | GammaRips',
  description: 'Latest updates, market analysis, and educational content from the GammaRips team.',
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-4 mb-12 text-center">
          <h1 className="text-4xl font-bold font-headline tracking-tight">GammaRips Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Market insights, educational resources, and updates from our team.
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="group h-full">
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors duration-200 bg-card overflow-hidden">
                   {post.image && (
                    <div className="relative w-full h-48 overflow-hidden border-b border-border">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors text-2xl">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {/* Spacer or extra content if needed */}
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground flex items-center justify-between border-t pt-4 mt-auto">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
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
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>No posts found. Check back later!</p>
          </div>
        )}
      </main>
    </div>
  );
}