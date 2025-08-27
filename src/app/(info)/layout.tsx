
import { UserNav } from "@/components/auth/user-nav";
import Link from "next/link";

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold font-headline text-primary">
            ProfitScout
          </Link>
          <UserNav />
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="prose prose-invert max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
