
// src/lib/gtag.ts

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, params: { [key: string]: any }) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const GA_MEASUREMENT_ID =
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ZF0DQVQEKJ';
    window.gtag('event', action, {
      ...params,
      send_to: GA_MEASUREMENT_ID, 
    });
  } else {
    console.warn('[GTAG] gtag function not available; event not sent.');
  }
};
