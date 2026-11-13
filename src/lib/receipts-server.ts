// Server only: imports firebase-admin. Client components import src/lib/receipts.ts.
import { unstable_cache } from 'next/cache';
import { getAdminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import {
  FALLBACK_RECEIPTS,
  dateRange,
  liveRecordFrom,
  type LiveTrade,
  type Receipts,
} from '@/lib/receipts';

// The daily numbers (owner call 2026-10-02). Two Firestore docs:
//   site_stats/pool         engine job site-stats-refresh, 18:00 ET weekdays
//   site_stats/live_record  gammarips-trader publish_record.py, 17:40 ET weekdays
// Each section falls back to the static snapshot in receipts.ts on its own, so
// one bad doc never blanks a page. Cached for an hour across requests.

const num = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const str = (x: unknown): x is string => typeof x === 'string' && x.length > 0;
const etDate = (iso: unknown) =>
  str(iso)
    ? new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
    : null;

function parseTrades(raw: unknown): LiveTrade[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: LiveTrade[] = [];
  for (const t of raw) {
    if (!t || !str(t.entryDay) || !str(t.ticker) || !str(t.contract)) return null;
    if (!num(t.entry) || !num(t.exit) || !num(t.pnlPct) || !num(t.pnlUsd)) return null;
    out.push({
      entryDay: t.entryDay,
      exitDay: str(t.exitDay) ? t.exitDay : t.entryDay,
      ticker: t.ticker,
      contract: t.contract,
      entry: t.entry,
      exit: t.exit,
      pnlPct: t.pnlPct,
      pnlUsd: t.pnlUsd,
      exitReason: ['target', 'stop', 'end of hold'].includes(t.exitReason) ? t.exitReason : 'other',
    });
  }
  return out.sort((a, b) => a.entryDay.localeCompare(b.entryDay));
}

async function load(): Promise<Receipts> {
  const r: Receipts = { ...FALLBACK_RECEIPTS };
  let db;
  try {
    db = getFirestore(getAdminApp());
  } catch (error) {
    console.error('receipts: Firestore unavailable, using the snapshot', error);
    return r;
  }

  try {
    const snap = await db.collection('site_stats').doc('live_record').get();
    const d = snap.exists ? snap.data() : null;
    const trades = parseTrades(d?.trades);
    if (trades) {
      r.LIVE_TRADES = trades;
      r.LIVE_RECORD = liveRecordFrom(trades, etDate(d?.computed_at) ?? trades[trades.length - 1].entryDay);
    }
  } catch (error) {
    console.error('receipts: live_record read failed, using the snapshot', error);
  }

  try {
    const snap = await db.collection('site_stats').doc('pool').get();
    const d = snap.exists ? snap.data() : null;
    const w = d?.window_3d;
    if (w && num(w.n) && w.n > 0 && num(w.hit50) && num(w.hit25) && num(w.hit100) && str(w.from) && str(w.to)) {
      r.POOL_HIT_RATES = {
        ...FALLBACK_RECEIPTS.POOL_HIT_RATES,
        n: w.n,
        scanDays: num(w.scan_days) ? w.scan_days : FALLBACK_RECEIPTS.POOL_HIT_RATES.scanDays,
        windowLabel: `scan dates ${dateRange(w.from, w.to)}`,
        hit10: num(w.hit10) ? w.hit10 : FALLBACK_RECEIPTS.POOL_HIT_RATES.hit10,
        hit20: num(w.hit20) ? w.hit20 : FALLBACK_RECEIPTS.POOL_HIT_RATES.hit20,
        hit25: w.hit25,
        hit50: w.hit50,
        hit100: w.hit100,
        medianPeak: num(w.median_peak) ? w.median_peak : FALLBACK_RECEIPTS.POOL_HIT_RATES.medianPeak,
        stopTouch30: num(w.stop_touch30) ? w.stop_touch30 : FALLBACK_RECEIPTS.POOL_HIT_RATES.stopTouch30,
      };
    }
    const x = d?.to_expiry;
    if (x && num(x.n) && x.n > 0 && num(x.hit20) && num(x.hit50) && num(x.hit100) && str(x.from) && str(x.to)) {
      r.TO_EXPIRY = {
        ...FALLBACK_RECEIPTS.TO_EXPIRY,
        n: x.n,
        windowLabel: `expired pool contracts, scan dates ${dateRange(x.from, x.to)}`,
        hit10: num(x.hit10) ? x.hit10 : FALLBACK_RECEIPTS.TO_EXPIRY.hit10,
        hit20: x.hit20,
        hit25: num(x.hit25) ? x.hit25 : FALLBACK_RECEIPTS.TO_EXPIRY.hit25,
        hit50: x.hit50,
        hit100: x.hit100,
      };
    }
    const q = d?.quality;
    if (q && num(q.median_oi?.after) && num(q.median_oi?.before) && num(q.median_volume?.after) &&
        num(q.median_volume?.before) && num(q.p10_oi?.after) && num(q.p10_oi?.before) &&
        num(q.n_after) && num(q.n_before) && str(q.after_from) && str(q.after_to)) {
      r.CONTRACT_QUALITY = {
        ...FALLBACK_RECEIPTS.CONTRACT_QUALITY,
        medianOi: { after: q.median_oi.after, before: q.median_oi.before },
        medianVolume: { after: q.median_volume.after, before: q.median_volume.before },
        p10Oi: { after: q.p10_oi.after, before: q.p10_oi.before },
        nAfter: q.n_after,
        nBefore: q.n_before,
        afterLabel: `pool contracts ${dateRange(q.after_from, q.after_to)}`,
      };
    }
  } catch (error) {
    console.error('receipts: pool read failed, using the snapshot', error);
  }
  return r;
}

export const getReceipts = unstable_cache(load, ['site-receipts-v1'], { revalidate: 3600 });
