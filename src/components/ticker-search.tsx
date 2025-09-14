
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown, Search } from 'lucide-react';
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


// Helper to convert GCS URI to a public URL, correctly encoding path segments.
const convertGcsUriToUrl = (gcsUri: string) => {
  if (!gcsUri?.startsWith('gs://')) return '';
  const withoutScheme = gcsUri.slice('gs://'.length);
  const slash = withoutScheme.indexOf('/');
  const bucket = slash === -1 ? withoutScheme : withoutScheme.slice(0, slash);
  const object = slash === -1 ? '' : withoutScheme.slice(slash + 1);
  const encodedObject = object
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return `https://storage.googleapis.com/${bucket}/${encodedObject}`;
};


// A tiny, resilient logo component with an error fallback.
function TinyLogo({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = React.useState(false);
  const fallback = 'https://placehold.co/24x24/1e293b/a855f7?text=?';
  
  const finalSrc = broken ? fallback : src;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={24}
      height={24}
      className="rounded-full object-contain"
      onError={() => setBroken(true)}
      unoptimized // Optional but good for small, numerous icons.
    />
  );
}


export function TickerSearch() {
  const [open, setOpen] = React.useState(false);
  const [stocks, setStocks] = React.useState<Stock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchStocks = async () => {
      try {
        const fetchedStocks = await getStocks();
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
                {stocks.map((stock) => {
                    const imageUrl = stock.image_uri 
                      ? convertGcsUriToUrl(stock.image_uri) 
                      : `https://placehold.co/24x24/1e293b/a855f7?text=${stock.id[0]}`;
                    
                    return (
                        <CommandItem
                        key={stock.id}
                        value={`${stock.id} ${stock.company_name}`}
                        onSelect={() => handleSelect(stock.id)}
                        className="flex items-center gap-3"
                        >
                          <TinyLogo src={imageUrl} alt={`${stock.company_name} logo`} />
                          <span className="font-medium">{stock.id}</span>
                          <span className="text-xs text-muted-foreground truncate">{stock.company_name}</span>
                        </CommandItem>
                    )
                })}
                </CommandGroup>
            </CommandList>
            </Command>
        </PopoverContent>
        </Popover>
        <UserNav />
    </div>
  );
}
