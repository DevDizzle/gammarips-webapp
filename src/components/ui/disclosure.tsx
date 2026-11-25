import React from 'react';
import { cn } from '@/lib/utils';

interface DisclosureProps {
  /** Plain-text label for the disclosure trigger (never pass a heading tag). */
  label: string;
  /** Optional muted hint shown inline next to the label. */
  hint?: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Progressive-disclosure wrapper built on native HTML `<details>` / `<summary>`.
 * Hidden specs stay findable with browser Find-in-Page, indexable by search
 * engines, and operable via keyboard/screen readers without JavaScript.
 */
export function Disclosure({
  label,
  hint,
  defaultOpen = false,
  className,
  children,
}: DisclosureProps) {
  return (
    <details
      open={defaultOpen || undefined}
      className={cn(
        'gr-disclosure rounded-xl border border-border/80 bg-card/40 text-left',
        className
      )}
    >
      <summary className="px-4 py-3.5 text-sm font-semibold text-foreground hover:text-primary transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        <span>{label}</span>
        {hint && (
          <span className="text-xs font-normal text-muted-foreground ml-1">
            — {hint}
          </span>
        )}
      </summary>
      <div className="px-4 pb-4 pt-1 border-t border-border/60 text-sm text-muted-foreground space-y-3">
        {children}
      </div>
    </details>
  );
}
