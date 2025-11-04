'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Send, CheckCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleFeedbackSurvey } from '../actions';
import { AuthDialog } from '@/components/auth/auth-dialog';

export default function FeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [usageFrequency, setUsageFrequency] = useState('');
  const [tradingImpact, setTradingImpact] = useState('');
  const [tradingImpactExample, setTradingImpactExample] = useState('');
  const [perceivedValue, setPerceivedValue] = useState(0);
  const [improvementSuggestion, setImprovementSuggestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!usageFrequency || !tradingImpact || !perceivedValue || !improvementSuggestion) {
      toast({
        title: 'Missing Information',
        description: 'Please answer all required questions before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('loading');
    try {
      await handleFeedbackSurvey(user.uid, {
        usageFrequency,
        tradingImpact,
        tradingImpactExample,
        perceivedValue,
        improvementSuggestion,
      });
      setStatus('success');
    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Redirect non-logged-in users or show a login dialog
    router.push('/'); 
    return <AuthDialog open={true} onOpenChange={() => router.push('/')} />;
  }
  
  if (status === 'success') {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h3 className="text-xl font-semibold">Thank You for Your Feedback!</h3>
          <p className="text-muted-foreground">
            Your insights are what help us build a better product. We appreciate you taking the time.
          </p>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Share Your Feedback</CardTitle>
        <CardDescription>
          Your answers help us improve ProfitScout. This should only take a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1 */}
          <div className="space-y-3">
            <Label className="font-semibold text-base">In the past 7 days, how often have you used ProfitScout?</Label>
            <RadioGroup value={usageFrequency} onValueChange={setUsageFrequency} className="space-y-2">
              <div className="flex items-center space-x-2"><RadioGroupItem value="daily" id="q1-daily" /><Label htmlFor="q1-daily">Daily</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="2-3-times" id="q1-2-3" /><Label htmlFor="q1-2-3">2–3 times</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="once" id="q1-once" /><Label htmlFor="q1-once">Once</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="not-used" id="q1-not-used" /><Label htmlFor="q1-not-used">I haven’t really used it yet</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="trouble-starting" id="q1-trouble" /><Label htmlFor="q1-trouble">I tried, but had trouble getting started</Label></div>
            </RadioGroup>
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <Label className="font-semibold text-base">So far, how has ProfitScout influenced your options trading decisions?</Label>
            <RadioGroup value={tradingImpact} onValueChange={setTradingImpact} className="space-y-2">
              <div className="flex items-center space-x-2"><RadioGroupItem value="placed-trade" id="q2-placed" /><Label htmlFor="q2-placed">It helped me place a trade I felt more confident about</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="avoided-trade" id="q2-avoided" /><Label htmlFor="q2-avoided">It helped me avoid a trade I might have taken</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="no-decision-yet" id="q2-no-decision" /><Label htmlFor="q2-no-decision">I’ve explored the app but haven’t used it to make a decision yet</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="not-trading-yet" id="q2-not-trading" /><Label htmlFor="q2-not-trading">I haven’t placed any trades yet / I’m just learning</Label></div>
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
            <Label className="font-semibold text-base">Overall, how valuable has ProfitScout been to your options research so far?</Label>
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Not valuable</span>
                {[1, 2, 3, 4, 5].map(rating => (
                    <Star
                    key={rating}
                    className={`h-7 w-7 cursor-pointer transition-colors ${perceivedValue >= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                    onClick={() => setPerceivedValue(rating)}
                    />
                ))}
                <span className="text-sm text-muted-foreground">Extremely valuable</span>
            </div>
          </div>

          {/* Question 4 */}
          <div className="space-y-3">
            <Label htmlFor="q4-improvement" className="font-semibold text-base">What is the #1 thing we could improve or add to make ProfitScout more useful for you?</Label>
            <Textarea
              id="q4-improvement"
              value={improvementSuggestion}
              onChange={(e) => setImprovementSuggestion(e.target.value)}
              placeholder="E.g., a specific feature, data you wish we had, or something that feels confusing/slow."
              className="min-h-[100px]"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
