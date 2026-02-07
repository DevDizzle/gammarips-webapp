import { PublicHeader } from "@/components/layout/public-header";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
