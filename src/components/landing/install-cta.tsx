import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';
import { INSTALL_LINKS } from '@/lib/receipts';

// The one path on the homepage, in the order a buyer walks it: install
// GammaRips in your AI, then start the trial. The hero and the closing section
// both render this block, so the path reads the same at the top and the end.
// Install targets come from INSTALL_LINKS (src/lib/receipts.ts). The trial
// goes through /pricing, which owns the checkout.
export function InstallCta() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INSTALL_LINKS.map((l) => (
            <Button key={l.id} asChild variant="outline">
              <Link href={l.href}>Add to {l.label}</Link>
            </Button>
          ))}
        </div>
      </div>

      <Button asChild size="lg" className="w-full sm:w-auto">
        <Link href="/pricing">
          Start your {TRIAL_DAYS}-day free trial <ArrowRight />
        </Link>
      </Button>

      <p className="text-xs text-muted-foreground">
        Then {PRICE_MONTHLY}/mo, the founding price. Cancel anytime. The
        website stays free.
      </p>
    </div>
  );
}
