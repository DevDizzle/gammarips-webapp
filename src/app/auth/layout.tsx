
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline">
            <span className="text-foreground">Profit</span><span className="text-primary">Scout</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
