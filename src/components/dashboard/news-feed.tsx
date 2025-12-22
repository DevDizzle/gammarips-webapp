'use client';

import { useEffect, useState } from 'react';
import { getSmartNews } from '@/app/dashboard/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Newspaper } from 'lucide-react';
import Image from 'next/image';
import type { NewsItem } from '@/lib/polygon';
import { formatDistanceToNow } from 'date-fns';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export function NewsFeedWidget() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSmartNews();
        setNews(data);
      } catch (error) {
        console.error("Failed to fetch news", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
                <Newspaper className="h-5 w-5 text-primary" />
                Market News
            </CardTitle>
            {!user && (
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => openAuthModal('signUp')}>
                    Customize Feed
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-[400px] sm:h-[600px]">
            <div className="flex flex-col">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="p-4 border-b space-y-2">
                             <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                             <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                        </div>
                    ))
                ) : news.length > 0 ? (
                    news.map((item) => (
                        <a 
                            key={item.id} 
                            href={item.article_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block p-4 border-b hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {item.publisher?.favicon_url && (
                                            <img src={item.publisher.favicon_url} alt={item.publisher.name} className="w-4 h-4 rounded-full" />
                                        )}
                                        <span className="text-xs text-muted-foreground font-medium">{item.publisher.name}</span>
                                        <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(item.published_utc), { addSuffix: true })}</span>
                                    </div>
                                    <h4 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        {item.title}
                                    </h4>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {item.tickers?.slice(0, 3).map(ticker => (
                                            <span key={ticker} className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                                {ticker}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {item.image_url && (
                                    <div className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden bg-muted">
                                        <Image 
                                            src={item.image_url} 
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                )}
                            </div>
                        </a>
                    ))
                ) : (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                        No news available right now.
                    </div>
                )}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
