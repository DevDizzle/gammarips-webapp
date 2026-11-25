'use client';

import { event as gtagEvent } from '@/lib/gtag';

const STORAGE_KEY = 'gammarips_attribution_v1';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const PARAM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'rdt_cid',
] as const;

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  rdt_cid?: string;
  fbc?: string;
  fbp?: string;
  landing_path?: string;
  referrer?: string;
  captured_at?: number;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    rdt?: (...args: unknown[]) => void;
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getStoredAttribution(): AttributionData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AttributionData;
    if (parsed.captured_at && Date.now() - parsed.captured_at > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    // Always refresh live Meta cookies (_fbc / _fbp) if the pixel has set them.
    const fbp = readCookie('_fbp');
    const fbc = readCookie('_fbc');
    if (fbp) parsed.fbp = fbp;
    if (fbc) parsed.fbc = fbc;
    return parsed;
  } catch {
    return {};
  }
}

/**
 * Captures UTM parameters, ad click IDs (gclid, fbclid, rdt_cid), and Meta
 * browser cookies (_fbp, _fbc) into 30-day localStorage so multi-page visits
 * (e.g., landing on /xtrader and converting later on /build or /pricing) retain
 * full source attribution.
 */
export function captureAttributionFromUrl(): AttributionData {
  if (typeof window === 'undefined') return {};
  const existing = getStoredAttribution();
  const params = new URLSearchParams(window.location.search);
  const next: AttributionData = { ...existing };
  let touched = false;

  for (const key of PARAM_KEYS) {
    const val = params.get(key)?.trim();
    if (val) {
      next[key] = val.slice(0, 200);
      touched = true;
    }
  }

  // Synthesize Meta _fbc format (`fb.1.<ms>.<fbclid>`) when fbclid is present
  // even before the Meta Pixel script is active.
  const urlFbclid = params.get('fbclid')?.trim();
  const cookieFbc = readCookie('_fbc');
  const cookieFbp = readCookie('_fbp');
  if (cookieFbc) {
    next.fbc = cookieFbc.slice(0, 200);
    touched = true;
  } else if (urlFbclid) {
    next.fbc = `fb.1.${Date.now()}.${urlFbclid}`.slice(0, 200);
    touched = true;
  }
  if (cookieFbp) {
    next.fbp = cookieFbp.slice(0, 200);
    touched = true;
  }

  if (!next.landing_path) {
    next.landing_path = window.location.pathname.slice(0, 200);
    touched = true;
  }
  if (!next.referrer && document.referrer) {
    try {
      const refHost = new URL(document.referrer).hostname;
      if (refHost && !refHost.endsWith('gammarips.com')) {
        next.referrer = document.referrer.slice(0, 200);
        touched = true;
      }
    } catch {
      // Ignore malformed referrer
    }
  }

  if (touched) {
    next.captured_at = Date.now();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage quota or private browsing — fail silently
    }
  }

  return next;
}

/**
 * Returns a flat string-only record safe for Stripe metadata or Firestore.
 */
export function getAttributionPayload(): Record<string, string> {
  const data = getStoredAttribution();
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string' && val.trim().length > 0) {
      out[key] = val.trim().slice(0, 200);
    }
  }
  return out;
}

export function generateEventId(prefix = 'gr'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Fires unified Lead conversion across GA4 + env-gated Meta & Reddit pixels
 * using a shared `eventId` for server-side CAPI deduplication.
 */
export function trackLeadConversion(params: {
  eventId: string;
  leadType: string;
  value?: number;
  currency?: string;
}) {
  const currency = params.currency || 'USD';
  const value = params.value ?? 0;

  gtagEvent('generate_lead', {
    currency,
    value,
    lead_type: params.leadType,
    event_id: params.eventId,
  });

  if (typeof window !== 'undefined') {
    try {
      if (typeof window.fbq === 'function') {
        window.fbq(
          'track',
          'Lead',
          { value, currency, content_name: params.leadType },
          { eventID: params.eventId }
        );
      }
    } catch {
      // Non-blocking
    }
    try {
      if (typeof window.rdt === 'function') {
        window.rdt('track', 'Lead', {
          conversionId: params.eventId,
          value,
          currency,
        });
      }
    } catch {
      // Non-blocking
    }
  }
}

/**
 * Fires unified InitiateCheckout across GA4 + env-gated Meta & Reddit pixels.
 */
export function trackBeginCheckoutConversion(params: {
  eventId: string;
  plan: string;
  value: number;
  currency?: string;
  extra?: Record<string, unknown>;
}) {
  const currency = params.currency || 'USD';

  gtagEvent('begin_checkout', {
    currency,
    value: params.value,
    plan: params.plan,
    event_id: params.eventId,
    ...(params.extra || {}),
  });

  if (typeof window !== 'undefined') {
    try {
      if (typeof window.fbq === 'function') {
        window.fbq(
          'track',
          'InitiateCheckout',
          { value: params.value, currency, content_name: params.plan },
          { eventID: params.eventId }
        );
      }
    } catch {
      // Non-blocking
    }
    try {
      if (typeof window.rdt === 'function') {
        window.rdt('track', 'AddToCart', {
          conversionId: params.eventId,
          value: params.value,
          currency,
        });
      }
    } catch {
      // Non-blocking
    }
  }
}
