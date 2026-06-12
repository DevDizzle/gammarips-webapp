import Link from 'next/link'

// Segment-level not-found boundary for /reports/[date].
//
// Same fix as signals/not-found.tsx: without it, notFound() for an unknown
// report date bubbles past this segment's `error.tsx` to the root not-found
// and returns HTTP 200 under the App Hosting Next adapter (e.g.
// /reports/1999-01-01). Resolving it here emits a proper 404 + auto noindex.
export default function ReportNotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Report Not Found</h2>
        <p className="text-muted-foreground mb-8">
          We don&apos;t have an overnight report for that date.
        </p>
        <Link href="/reports" className="text-primary hover:underline">
          Browse recent reports
        </Link>
      </main>
    </div>
  )
}
