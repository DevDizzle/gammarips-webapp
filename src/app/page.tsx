
'use client';

import { TickerSearch } from "@/components/ticker-search";
import Link from "next/link";
import TodaysWinners from "@/app/dashboard/todays-winners";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function HomePageContent() {
  const searchParams = useSearchParams();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authDialogDefaultView, setAuthDialogDefaultView] = useState<'signIn' | 'signUp'>('signUp');

  useEffect(() => {
    if (searchParams.get('from') === 'verification' && searchParams.get('verified') === 'true') {
      setAuthDialogDefaultView('signIn');
      setShowAuthDialog(true);
    }
  }, [searchParams]);

  return (
    <>
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        defaultView={authDialogDefaultView}
      />
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold font-headline text-primary">
              ProfitScout
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <TickerSearch />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          {/* Hero */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-24">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-headline tracking-tight">
              Find Your Next Winning Options Trade
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Get AI-powered stock signals that pinpoint high-potential options setups in the Russell 1000. Stop chasing noise and start trading with confidence.
            </p>
          </section>

          {/* Winners Dashboard Section */}
          <section id="winners-dashboard" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 scroll-mt-20">
              <TodaysWinners />
          </section>
          
        </main>
      </div>
    </>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
