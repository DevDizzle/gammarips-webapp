
// src/lib/gtag.ts

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, params: { [key: string]: any }) => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window.gtag !== 'function' || !GA_MEASUREMENT_ID) {
    console.warn('[GTAG] gtag function not found or Measurement ID is missing. Event not sent.');
    return;
  }
  console.log(`[GTAG Event] Action: ${action}, Params:`, params);
  window.gtag('event', action, params);
};
