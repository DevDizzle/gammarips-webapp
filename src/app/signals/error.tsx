'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="flex items-center space-x-2 text-destructive">
        <AlertCircle className="h-6 w-6" />
        <h2 className="text-xl font-bold">Something went wrong!</h2>
      </div>
      <p className="text-muted-foreground">
        We couldn&apos;t load the signals. This might be a temporary issue.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
