'use client';

import { usePathname } from 'next/navigation';
import { EmailCapture } from '@/components/email-capture';

const SUPPRESSED_PREFIXES = ['/pricing', '/oauth', '/account', '/auth'];

export default function EmailCaptureSection() {
  const pathname = usePathname();
  if (pathname && SUPPRESSED_PREFIXES.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return (
    <section className="relative border-t border-zinc-900 bg-zinc-950/40 py-14 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <EmailCapture variant="default" />
      </div>
    </section>
  );
}
