'use client';

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { addToWatchlist } from '@/app/actions/watchlist';
import { useToast } from '@/hooks/use-toast';

interface WatchlistButtonProps {
    ticker: string;
    contractSymbol?: string;
    type: 'stock' | 'option';
    price?: number;
    companyName?: string;
}

export function WatchlistButton({ ticker, contractSymbol, type, price, companyName }: WatchlistButtonProps) {
    const { user } = useAuth();
    const { openAuthModal } = useAuthModal();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false); 

    const handleClick = async (e: React.MouseEvent) => {
        e.stopPropagation(); 
        
        if (!user) {
            openAuthModal();
            return;
        }

        setLoading(true);
        try {
            const result = await addToWatchlist(user.uid, {
                ticker,
                contract_symbol: contractSymbol,
                type,
                initial_price: price,
                company_name: companyName
            });

            if (result) {
                setAdded(true);
                toast({ title: "Added to watchlist" });
                window.dispatchEvent(new Event('watchlist-updated'));
            } else {
                toast({ title: "Already in watchlist" });
                setAdded(true);
            }
        } catch {
            toast({ title: "Failed to add", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-muted"
            onClick={handleClick}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
             <Star className={`h-4 w-4 ${added ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />}
        </Button>
    );
}
