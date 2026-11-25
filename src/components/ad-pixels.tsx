'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { captureAttributionFromUrl } from '@/lib/attribution';

// Next inlines NEXT_PUBLIC_* vars only when referenced literally.
const META_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID || '').trim();
const REDDIT_PIXEL_ID = (process.env.NEXT_PUBLIC_REDDIT_PIXEL_ID || '').trim();

function isPrivateRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname.startsWith('/account') || pathname.startsWith('/auth');
}

export function AdPixels() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firstRunRef = useRef(true);

  useEffect(() => {
    // Always persist UTMs and click IDs (gclid, fbclid, rdt_cid, _fbp, _fbc)
    // across multi-page sessions even before Pixel IDs are configured.
    captureAttributionFromUrl();

    // Skip firing duplicate initial PageView (bootstrap script fires the first).
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }

    if (isPrivateRoute(pathname)) return;

    try {
      if (META_PIXEL_ID && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
    } catch {
      // Non-blocking
    }
    try {
      if (REDDIT_PIXEL_ID && typeof window.rdt === 'function') {
        window.rdt('track', 'PageVisit');
      }
    } catch {
      // Non-blocking
    }
  }, [pathname, searchParams]);

  if (isPrivateRoute(pathname)) return null;

  return (
    <>
      {META_PIXEL_ID ? (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      ) : null}

      {REDDIT_PIXEL_ID ? (
        <Script
          id="reddit-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
              rdt('init','${REDDIT_PIXEL_ID}');
              rdt('track','PageVisit');
            `,
          }}
        />
      ) : null}
    </>
  );
}
