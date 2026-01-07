
import { getPublicDashboardData } from './actions';
import { IndicesTicker } from '@/components/dashboard/indices-ticker';
import { PublicWinnersTable } from '@/components/dashboard/public-winners-table';
import { NewsFeedWidget } from '@/components/dashboard/news-feed';
import { WatchlistWidget } from '@/components/dashboard/watchlist-widget';
import { DashboardUsageTracker } from '@/components/dashboard/dashboard-usage-tracker';
import EconomicEventsWidget from './economic-events-widget';

export const metadata = {
  title: 'Market Dashboard | GammaRips',
  description: 'Live options flow, market movers, and AI-powered stock analysis. Track the smart money.',
};

export default async function DashboardPage() {
  const dashboardData = await getPublicDashboardData();

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-5xl">
      <DashboardUsageTracker />
      {/* Top Bar: Indices Ticker */}
      <section>
        <IndicesTicker />
      </section>

      {/* Main content stack */}
      <div className="space-y-6">
        <PublicWinnersTable data={dashboardData} />
        <NewsFeedWidget />
        <EconomicEventsWidget />
        {/* <WatchlistWidget /> */}
      </div>
    </div>
  );
}
