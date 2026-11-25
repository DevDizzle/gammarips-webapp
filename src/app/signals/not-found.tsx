import Link from 'next/link'

// Segment-level not-found boundary for /signals/[ticker].
//
// Without this file, notFound() thrown in the route bubbles past the sibling
// `error.tsx` to the ROOT not-found.tsx — and under the Firebase App Hosting
// Next adapter that path renders the not-found UI but loses the 404 status,
// returning HTTP 200 for unknown tickers (e.g. /signals/ZZZZ). A 200 keeps the
// unbounded /signals/:ticker crawl surface alive in Google's eyes. Resolving
// notFound() inside this segment emits a proper 404 (Next still auto-adds the
// noindex meta), which is the correct "don't index, don't crawl" signal.
export default function SignalNotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-headline">Ticker Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          We don&apos;t have a recent overnight scan record for that symbol. Only highly liquid US
          stocks enter the nightly pool.
        </p>
        <div className="flex flex-wrap gap-4 text-sm pt-2">
          <Link href="/signals" className="text-primary hover:underline font-medium">
            Browse Today&apos;s Daily Pool &rarr;
          </Link>
          <Link href="/signals/archive" className="text-muted-foreground hover:text-primary">
            Search Full Archive &rarr;
          </Link>
        </div>
      </main>
    </div>
  )
}
