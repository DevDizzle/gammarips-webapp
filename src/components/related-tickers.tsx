import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Simple sector map for common tickers (Mock data for SEO internal linking)
const SECTOR_MAP: Record<string, { sector: string; peers: string[] }> = {
  // Tech
  AAPL: { sector: 'Technology', peers: ['MSFT', 'GOOGL', 'NVDA', 'AMD'] },
  MSFT: { sector: 'Technology', peers: ['AAPL', 'GOOGL', 'AMZN', 'ORCL'] },
  GOOGL: { sector: 'Technology', peers: ['META', 'AMZN', 'MSFT', 'AAPL'] },
  NVDA: { sector: 'Semiconductors', peers: ['AMD', 'INTC', 'TSM', 'MU'] },
  AMD: { sector: 'Semiconductors', peers: ['NVDA', 'INTC', 'TSM', 'MU'] },
  TSLA: { sector: 'Auto/Tech', peers: ['RIVN', 'F', 'GM', 'NIO'] },
  // Finance
  JPM: { sector: 'Finance', peers: ['BAC', 'WFC', 'C', 'GS'] },
  BAC: { sector: 'Finance', peers: ['JPM', 'WFC', 'C', 'MS'] },
  // Retail
  AMZN: { sector: 'Consumer Discretionary', peers: ['WMT', 'TGT', 'COST', 'BABA'] },
  WMT: { sector: 'Consumer Staples', peers: ['TGT', 'COST', 'DG', 'KR'] },
};

const DEFAULT_PEERS = ['SPY', 'QQQ', 'IWM', 'DIA'];

export function RelatedTickers({ ticker }: { ticker: string }) {
  const t = ticker.toUpperCase();
  const data = SECTOR_MAP[t];
  
  const peers = data ? data.peers : DEFAULT_PEERS;
  const sector = data ? data.sector : 'General Market';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Related {sector} Stocks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {peers.map((peer) => (
            <Link key={peer} href={`/${peer}`}>
              <Badge variant="secondary" className="hover:bg-primary/20 transition-colors px-3 py-1 text-sm cursor-pointer">
                ${peer}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
