import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PRICE_ANNUAL, PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';
import { INSTALL_LINKS } from '@/lib/receipts';
import { ProAwareCta } from '@/components/account/agent-quick-connect';

export function InstallCta({ showClientLinks = true }: { showClientLinks?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <ProAwareCta
          size="lg"
          freeLabel={`Start ${TRIAL_DAYS}-Day Free Trial`}
          className="w-full sm:w-auto font-semibold"
        />
        <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
          <Link href="/signals">Browse Free 3-Setup Preview</Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {TRIAL_DAYS}-day free trial, then {PRICE_MONTHLY}/mo or {PRICE_ANNUAL}/yr founding price. Cancel anytime.
      </p>

      {showClientLinks && (
        <div className="w-full max-w-xl pt-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Works natively with
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {INSTALL_LINKS.map((l) => (
              <Button key={l.id} asChild variant="outline" size="sm">
                <Link href={l.href}>Add to {l.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
