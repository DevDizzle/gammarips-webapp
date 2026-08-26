import Link from 'next/link'
import { PublicHeader } from '@/components/layout/public-header'
import Footer from '@/components/layout/footer'

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Not Found</h2>
        <p className="text-muted-foreground mb-8">Could not find requested resource</p>
        <Link href="/" className="text-primary hover:underline">
          Return Home
        </Link>
      </main>
    </div>
  )
}
