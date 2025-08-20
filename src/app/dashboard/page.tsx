
import DashboardClientPage from './dashboard-client-page';

export default function DashboardPage() {
  // Pass an empty array for initialStocks.
  // The client component will now be responsible for fetching the stocks.
  return <DashboardClientPage initialStocks={[]} />;
}
