
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Settings, Sparkles, MessageSquare, Menu, RefreshCw } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getOrCreateUser } from '@/lib/firebase';
import type { Stock } from '@/lib/firebase';
import { handleGetRecommendation, handleFeedback, createCheckoutSession, getStocks } from '../actions';
import { MultiSelect, type Option } from '@/components/multi-select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SubscriptionDialog } from '@/components/auth/subscription-dialog';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { UserNav } from '@/components/auth/user-nav';
import { Markdown } from '@/components/markdown';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DashboardClientPageProps {
  initialStocks: Stock[];
}

// ---------- Sidebar content (unchanged behavior, no chat) ----------
interface SidebarContentProps {
  isLoading: boolean;
  authLoading: boolean;
  stockOptions: Option[];
  isFetchingStocks: boolean;
  selectedTickers: Option[];
  isSubscribed: boolean;
  usageCount: number;
  feedbackText: string;
  onTickerSelectionChange: (selected: Option[]) => void;
  onFetchStocks: () => void;
  onGetRecommendation: () => void;
  onGetAITopPick: () => void;
  onFeedbackTextChange: (text: string) => void;
  onSubmitFeedback: () => void;
}

const renderAnalysisControls = (
  isAuthLoading: boolean,
  stockOptions: Option[],
  isFetchingStocks: boolean,
  selectedTickers: Option[],
  handleTickerSelection: (selected: Option[]) => void,
  fetchStocks: () => void
) => {
  if (isAuthLoading && stockOptions.length === 0) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Stock Ticker</label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Stock Ticker</label>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchStocks}
          disabled={isFetchingStocks}
          aria-label="Refresh stocks"
        >
          <RefreshCw className={`h-4 w-4 ${isFetchingStocks ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <MultiSelect
        options={stockOptions}
        selected={selectedTickers}
        onChange={handleTickerSelection}
        className="w-full"
        placeholder="Select a stock..."
        max={1}
        disabled={isAuthLoading}
      />
    </div>
  );
};

const SidebarContent: React.FC<SidebarContentProps> = ({
  isLoading,
  authLoading,
  stockOptions,
  isFetchingStocks,
  selectedTickers,
  isSubscribed,
  usageCount,
  feedbackText,
  onTickerSelectionChange,
  onFetchStocks,
  onGetRecommendation,
  onGetAITopPick,
  onFeedbackTextChange,
  onSubmitFeedback,
}) => {
  return (
    <div className="p-4 flex flex-col gap-4 h-full bg-background">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Settings className="text-primary" />
            Stock Analysis
          </CardTitle>
          <CardDescription>Select a stock to analyze</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
          {renderAnalysisControls(
            authLoading,
            stockOptions,
            isFetchingStocks,
            selectedTickers,
            onTickerSelectionChange,
            onFetchStocks
          )}
          <p className="text-sm text-muted-foreground text-center">
            {isSubscribed ? 'Premium Account' : `${Math.max(0, 5 - usageCount)} / 5 free analyses remaining.`}
          </p>
          <Button
            onClick={onGetRecommendation}
            disabled={isLoading || authLoading || selectedTickers.length === 0}
            className="w-full mt-auto"
          >
            {isLoading && selectedTickers.length > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Launch Analysis
          </Button>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Top Pick
          </CardTitle>
          <CardDescription>Let our AI find the best stock for you right now.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-end gap-4">
          <p className="text-sm text-muted-foreground text-center">
            {isSubscribed ? 'Premium Account' : `${Math.max(0, 5 - usageCount)} / 5 free analyses remaining.`}
          </p>
          <Button onClick={onGetAITopPick} disabled={isLoading || authLoading} className="w-full">
            {isLoading && selectedTickers.length === 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get AI Top Pick
          </Button>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <MessageSquare className="text-primary" />
            Feedback
          </CardTitle>
          <CardDescription>Help us improve ProfitScout!</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
          <Textarea
            placeholder="Tell us what you think..."
            value={feedbackText}
            onChange={(e) => onFeedbackTextChange(e.target.value)}
            rows={3}
            className="flex-grow"
          />
          <Button onClick={onSubmitFeedback} className="w-full" disabled={!feedbackText.trim() || isLoading}>
            {isLoading && !feedbackText.trim() ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Feedback
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Main page (no chat, auto-run top-pick, render markdown) ----------
function DashboardClientPage({ initialStocks }: DashboardClientPageProps) {
  const { user, loading: authLoading } = useAuth();

  const [stockOptions, setStockOptions] = useState<Option[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<Option[]>([]);
  const [analysisMarkdown, setAnalysisMarkdown] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStocks, setIsFetchingStocks] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const options = initialStocks.map((stock: Stock) => ({
      value: stock.id,
      label: `${stock.id} - ${stock.company_name}`,
    }));
    setStockOptions(options);
  }, [initialStocks]);

  useEffect(() => {
    if (user) {
      getOrCreateUser(user.uid, user.isAnonymous).then((dbUser) => {
        setUsageCount(dbUser.usageCount);
        setIsSubscribed(dbUser.isSubscribed);
      });
    }
  }, [user]);

  const fetchStocks = useCallback(async () => {
    setIsFetchingStocks(true);
    try {
      const stocks = await getStocks();
      const options = stocks.map((stock: Stock) => ({
        value: stock.id,
        label: `${stock.id} - ${stock.company_name}`,
      }));
      setStockOptions(options);
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      toast({
        title: 'Error fetching stocks',
        description: 'Could not load stock data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingStocks(false);
    }
  }, [toast]);

  const handleTickerSelection = (selected: Option[]) => {
    setSelectedTickers(selected);
  };

  const checkUsageLimit = async () => {
    if (!user) return false;
    const dbUser = await getOrCreateUser(user.uid, user.isAnonymous);
    setUsageCount(dbUser.usageCount);
    setIsSubscribed(dbUser.isSubscribed);
    if (dbUser.usageCount >= 5 && !dbUser.isSubscribed) {
      setShowSubscriptionDialog(true);
      return false;
    }
    return true;
  };

  const getRecommendation = async () => {
    if (isLoading || selectedTickers.length === 0) return;
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (!(await checkUsageLimit())) return;

    setIsLoading(true);
    setIsSheetOpen(false);

    let ticker: string | undefined;
    let companyName: string | undefined;

    if (selectedTickers.length === 1) {
      [ticker, companyName] = selectedTickers[0].label.split(' - ');
    }

    try {
      const uris = selectedTickers
        .map((t) => {
          const stock = initialStocks.find((s) => s.id === t.value);
          return stock?.bundle_gcs_path || '';
        })
        .filter(Boolean);

      const result = await handleGetRecommendation(user!.uid, {
        uris,
        ticker,
        companyName,
      });

      if ('error' in result && result.required === 'subscription') {
        setShowSubscriptionDialog(true);
        setIsLoading(false);
        return;
      }
      if ('error' in result) {
        throw new Error(result.error);
      }

      // Support both shapes: { markdown } or plain string
      const md =
        (typeof result === 'object' && 'markdown' in result && typeof result.markdown === 'string')
          ? result.markdown
          : typeof result === 'string'
            ? result
            : 'Analysis generated.';

      setAnalysisMarkdown(md);

      const dbUser = await getOrCreateUser(user!.uid, user!.isAnonymous);
      setUsageCount(dbUser.usageCount);
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not generate the analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAITopPick = useCallback(async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    if (!(await checkUsageLimit())) return;

    setIsLoading(true);
    setIsSheetOpen(false);

    try {
      const result = await handleGetRecommendation(user.uid, { uris: [] });

      if ('error' in result && result.required === 'subscription') {
        setShowSubscriptionDialog(true);
        setIsLoading(false);
        return;
      }
      if ('error' in result) {
        throw new Error(result.error);
      }

      const md =
        (typeof result === 'object' && 'markdown' in result && typeof result.markdown === 'string')
          ? result.markdown
          : typeof result === 'string'
            ? result
            : 'Analysis generated.';

      setAnalysisMarkdown(md);

      const dbUser = await getOrCreateUser(user.uid, user.isAnonymous);
      setUsageCount(dbUser.usageCount);
    } catch (error: any) {
      console.error('Failed to get AI Top Pick:', error);
      toast({
        title: 'AI Top Pick Failed',
        description: error.message || 'Could not generate the AI Top Pick. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]); 

  // Auto-run AI Top Pick on each load
  useEffect(() => {
    if (user) {
        getAITopPick();
    }
  }, [user, getAITopPick]);

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsLoading(true);
    try {
      await handleFeedback(feedbackText);
      setFeedbackText('');
      setIsSheetOpen(false);
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for helping us improve ProfitScout!',
      });
    } catch (error: any) {
      toast({
        title: 'Feedback Failed',
        description: error.message || 'Could not submit your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribeClick = async () => {
    if (!user) return;
    setIsCheckingOut(true);
    try {
      const { sessionId } = await createCheckoutSession(user.uid);
      const stripe = await stripePromise;
      const { error } = await stripe!.redirectToCheckout({ sessionId });
      if (error) {
        toast({
          title: 'Checkout Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Subscription Error',
        description: 'Could not initiate the subscription process. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const sidebarProps: SidebarContentProps = {
    isLoading,
    authLoading,
    stockOptions,
    isFetchingStocks,
    selectedTickers,
    isSubscribed,
    usageCount,
    feedbackText,
    onTickerSelectionChange: handleTickerSelection,
    onFetchStocks: fetchStocks,
    onGetRecommendation: getRecommendation,
    onGetAITopPick: getAITopPick,
    onFeedbackTextChange: setFeedbackText,
    onSubmitFeedback: submitFeedback,
  };

  return (
    <>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      <SubscriptionDialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
        onSubscribe={handleSubscribeClick}
        loading={isCheckingOut}
      />

      <div className="flex h-[calc(100vh-4rem)] bg-background">
        <main className="flex-1 flex flex-col p-4">
          <header className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="default" className="gap-2">
                  <Menu className="h-5 w-5" />
                  <span>Select Stock</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[350px]">
                <SheetHeader>
                  <SheetTitle className="sr-only">Analysis Controls</SheetTitle>
                </SheetHeader>
                <SidebarContent {...sidebarProps} />
              </SheetContent>
            </Sheet>
            <UserNav />
          </header>

          {/* Analysis Card */}
          <div className="flex-grow flex flex-col items-start justify-start">
            {isLoading && !analysisMarkdown && (
              <div className="space-y-2 w-full max-w-2xl">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            )}

            {analysisMarkdown && (
              <Card className="w-full max-w-3xl">
                <CardContent className="p-6">
                  <Markdown content={analysisMarkdown} />
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ✅ Default export so `src/app/dashboard/page.tsx` can `import DashboardClientPage from "./dashboard-client-page"`
export default DashboardClientPage;
