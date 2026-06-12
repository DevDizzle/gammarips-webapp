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
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Signal Not Found</h2>
        <p className="text-muted-foreground mb-8">
          We don&apos;t have an options-flow signal for that ticker.
        </p>
        <Link href="/signals" className="text-primary hover:underline">
          Browse recent signals
        </Link>
      </main>
    </div>
  )
}
