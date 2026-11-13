import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MCP_PRO_ENDPOINT, PRICE_MONTHLY, TRIAL_DAYS } from '@/lib/constants';
import { INSTALL_LINKS } from '@/lib/receipts';

// Primary CTA hierarchy: subscription first ("Get Pro MCP Access" -> /pricing),
// with client setup links ("Add to Claude", "ChatGPT", "Cursor", "Codex")
// secondary below it so visitors aren't diverted away from subscribing.
export function InstallCta() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button asChild size="lg" className="w-full sm:w-auto font-semibold">
        <Link href="/pricing">
          Get Pro MCP Access <ArrowRight />
        </Link>
      </Button>

      <p className="text-xs text-muted-foreground">
        Start your {TRIAL_DAYS}-day free trial, then {PRICE_MONTHLY}/mo founding
        price ({MCP_PRO_ENDPOINT.replace('https://', '')}). Cancel anytime.
      </p>

      <div className="w-full max-w-xl pt-2">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          Or jump to client setup
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {INSTALL_LINKS.map((l) => (
            <Button key={l.id} asChild variant="outline" size="sm">
              <Link href={l.href}>Add to {l.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
