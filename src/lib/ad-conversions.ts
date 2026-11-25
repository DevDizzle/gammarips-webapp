import crypto from 'crypto';

export type AdConversionEventName =
  | 'Lead'
  | 'StartTrial'
  | 'Subscribe'
  | 'Purchase';

export interface ServerConversionPayload {
  eventName: AdConversionEventName;
  eventId: string;
  eventSourceUrl?: string;
  email?: string;
  value?: number;
  currency?: string;
  contentName?: string;
  fbc?: string;
  fbp?: string;
  rdtCid?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
}

function sha256Normalized(value: string): string {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex');
}

function mapRedditEventName(name: AdConversionEventName): string {
  switch (name) {
    case 'Lead':
      return 'Lead';
    case 'StartTrial':
      return 'SignUp';
    case 'Subscribe':
    case 'Purchase':
      return 'Purchase';
  }
}

/**
 * Sends a server-side conversion event to Meta Conversions API (Graph API v21).
 * Gracefully no-ops when META_PIXEL_ID / META_CAPI_TOKEN are unset.
 */
async function sendMetaCapiEvent(payload: ServerConversionPayload): Promise<void> {
  const pixelId = (
    process.env.META_PIXEL_ID ||
    process.env.NEXT_PUBLIC_META_PIXEL_ID ||
    ''
  ).trim();
  const accessToken = (process.env.META_CAPI_TOKEN || '').trim();
  if (!pixelId || !accessToken) return;

  const userData: Record<string, unknown> = {};
  if (payload.email) userData.em = [sha256Normalized(payload.email)];
  if (payload.fbc) userData.fbc = payload.fbc;
  if (payload.fbp) userData.fbp = payload.fbp;
  if (payload.clientIpAddress) userData.client_ip_address = payload.clientIpAddress;
  if (payload.clientUserAgent) userData.client_user_agent = payload.clientUserAgent;

  const customData: Record<string, unknown> = {
    currency: (payload.currency || 'USD').toUpperCase(),
  };
  if (typeof payload.value === 'number') customData.value = payload.value;
  if (payload.contentName) customData.content_name = payload.contentName;

  const body = {
    data: [
      {
        event_name: payload.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: payload.eventId,
        action_source: 'website',
        event_source_url: payload.eventSourceUrl || 'https://gammarips.com',
        user_data: userData,
        custom_data: customData,
      },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`Meta CAPI ${payload.eventName} failed (${res.status}): ${text}`);
    }
  } catch (err) {
    console.error(`Meta CAPI ${payload.eventName} error:`, err);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sends a server-side conversion event to Reddit Conversions API (v2.0).
 * Gracefully no-ops when REDDIT_PIXEL_ID / REDDIT_CAPI_TOKEN are unset.
 */
async function sendRedditCapiEvent(payload: ServerConversionPayload): Promise<void> {
  const pixelAccountId = (
    process.env.REDDIT_PIXEL_ID ||
    process.env.REDDIT_AD_ACCOUNT_ID ||
    process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID ||
    ''
  ).trim();
  const accessToken = (process.env.REDDIT_CAPI_TOKEN || '').trim();
  if (!pixelAccountId || !accessToken) return;

  const userObj: Record<string, unknown> = {};
  if (payload.email) userObj.email = sha256Normalized(payload.email);
  if (payload.clientIpAddress) userObj.ip_address = payload.clientIpAddress;
  if (payload.clientUserAgent) userObj.user_agent = payload.clientUserAgent;

  const eventMetadata: Record<string, unknown> = {
    conversion_id: payload.eventId,
    currency: (payload.currency || 'USD').toUpperCase(),
  };
  if (typeof payload.value === 'number') {
    eventMetadata.value_decimal = payload.value;
  }

  const eventObj: Record<string, unknown> = {
    event_at: new Date().toISOString(),
    event_type: {
      tracking_type: mapRedditEventName(payload.eventName),
    },
    event_metadata: eventMetadata,
    user: userObj,
  };
  if (payload.rdtCid) {
    eventObj.click_id = payload.rdtCid;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch(
      `https://ads-api.reddit.com/api/v2.0/conversions/events/${encodeURIComponent(pixelAccountId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ events: [eventObj] }),
        signal: controller.signal,
      }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error(`Reddit CAPI ${payload.eventName} failed (${res.status}): ${text}`);
    }
  } catch (err) {
    console.error(`Reddit CAPI ${payload.eventName} error:`, err);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fan-out helper to dispatch server-side ad conversions in parallel.
 * Never throws; safe to await inside webhooks and API routes.
 */
export async function sendServerAdConversions(
  payload: ServerConversionPayload
): Promise<void> {
  await Promise.allSettled([
    sendMetaCapiEvent(payload),
    sendRedditCapiEvent(payload),
  ]);
}
