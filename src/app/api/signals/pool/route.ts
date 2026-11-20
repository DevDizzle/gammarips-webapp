import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import {
  getAdminApp,
  getOrCreateUserAdmin,
  isUserMcpEntitledAdmin,
  getLatestOvernightSummary,
  getOvernightSignals,
} from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decoded = await getAuth(getAdminApp()).verifyIdToken(token);
    const user = await getOrCreateUserAdmin(decoded.uid);

    if (!isUserMcpEntitledAdmin(user)) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const reqDate = req.nextUrl.searchParams.get('date');
    let queryDate = reqDate;
    if (!queryDate) {
      const summary = await getLatestOvernightSummary();
      queryDate =
        summary?.scan_date ||
        summary?.report_date ||
        new Date().toISOString().split('T')[0];
    }

    const signals = await getOvernightSignals(queryDate, 'bull', 0, 100);
    return NextResponse.json({ scanDate: queryDate, count: signals.length, signals });
  } catch (err: any) {
    console.error('Error fetching Pro signals pool:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to load full pool' },
      { status: 500 }
    );
  }
}
