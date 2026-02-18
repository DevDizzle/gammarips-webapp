'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2 text-destructive">
            <AlertCircle className="h-6 w-6" />
            <h2 className="text-xl font-bold">Something went wrong!</h2>
          </div>
          <p className="text-muted-foreground">
            A critical error occurred. Please try refreshing the page.
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
