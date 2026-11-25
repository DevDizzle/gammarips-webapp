'use client';

import Link from "next/link";
import { UserNav } from "@/components/auth/user-nav";
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

  // Clean, consistent top-level navigation across the whole site.
  const links = [
    { href: '/signals', label: 'Daily Pool' },
    { href: '/xtrader', label: 'Live Agent' },
    { href: '/developers', label: 'MCP' },
    { href: '/build', label: 'Custom Build' },
    { href: '/how-it-works', label: 'Learn' },
    { href: '/blog', label: 'Blog' },
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline shrink-0">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
             {/* Desktop Nav — indicates current page with aria-current + non-color underline */}
             <nav aria-label="Primary" className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-muted-foreground mr-2">
                {links.map(({ href, label }) => {
                  const isCurrent = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                  return (
                    <Link 
                      key={href} 
                      href={href} 
                      aria-current={isCurrent ? 'page' : undefined}
                      className={cn(
                        "hover:text-primary transition-colors py-1 border-b-2 border-transparent whitespace-nowrap",
                        isCurrent && "text-primary border-primary"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}
             </nav>

            <UserNav />

            {/* Mobile Nav */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden ml-1 z-50 text-foreground">
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
                <nav aria-label="Mobile" className="flex flex-col gap-4 mt-8">
                  {links.map(({ href, label }) => {
                    const isCurrent = href === '/' ? pathname === '/' : pathname?.startsWith(href);
                    return (
                      <Link 
                        key={href} 
                        href={href} 
                        aria-current={isCurrent ? 'page' : undefined}
                        className={cn(
                          "text-lg font-medium transition-colors hover:text-primary pl-3 border-l-2 border-transparent",
                          isCurrent ? "text-primary border-primary" : "text-muted-foreground"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  );
}
