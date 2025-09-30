// src/lib/gtag.ts

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (action: string, { event_category, event_label, value }: { event_category?: string; event_label?: string; value?: number; }) => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (typeof window.gtag !== 'function' || !GA_MEASUREMENT_ID) {
    return;
  }
  window.gtag('event', action, {
    event_category,
    event_label,
    value,
  });
};
