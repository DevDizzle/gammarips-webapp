
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { handleFeedbackSurvey } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthDialog } from '@/components/auth/auth-dialog';
import type { FeedbackSurveyData } from '@/lib/firebase-admin';

export default function FeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [usageFrequency, setUsageFrequency] = useState('');
  const [tradingImpact, setTradingImpact] = useState('');
  const [tradingImpactExample, setTradingImpactExample] = useState('');
  const [perceivedValue, setPerceivedValue] = useState(0);
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    if (!usageFrequency || !tradingImpact || perceivedValue === 0 || !improvementSuggestion) {
      toast({
        title: 'Please complete all required fields',
        description: 'Your feedback is valuable, please fill out all parts of the survey.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('loading');
    
    const surveyData: FeedbackSurveyData = {
        usageFrequency,
        tradingImpact,
        tradingImpactExample,
        perceivedValue,
        improvementSuggestion,
    };

    try {
      await handleFeedbackSurvey(user.uid, surveyData);
      setStatus('success');
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-20rem)]">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user && !authLoading) {
     return (
        <>
            <AuthDialog open={!user} onOpenChange={() => router.push('/')} />
        </>
    );
  }
  
  if (status === 'success') {
    return (
        <Card>
            <CardHeader className="items-center text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Thank You for Your Feedback!</CardTitle>
                <CardDescription>Your insights are incredibly valuable and will help us make ProfitScout even better.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </CardContent>
        </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Your Feedback</CardTitle>
        <CardDescription>
          Your answers will help us improve ProfitScout. This will only take a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1 */}
          <div className="space-y-3">
            <Label className="font-semibold">In the past 7 days, how often have you used ProfitScout?</Label>
            <RadioGroup value={usageFrequency} onValueChange={setUsageFrequency} required>
              <div className="flex items-center space-x-2"><RadioGroupItem value="daily" id="q1-daily" /><Label htmlFor="q1-daily">Daily</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="2-3-times" id="q1-2-3" /><Label htmlFor="q1-2-3">2–3 times</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="once" id="q1-once" /><Label htmlFor="q1-once">Once</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="not-used" id="q1-not-used" /><Label htmlFor="q1-not-used">I haven’t really used it yet</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="trouble-starting" id="q1-trouble" /><Label htmlFor="q1-trouble">I tried, but had trouble getting started</Label></div>
            </RadioGroup>
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <Label className="font-semibold">So far, how has ProfitScout influenced your options trading decisions?</Label>
            <RadioGroup value={tradingImpact} onValueChange={setTradingImpact} required>
                <div className="flex items-center space-x-2"><RadioGroupItem value="helped-place-trade" id="q2-place" /><Label htmlFor="q2-place">It helped me place a trade I felt more confident about</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="helped-avoid-trade" id="q2-avoid" /><Label htmlFor="q2-avoid">It helped me avoid a trade I might have taken</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="explored-no-decision" id="q2-explore" /><Label htmlFor="q2-explore">I’ve explored the app but haven’t used it to make a decision yet</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no-trades-placed" id="q2-no-trades" /><Label htmlFor="q2-no-trades">I haven’t placed any trades yet / I’m just learning</Label></div>
            </RadioGroup>
             <Textarea
                value={tradingImpactExample}
                onChange={(e) => setTradingImpactExample(e.target.value)}
                placeholder="Tell us about one example (optional)"
                className="mt-2"
            />
          </div>

          {/* Question 3 */}
          <div className="space-y-3">
            <Label className="font-semibold">Overall, how valuable has ProfitScout been to your options research so far?</Label>
            <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className={`h-8 w-8 cursor-pointer transition-colors ${perceivedValue >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                        onClick={() => setPerceivedValue(star)}
                    />
                ))}
            </div>
          </div>
          
          {/* Question 4 */}
          <div className="space-y-3">
            <Label htmlFor="q4-improvement" className="font-semibold">What is the #1 thing we could improve or add to make ProfitScout more useful for you?</Label>
            <Textarea
                id="q4-improvement"
                value={improvementSuggestion}
                onChange={(e) => setImprovementSuggestion(e.target.value)}
                placeholder="E.g., a specific feature, data you wish we had, or something that feels confusing/slow."
                required
            />
          </div>

          <Button type="submit" className="w-full" disabled={status === 'loading'}>
            {status === 'loading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
