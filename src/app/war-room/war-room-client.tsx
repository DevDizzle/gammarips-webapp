'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, Lock, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WarRoomPage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/action?mode=signIn&redirect=/war-room');
        return;
      }

      if (dbUser) {
        const hasAccess = 
          (dbUser.plan === 'warroom' && dbUser.subscriptionStatus === 'active') ||
          dbUser.subscriptionStatus === 'founder_lifetime' ||
          // Allow access if they just subscribed (might be a race condition with webhook)
          // Ideally we check stripe subscription status directly or rely on claims, 
          // but for now relying on Firestore is the pattern.
          (dbUser.plan === 'warroom' && dbUser.isSubscribed);

        setIsAuthorized(hasAccess);
      }
    }
  }, [user, dbUser, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null; // Will redirect

  if (!isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <Lock className="h-6 w-6" />
              <CardTitle className="text-2xl font-bold font-headline">The War Room 🔒</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg">
              The War Room is our premium live signals channel — real-time institutional flow alerts 
              delivered straight to your WhatsApp by GammaMolt, our AI analyst.
            </p>

            <div>
              <h3 className="font-semibold mb-2">What&apos;s Included</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Pre-market overnight flow signals (scored & enriched)</li>
                <li>Intraday high-conviction alerts</li>
                <li>Daily performance tracking</li>
                <li>Direct analyst access</li>
              </ul>
            </div>

            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/pricing">Upgrade to War Room — $149/mo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl space-y-8">
      <header className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-4xl font-bold font-headline">Welcome to The War Room</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          You&apos;re in. Here&apos;s your access to GammaRips&apos; live institutional flow intelligence.
        </p>
      </header>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>Join the WhatsApp Group</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild size="lg" className="w-full text-lg font-bold">
            <a href="https://chat.whatsapp.com/GaND1Tga8dJ6P0gFnpRwVI" target="_blank" rel="noopener noreferrer">
              Join The War Room →
            </a>
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Invite link checks will be performed periodically. Unauthorized members will be removed.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What You&apos;ll Receive</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li><strong className="text-primary">6:00 AM EST</strong> — Daily Overnight Edge report</li>
              <li><strong className="text-primary">9:30 AM EST</strong> — Pre-market enriched picks</li>
              <li><strong className="text-primary">Intraday</strong> — High-conviction alerts</li>
              <li><strong className="text-primary">4:30 PM EST</strong> — Win tracker results</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
                <span>Do NOT share the invite link</span>
              </li>
              <li className="flex gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
                <span>Do NOT screenshot alerts for redistribution</span>
              </li>
              <li className="text-muted-foreground">
                Questions? Email <a href="mailto:support@gammarips.com" className="underline">support@gammarips.com</a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4 pt-8 border-t">
        <h2 className="text-2xl font-bold font-headline">Your Analyst</h2>
        <p className="text-muted-foreground">
          GammaMolt is our AI-powered institutional flow analyst. It scans overnight options activity, 
          enriches signals with news and technicals, and delivers actionable intelligence before the market opens.
        </p>
      </section>
    </div>
  );
}
