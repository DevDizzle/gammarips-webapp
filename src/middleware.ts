import { NextResponse, type NextRequest } from 'next/server';

/**
 * One casing, one URL for /signals/:ticker.
 *
 * The uppercase-canonical fix (836e8c13) cleared 45 "Duplicate without
 * user-selected canonical" pages in GSC, but its second half never ran: the
 * `permanentRedirect()` in the page component does not produce a 308 in
 * production. Next streams the head from `generateMetadata` before the
 * component throws NEXT_REDIRECT, so the 200 is already committed and
 * /signals/aapl renders instead of redirecting. The legacy redirects in
 * next.config.ts (/:ticker, /stocks/:ticker) preserve casing, so every legacy
 * inbound link terminated on a non-canonical 200 and consolidation rested
 * entirely on a canonical *hint* Google is free to ignore.
 *
 * Middleware runs before routing and before any render, so the 308 is real.
 * The component-level check stays as a fallback.
 */

/** Real pages under /signals — never uppercase these into the [ticker] route. */
const RESERVED_SEGMENTS = new Set(['archive']);

export function middleware(req: NextRequest) {
  const segment = req.nextUrl.pathname.slice('/signals/'.length);

  if (!segment || RESERVED_SEGMENTS.has(segment)) return NextResponse.next();
  if (segment === segment.toUpperCase()) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/signals/${segment.toUpperCase()}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // Exactly one segment after /signals — leaves /signals itself and any
  // deeper path untouched.
  matcher: '/signals/:segment',
};
