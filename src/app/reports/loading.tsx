import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
           {Array.from({ length: 6 }).map((_, i) => (
             <div key={i} className="border rounded-xl p-6 space-y-4">
                 <Skeleton className="h-6 w-3/4" />
                 <Skeleton className="h-4 w-1/2" />
                 <div className="flex gap-2 pt-2">
                     <Skeleton className="h-5 w-12 rounded-full" />
                     <Skeleton className="h-5 w-12 rounded-full" />
                 </div>
             </div>
           ))}
        </div>
      </main>
    </div>
  );
}
