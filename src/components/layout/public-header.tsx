'use client';

import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
import { TickerSearch } from "@/components/ticker-search";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/weekly-picks', label: 'Weekly Picks' },
    { href: '/learn', label: 'Learn' },
    { href: '/blog', label: 'Blog' },
    { href: '/developers', label: 'Developers' },
  ];

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline shrink-0">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
             {/* Desktop Nav */}
             <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground mr-4">
                {links.map(({ href, label }) => (
                  <Link 
                    key={href} 
                    href={href} 
                    className={cn(
                      "hover:text-primary transition-colors",
                      pathname?.startsWith(href) && "text-primary"
                    )}
                  >
                    {label}
                  </Link>
                ))}
             </nav>

            <TickerSearch />
            <UserNav />

            {/* Mobile Nav */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden ml-1">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-background">
                <SheetHeader>
                  <SheetTitle className="text-left font-headline">
                    <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    href="/" 
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      pathname === '/' ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  {links.map(({ href, label }) => (
                    <Link 
                      key={href} 
                      href={href} 
                      className={cn(
                        "text-lg font-medium transition-colors hover:text-primary",
                        pathname?.startsWith(href) ? "text-primary" : "text-muted-foreground"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  );
}