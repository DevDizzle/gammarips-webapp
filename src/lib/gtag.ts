// src/lib/gtag.ts

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, params: { [key: string]: any }) => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window.gtag !== 'function' || !GA_MEASUREMENT_ID) {
    return;
  }
  window.gtag('event', action, params);
};
