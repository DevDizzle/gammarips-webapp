
import type { Metadata } from 'next';
import { UserNav } from '@/components/auth/user-nav';
import Link from 'next/link';
import { TickerSearch } from '@/components/ticker-search';
import { AuthProvider } from '@/hooks/use-auth';
import { getAppStatus } from '../actions';
import DataUpdatingPage from '@/components/layout/data-updating-page';

export const metadata: Metadata = {
  title: 'Dashboard | ProfitScout',
  description: 'Your personal dashboard for AI-powered stock and options analysis. View top setups, track performance, and search any ticker.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isUpdating } = await getAppStatus();

  if (isUpdating) {
    return (
      <html lang="en" className="dark">
        <body>
          <DataUpdatingPage />
        </body>
      </html>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="text-2xl font-bold font-headline text-primary shrink-0">ProfitScout</Link>
          <div className="flex flex-1 items-center justify-end space-x-2 sm:space-x-4">
            <TickerSearch />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
