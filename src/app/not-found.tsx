import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[70vh] bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
        <p className="text-xs font-mono uppercase tracking-widest text-primary">404</p>
        <h1 className="text-3xl sm:text-4xl font-bold font-headline">Page not found</h1>
        <p className="text-muted-foreground max-w-md">
          The page you asked for moved or doesn&apos;t exist. Jump into one of our live surfaces
          below.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signals">Daily Pool Preview</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">Pricing</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/build">Custom Agent Build</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
