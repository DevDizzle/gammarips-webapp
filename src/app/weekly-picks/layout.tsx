import { PublicHeader } from "@/components/layout/public-header";

export default function WeeklyPicksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}
