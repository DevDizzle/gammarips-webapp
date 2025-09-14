
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { getStocks } from '@/app/actions';
import type { Stock } from '@/lib/firebase-admin';
import { Skeleton } from './ui/skeleton';
import { UserNav } from './auth/user-nav';


export function TickerSearch() {
  const [open, setOpen] = React.useState(false);
  const [stocks, setStocks] = React.useState<Stock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchStocks = async () => {
      try {
        const fetchedStocks = await getStocks();
        // Sort stocks by ticker symbol
        fetchedStocks.sort((a, b) => a.id.localeCompare(b.id));
        setStocks(fetchedStocks);
      } catch (error) {
        console.error("Failed to fetch stocks for search:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  const handleSelect = (ticker: string) => {
    setOpen(false);
    // Navigate to the new dynamic dashboard page.
    // This route will be created in the next step.
    router.push(`/dashboard/${ticker}`);
  };

  if (loading) {
    return (
        <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-64 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
        </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between text-muted-foreground"
            >
            <Search className="mr-2 h-4 w-4 shrink-0" />
            Search ticker...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
            <Command>
            <CommandInput placeholder="Search by ticker or company..." />
            <CommandList>
                <CommandEmpty>No stock found.</CommandEmpty>
                <CommandGroup>
                {stocks.map((stock) => (
                    <CommandItem
                    key={stock.id}
                    value={`${stock.id} ${stock.company_name}`}
                    onSelect={() => handleSelect(stock.id)}
                    className="flex items-center gap-3"
                    >
                    <Image
                        src={stock.image_uri || `https://placehold.co/32x32/1e293b/a855f7?text=${stock.id[0]}`}
                        alt={`${stock.company_name} logo`}
                        width={24}
                        height={24}
                        className="rounded-full object-contain"
                    />
                    <span className="font-medium">{stock.id}</span>
                    <span className="text-xs text-muted-foreground truncate">{stock.company_name}</span>
                    </CommandItem>
                ))}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
        <UserNav />
    </div>
  );
}
