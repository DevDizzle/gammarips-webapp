
import type { Metadata } from 'next';
import { UserNav } from '@/components/auth/user-nav';
import Link from 'next/link';
import { TickerSearch } from '@/components/ticker-search';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Dashboard | ProfitScout',
  description: 'Your AI-powered investment dashboard.',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="container flex h-16 items-center justify-between space-x-4">
            <Link href="/" className="text-2xl font-bold font-headline text-primary">ProfitScout</Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <TickerSearch />
            </div>
          </div>
        </header>
        <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}

    