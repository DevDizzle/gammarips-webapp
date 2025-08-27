
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Settings, Sparkles, MessageSquare, RefreshCw, ArrowRight } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { getOrCreateUser } from '@/lib/firebase';
import type { Stock } from '@/lib/firebase';
import { handleGetRecommendation, handleFeedback, createCheckoutSession, getStocks } from '../actions';
import { MultiSelect, type Option } from '@/components/multi-select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionDialog } from '@/components/auth/subscription-dialog';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { Markdown } from '@/components/markdown';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DashboardClientPageProps {
  initialStocks: Stock[];
}

function DashboardClientPage({ initialStocks }: DashboardClientPageProps) {
  const { user, loading: authLoading } = useAuth();

  const [stockOptions, setStockOptions] = useState<Option[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<Option[]>([]);
  const [analysisMarkdown, setAnalysisMarkdown] = useState<string>('');
  const [analysisTicker, setAnalysisTicker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStocks, setIsFetchingStocks] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { toast } = useToast();
  
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
  
  useEffect(() => {
    // Initially populate stocks from props (which will be empty on first load)
    const options = initialStocks.map((stock: Stock) => ({
      value: stock.id,
      label: `${stock.id} - ${stock.company_name}`,
    }));
    setStockOptions(options);

    // Fetch stocks on component mount if the initial list is empty
    if (initialStocks.length === 0) {
      fetchStocks();
    }
  }, [initialStocks, fetchStocks]);

  useEffect(() => {
    if (user) {
      getOrCreateUser(user.uid, user.isAnonymous).then((dbUser) => {
        setUsageCount(dbUser.usageCount);
        setIsSubscribed(dbUser.isSubscribed);
      });
    }
  }, [user]);

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
    setAnalysisTicker(null);

    let ticker: string | undefined;
    let companyName: string | undefined;

    if (selectedTickers.length === 1) {
      [ticker] = selectedTickers[0].label.split(' - ');
      companyName = selectedTickers[0].label.substring(ticker.length + 3);
    }

    try {
      // Find all stocks (not just initial) to get the correct URI
      const allStocks = await getStocks();
      const uris = selectedTickers
        .map((t) => {
          const stock = allStocks.find((s) => s.id === t.value);
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
      
      if (typeof result === 'object' && 'markdown' in result && result.markdown) {
        setAnalysisMarkdown(result.markdown);
        if(result.ticker) {
            setAnalysisTicker(result.ticker);
        }
      } else {
        setAnalysisMarkdown('Analysis generated.');
      }


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
    setAnalysisTicker(null);

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
      
      if (typeof result === 'object' && 'markdown' in result && result.markdown) {
        setAnalysisMarkdown(result.markdown);
         if(result.ticker) {
            setAnalysisTicker(result.ticker);
        }
      } else {
        setAnalysisMarkdown('Analysis generated.');
      }

      // Clear selected tickers after getting AI top pick
      setSelectedTickers([]);

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

  useEffect(() => {
    if (user && !analysisMarkdown) {
        getAITopPick();
    }
  }, [user, getAITopPick, analysisMarkdown]);

  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setIsLoading(true);
    try {
      await handleFeedback(feedbackText);
      setFeedbackText('');
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

  const renderAnalysisControls = () => {
    if (authLoading && stockOptions.length === 0) {
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
          disabled={authLoading || isFetchingStocks}
        />
      </div>
    );
  };
  
  const renderDesktopControls = () => (
     <div className="col-span-1 md:col-span-1 lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="text-primary" />
              AI Top Pick
            </CardTitle>
            <CardDescription>Let our AI find the best stock for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={getAITopPick} disabled={isLoading || authLoading} className="w-full">
              {isLoading && selectedTickers.length === 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Get AI Top Pick
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Settings className="text-primary" />
              Stock Analysis
            </CardTitle>
            <CardDescription>Select a stock to analyze</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {renderAnalysisControls()}
            <p className="text-sm text-muted-foreground text-center">
              {isSubscribed ? 'Premium Account' : `${Math.max(0, 5 - usageCount)} / 5 free analyses remaining.`}
            </p>
            <Button
              onClick={getRecommendation}
              disabled={isLoading || authLoading || selectedTickers.length === 0}
              className="w-full"
            >
              {isLoading && selectedTickers.length > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Launch Analysis
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <MessageSquare className="text-primary" />
              Feedback
            </CardTitle>
            <CardDescription>Help us improve ProfitScout!</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea
              placeholder="Tell us what you think..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
            />
            <Button onClick={submitFeedback} className="w-full" disabled={!feedbackText.trim() || isLoading}>
              Submit Feedback
            </Button>
          </CardContent>
        </Card>
      </div>
  );

  const renderMobileControls = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="ai-pick">
        <AccordionTrigger>
           <Sparkles className="text-primary mr-2" /> AI Top Pick
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 p-4">
           <p className="text-sm text-muted-foreground">Let our AI find the best stock for you.</p>
           <Button onClick={getAITopPick} disabled={isLoading || authLoading} className="w-full">
              {isLoading && selectedTickers.length === 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Get AI Top Pick
            </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="stock-analysis">
        <AccordionTrigger>
          <Settings className="text-primary mr-2" /> Stock Analysis
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">Select a stock to analyze</p>
          {renderAnalysisControls()}
            <p className="text-sm text-muted-foreground text-center">
              {isSubscribed ? 'Premium Account' : `${Math.max(0, 5 - usageCount)} / 5 free analyses remaining.`}
            </p>
            <Button
              onClick={getRecommendation}
              disabled={isLoading || authLoading || selectedTickers.length === 0}
              className="w-full"
            >
              {isLoading && selectedTickers.length > 0 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Launch Analysis
            </Button>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="feedback">
        <AccordionTrigger>
          <MessageSquare className="text-primary mr-2" /> Feedback
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4 p-4">
          <p className="text-sm text-muted-foreground">Help us improve ProfitScout!</p>
          <Textarea
              placeholder="Tell us what you think..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
            />
            <Button onClick={submitFeedback} className="w-full" disabled={!feedbackText.trim() || isLoading}>
              Submit Feedback
            </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderAnalysisCard = () => {
    const tickerToShow = selectedTickers.length === 1 ? selectedTickers[0].value : analysisTicker;

    return (
        <Card className="w-full h-full">
        <CardContent className="p-6">
            <Markdown content={analysisMarkdown} />
            {tickerToShow && (
                <Button asChild className="mt-4">
                <Link href={`/stocks/${tickerToShow}`}>
                    View Detailed Analysis <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                </Button>
            )}
        </CardContent>
        </Card>
    );
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
      
      {/* Mobile Layout: Accordion */}
      <div className="md:hidden flex flex-col gap-4">
        {renderMobileControls()}
        <div className="w-full">
           {isLoading && !analysisMarkdown && (
                <Card className="w-full h-full">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                             <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {analysisMarkdown && renderAnalysisCard()}
        </div>
      </div>

      {/* Desktop Layout: Grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {renderDesktopControls()}

        <div className="md:col-span-2 lg:col-span-3">
            {isLoading && !analysisMarkdown && (
                <Card className="w-full h-full">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                             <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {analysisMarkdown && renderAnalysisCard()}
        </div>
      </div>
    </>
  );
}

export default DashboardClientPage;
