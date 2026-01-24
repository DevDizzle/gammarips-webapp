import Link from 'next/link';
import { TickerSearch } from '@/components/ticker-search';
import { UserNav } from '@/components/auth/user-nav';

export default function TickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl sm:text-2xl font-bold font-headline shrink-0 flex items-center gap-1">
            <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <TickerSearch />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
