
import { getPublicDashboardData } from './actions';
import { IndicesTicker } from '@/components/dashboard/indices-ticker';
import { PublicWinnersTable } from '@/components/dashboard/public-winners-table';
import { PerformanceMovers } from '@/components/dashboard/performance-movers';
import { NewsFeedWidget } from '@/components/dashboard/news-feed';
import { WatchlistWidget } from '@/components/dashboard/watchlist-widget';

export const metadata = {
  title: 'Market Dashboard | GammaRips',
  description: 'Live options flow, market movers, and AI-powered stock analysis. Track the smart money.',
};

export default async function DashboardPage() {
  const dashboardData = await getPublicDashboardData();

  return (
    <div className="container mx-auto p-4 space-y-4 md:space-y-6 max-w-7xl">
      {/* Top Bar: Indices Ticker */}
      <section>
        <IndicesTicker />
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column: 66% */}
        <div className="lg:col-span-2 space-y-6">
           <PublicWinnersTable data={dashboardData} />
           
           {/* Top Gainers & Losers */}
           <PerformanceMovers 
              gainers={dashboardData.gainers.items} 
              losers={dashboardData.losers.items} 
           />
        </div>

        {/* Sidebar Column: 33% */}
        <div className="lg:col-span-1 space-y-6">
            
            {/* Watchlist Widget (Personalized/Gated) */}
            {/* <div className="h-[300px]">
                <WatchlistWidget />
            </div> */}

            {/* News Feed (Contextual) */}
            <div className="h-[500px]">
                <NewsFeedWidget />
            </div>

        </div>
      </div>
    </div>
  );
}
