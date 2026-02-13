'use server';

import { getLatestOvernightSummary, getOvernightSignals, getAllOvernightSummaries, type OvernightSummary, type OvernightSignal } from '@/lib/firebase-admin';

export interface LandingPageData {
  summary: OvernightSummary | null;
  bullSignals: OvernightSignal[];
  bearSignals: OvernightSignal[];
  recentReports: OvernightSummary[];
}

export async function getLandingPageData(): Promise<LandingPageData> {
  const summary = await getLatestOvernightSummary();
  const scanDate = summary?.scan_date || new Date().toISOString().split('T')[0];

  const [bullSignals, bearSignals, recentReports] = await Promise.all([
    getOvernightSignals(scanDate, 'bull', 6, 10),
    getOvernightSignals(scanDate, 'bear', 6, 10),
    getAllOvernightSummaries(5)
  ]);

  return { summary, bullSignals, bearSignals, recentReports };
}
