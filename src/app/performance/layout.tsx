import { UserNav } from "@/components/auth/user-nav";
import Link from "next/link";
import { AuthProvider } from "@/hooks/use-auth";

export default function PerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <div className="flex flex-col min-h-screen">
        <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold font-headline">
                <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
            </Link>
            <UserNav />
            </div>
        </header>
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-6xl mx-auto">
            {children}
            </div>
        </main>
        </div>
    </AuthProvider>
  );
}
