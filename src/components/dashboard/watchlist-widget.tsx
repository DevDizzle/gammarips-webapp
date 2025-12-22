'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Target, Lock, ListTodo, Trash2, RefreshCw } from 'lucide-react';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { useAuth } from '@/hooks/use-auth';
import { getUserWatchlist, removeFromWatchlist } from '@/app/actions/watchlist';
import type { WatchlistItem } from '@/lib/firebase-admin';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function WatchlistWidget() {
  const { openAuthModal } = useAuthModal();
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const data = await getUserWatchlist(user.uid);
        setItems(data);
    } catch (error) {
        console.error("Failed to fetch watchlist", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
        fetchWatchlist();
    }
    
    // Listen for updates from other components
    const handleUpdate = () => {
        if (user) fetchWatchlist();
    };
    window.addEventListener('watchlist-updated', handleUpdate);
    return () => window.removeEventListener('watchlist-updated', handleUpdate);
  }, [user]);

  const handleRemove = async (itemId: string) => {
      if (!user) return;
      try {
          await removeFromWatchlist(user.uid, itemId);
          setItems(prev => prev.filter(i => i.id !== itemId));
          toast({ title: "Removed from watchlist" });
          window.dispatchEvent(new Event('watchlist-updated'));
      } catch (e) {
          toast({ title: "Failed to remove", variant: "destructive" });
      }
  };

  const handleAction = () => {
    openAuthModal('signUp');
  };

  if (user) {
      return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" />
                    My Watchlist
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={fetchWatchlist} disabled={loading}>
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 text-muted-foreground">
                        <ListTodo className="h-12 w-12 opacity-20" />
                        <p className="text-sm">Your watchlist is empty.</p>
                        <p className="text-xs">Click the star on any contract to track it.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {items.map(item => {
                            const entryPrice = item.initial_price;
                            const currentPrice = item.current_price;
                            
                            // Calculate ROI if we have both prices
                            let roi = null;
                            let isGainer = false;
                            
                            if (entryPrice && currentPrice) {
                                roi = ((currentPrice - entryPrice) / entryPrice) * 100;
                                isGainer = roi >= 0;
                            }

                            return (
                                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{item.ticker}</span>
                                            {item.type === 'option' && (
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">OPTION</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                            {item.company_name || item.contract_symbol || 'Asset'}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-mono mt-1">
                                            {entryPrice && (
                                                <span className="text-muted-foreground">
                                                    Entry: <span className="text-foreground">${entryPrice.toFixed(2)}</span>
                                                </span>
                                            )}
                                            {currentPrice && (
                                                <span className="text-muted-foreground">
                                                    Curr: <span className="text-foreground">${currentPrice.toFixed(2)}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                         {roi !== null ? (
                                            <span className={cn("text-sm font-bold", isGainer ? "text-green-500" : "text-red-500")}>
                                                {isGainer ? '+' : ''}{roi.toFixed(2)}%
                                            </span>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleRemove(item.id)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
      );
  }

  return (
    <Card className="h-full flex flex-col border-dashed border-2">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            My Scouting Report
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
         <div className="bg-muted/50 p-4 rounded-full">
            <Lock className="h-8 w-8 text-muted-foreground" />
         </div>
         <div className="space-y-1">
            <h4 className="font-semibold">Track Your Rips</h4>
            <p className="text-sm text-muted-foreground max-w-[220px] mx-auto">
                Build a watchlist of high-conviction setups and simulate your entries.
            </p>
         </div>
         
         <div className="w-full max-w-[240px] space-y-2">
             <div className="relative">
                 <Input 
                    placeholder="Add Ticker (e.g. NVDA)" 
                    disabled 
                    className="bg-muted/30"
                 />
                 <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-0 top-0 h-full text-muted-foreground"
                    onClick={handleAction}
                 >
                     <Plus className="h-4 w-4" />
                 </Button>
             </div>
             <Button className="w-full" onClick={handleAction}>
                 Start Tracking (Free)
             </Button>
         </div>
      </CardContent>
    </Card>
  );
}
