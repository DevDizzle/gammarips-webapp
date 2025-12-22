'use server';

import {
    addToWatchlistAdmin,
    removeFromWatchlistAdmin,
    getUserWatchlistAdmin,
    type WatchlistItem
} from '@/lib/firebase-admin';
import { getBatchQuotes } from '@/lib/fmp';

export async function addToWatchlist(uid: string, item: Omit<WatchlistItem, 'id' | 'addedAt'>) {
    let initialPrice = item.initial_price;
    
    // If price wasn't provided, try to fetch it now to set the baseline
    if (!initialPrice) {
        const symbol = item.type === 'option' ? item.contract_symbol : item.ticker;
        if (symbol) {
            const quotes = await getBatchQuotes([symbol]);
            initialPrice = quotes.get(symbol) ?? null;
        }
    }

    return await addToWatchlistAdmin(uid, {
        ...item,
        initial_price: initialPrice
    });
}

export async function removeFromWatchlist(uid: string, itemId: string) {
    return await removeFromWatchlistAdmin(uid, itemId);
}

export async function getUserWatchlist(uid: string): Promise<WatchlistItem[]> {
    const items = await getUserWatchlistAdmin(uid);
    
    if (items.length === 0) {
        return [];
    }

    // Collect all symbols to fetch
    const symbolsToFetch = new Set<string>();
    items.forEach(item => {
        if (item.type === 'option' && item.contract_symbol) {
            symbolsToFetch.add(item.contract_symbol);
        } else if (item.type === 'stock') {
            symbolsToFetch.add(item.ticker);
        }
    });

    if (symbolsToFetch.size === 0) {
        return items;
    }

    // Fetch live prices
    const priceMap = await getBatchQuotes(Array.from(symbolsToFetch));

    // Merge prices back into items
    return items.map(item => {
        const symbol = item.type === 'option' ? item.contract_symbol : item.ticker;
        const currentPrice = symbol ? priceMap.get(symbol) : null;
        
        // Backfill logic: If we have a current price but no initial price, treat current as initial
        // This handles legacy items or items where the initial fetch failed.
        // In a real app, we might want to async update the DB here, but for read-safety we'll just project it.
        const effectiveInitialPrice = item.initial_price ?? currentPrice;

        return {
            ...item,
            initial_price: effectiveInitialPrice,
            current_price: currentPrice ?? null 
        };
    });
}
