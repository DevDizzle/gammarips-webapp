
// src/lib/gtag.ts

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, params: { [key: string]: any }) => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!GA_MEASUREMENT_ID) {
    console.warn('[GTAG] Measurement ID is missing. Event not sent.');
    return;
  }
  
  // This is the robust way to send events, even if gtag.js hasn't loaded yet.
  // It pushes to a dataLayer array that gtag.js will process upon initialization.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push('event', action, params);
};
