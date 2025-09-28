
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { handleWinSubmission } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthDialog } from '@/components/auth/auth-dialog';

export function SubmissionForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tickers, setTickers] = useState('');
  const [percentGain, setPercentGain] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File Too Large',
          description: 'Please upload an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setScreenshot(null);
    setPreview(null);
    setTickers('');
    setPercentGain('');
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        setIsAuthDialogOpen(true);
        return;
    }
    
    if (!screenshot || !tickers || !percentGain) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields and upload a screenshot.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('loading');

    const formData = new FormData();
    formData.append('screenshot', screenshot);
    formData.append('tickers', tickers);
    formData.append('percentGain', percentGain);

    const result = await handleWinSubmission(user.uid, formData);

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      toast({
        title: 'Submission Failed',
        description: result.error || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setStatus('idle');
    }
  };

  if (!user) {
    return (
        <>
            <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
            <Card>
                <CardHeader>
                    <CardTitle>Share Your Win!</CardTitle>
                    <CardDescription>Get featured in the Winner's Circle by sharing your success with the community.</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">Please sign in or create an account to share your win.</p>
                    <Button onClick={() => setIsAuthDialogOpen(true)}>Sign In to Share</Button>
                </CardContent>
            </Card>
        </>
    );
  }

  if (status === 'success') {
      return (
         <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-xl font-semibold">Submission Received!</h3>
                <p className="text-muted-foreground">
                Thank you! Our team will review your win. If approved, it will be featured here in the Winner's Circle.
                </p>
                <Button onClick={resetForm} variant="outline">Submit Another Win</Button>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Share Your Win!</CardTitle>
            <CardDescription>Get featured in the Winner's Circle by sharing your success with the community.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="screenshot">Screenshot of Your Win</Label>
                    <div
                        className="mt-2 flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer hover:border-primary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {preview ? (
                        <Image src={preview} alt="Screenshot preview" width={200} height={128} className="object-contain h-full" />
                        ) : (
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                        </div>
                        )}
                    </div>
                    <Input
                        id="screenshot-input"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tickers">Ticker(s)</Label>
                        <Input
                            id="tickers"
                            value={tickers}
                            onChange={(e) => setTickers(e.target.value.toUpperCase())}
                            placeholder="e.g., NVDA, MSFT"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="percent-gain">Percent Gain (%)</Label>
                        <Input
                            id="percent-gain"
                            type="number"
                            step="0.01"
                            value={percentGain}
                            onChange={(e) => setPercentGain(e.target.value)}
                            placeholder="e.g., 210.5"
                            required
                            disabled={status === 'loading'}
                        />
                    </div>
                </div>

                <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-md">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                        By submitting, you agree to let us feature your screenshot on our site and social media. Please ensure no personal information is visible.
                    </p>
                </div>

                <Button type="submit" className="w-full" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Submit My Win
                </Button>
            </form>
        </CardContent>
    </Card>
  );
}
