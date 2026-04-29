'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { subscribeEmail } from '@/app/email-actions';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmailCapture({ variant = 'default' }: { variant?: 'default' | 'minimal' }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const result = await subscribeEmail(email);
      if (result.success) {
        setIsSuccess(true);
        toast({
            title: "Welcome aboard!",
            description: "Check your inbox for your first update.",
        });
      } else {
        toast({
            title: "Something went wrong",
            description: result.error || "Please try again later.",
            variant: "destructive",
        });
      }
    } catch (error) {
       toast({
            title: "Error",
            description: "Failed to subscribe. Please try again.",
            variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-zinc-900/50 border border-green-900/30 rounded-lg">
        <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
        <h3 className="text-lg font-medium text-green-400">Welcome Aboard</h3>
        <p className="text-sm text-zinc-400 mt-1">Check your inbox for your first update.</p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/50 p-6 sm:p-8 ${variant === 'minimal' ? 'py-4 px-4' : ''}`}>
      <div className="flex flex-col items-center text-center">
        {!isSuccess && (
            <>
                {variant !== 'default' ? null : (
                    <>
                        <div className="mb-4 rounded-full bg-blue-500/10 p-3">
                            <Mail className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-white">
                          One email a week. Catch up in five minutes.
                        </h3>
                        <p className="mb-6 max-w-md text-sm text-zinc-400">
                          The GammaRips weekly briefing — engine state, the latest deep-dive, and the picks on the public ledger. No firehose, no FOMO.
                        </p>
                    </>
                )}

                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500/20"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-500 text-white font-medium whitespace-nowrap"
                        disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join Free'}
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Free weekly newsletter. No spam. Unsubscribe anytime.
                  </p>
                </form>
            </>
        )}
      </div>
    </div>
  );
}
