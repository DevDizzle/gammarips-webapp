
'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { handleWinSubmission } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, CheckCircle, AlertTriangle, Trophy } from 'lucide-react';
import Image from 'next/image';

type SubmissionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SubmissionDialog({ open, onOpenChange }: SubmissionDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tickers, setTickers] = useState('');
  const [percentGain, setPercentGain] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

  const handleClose = (isOpen: boolean) => {
    if (status !== 'loading') {
      onOpenChange(isOpen);
      if (!isOpen) {
        setTimeout(resetForm, 300);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !screenshot || !tickers || !percentGain) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all fields and upload a screenshot.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('loading');

    const formData = new FormData();
    formData.append('uid', user.uid);
    formData.append('screenshot', screenshot);
    formData.append('tickers', tickers);
    formData.append('percentGain', percentGain);

    const result = await handleWinSubmission(formData);

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      toast({
        title: 'Submission Failed',
        description: result.error || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center">
            <Trophy className="h-10 w-10 text-yellow-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-headline">Share Your Win!</DialogTitle>
          <DialogDescription className="text-center">
            Get featured in the Winner's Circle by sharing your success with the community.
          </DialogDescription>
        </DialogHeader>
        
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-semibold">Submission Received!</h3>
            <p className="text-muted-foreground">
              Thank you! Our team will review your win. If approved, it will be featured in the Winner's Circle.
            </p>
            <Button onClick={() => handleClose(false)}>Close</Button>
          </div>
        ) : (
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

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit My Win
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

