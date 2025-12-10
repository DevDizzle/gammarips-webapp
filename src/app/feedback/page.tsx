
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
import { Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthDialog } from '@/components/auth/auth-dialog';
import type { FeedbackSurveyData } from '@/lib/firebase-admin';

export default function FeedbackPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [perceivedValue, setPerceivedValue] = useState('');
  const [mostUseful, setMostUseful] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/');
      return;
    }

    if (!perceivedValue || !improvementSuggestion) {
      toast({
        title: 'Please complete all required fields',
        description: 'Your feedback is valuable, please fill out all parts of the survey.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('loading');
    
    const surveyData: FeedbackSurveyData = {
        perceivedValue,
        mostUseful,
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
     return <AuthDialog open={true} onOpenChange={() => router.push('/')} />;
  }
  
  if (status === 'success') {
    return (
        <Card>
            <CardHeader className="items-center text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Thank You for Your Feedback!</CardTitle>
                <CardDescription>Your insights are incredibly valuable and will help us make GammaRips even better.</CardDescription>
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
          Your answers will help us improve GammaRips. This will only take a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1 */}
          <div className="space-y-3">
            <Label className="font-semibold">So far, how valuable has GammaRips been to you?</Label>
            <RadioGroup value={perceivedValue} onValueChange={setPerceivedValue} required>
              <div className="flex items-center space-x-2"><RadioGroupItem value="very-valuable" id="q1-very" /><Label htmlFor="q1-very">Very valuable</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="somewhat-valuable" id="q1-somewhat" /><Label htmlFor="q1-somewhat">Somewhat valuable</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="not-very-valuable" id="q1-not-very" /><Label htmlFor="q1-not-very">Not very valuable</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="not-used-yet" id="q1-not-used" /><Label htmlFor="q1-not-used">I haven't had a chance to use it much yet</Label></div>
            </RadioGroup>
          </div>

          {/* Question 2 */}
          <div className="space-y-3">
            <Label htmlFor="q2-most-useful" className="font-semibold">What, if anything, have you found most useful about GammaRips so far?</Label>
            <Textarea
                id="q2-most-useful"
                value={mostUseful}
                onChange={(e) => setMostUseful(e.target.value)}
                placeholder="e.g., the daily emails, the AI analysis, the dashboard KPIs..."
            />
          </div>
          
          {/* Question 3 */}
          <div className="space-y-3">
            <Label htmlFor="q3-improvement" className="font-semibold">What is the #1 thing we could improve or add to make GammaRips more useful for you?</Label>
            <Textarea
                id="q3-improvement"
                value={improvementSuggestion}
                onChange={(e) => setImprovementSuggestion(e.target.value)}
                placeholder="e.g., a specific feature, data you wish we had, or something that feels confusing/slow."
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
