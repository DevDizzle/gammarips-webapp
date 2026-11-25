'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface GlossaryTipProps {
  /** Short term name used in the button's accessible label. */
  term: string;
  /** Plain-English explanation shown in the toggletip popover. */
  explanation: string;
  className?: string;
}

/**
 * Accessible toggletip (`?` button + native Popover API).
 * Uses `popover="hint"` with `popovertargetaction="show"` and degrades cleanly
 * to `popover="auto"` in browsers where `"hint"` is unsupported so clicks still
 * light-dismiss on Escape or outside click.
 */
export function GlossaryTip({ term, explanation, className }: GlossaryTipProps) {
  const id = useId();
  const popoverId = `tip-${id.replace(/:/g, '')}`;
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const handleBeforeToggle = (e: Event) => {
      const ev = e as ToggleEvent;
      if (ev.newState === 'open') {
        const probe = document.createElement('div');
        (probe as unknown as { popover: string }).popover = 'hint';
        if ((probe as unknown as { popover: string }).popover !== 'hint') {
          el.setAttribute('popover', 'auto');
        }
      }
    };

    const handleToggle = (e: Event) => {
      const ev = e as ToggleEvent;
      setExpanded(ev.newState === 'open');
    };

    el.addEventListener('beforetoggle', handleBeforeToggle);
    el.addEventListener('toggle', handleToggle);
    return () => {
      el.removeEventListener('beforetoggle', handleBeforeToggle);
      el.removeEventListener('toggle', handleToggle);
    };
  }, []);

  return (
    <span className={cn('inline-flex items-center align-baseline', className)}>
      <button
        type="button"
        aria-label={`What does ${term} mean?`}
        aria-expanded={expanded}
        {...({
          interestfor: popoverId,
          popovertarget: popoverId,
          popovertargetaction: 'show',
        } as Record<string, string>)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-border bg-muted/70 text-[10px] font-bold text-muted-foreground hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring align-middle"
      >
        ?
      </button>
      <div
        ref={popoverRef}
        id={popoverId}
        role="tooltip"
        {...({ popover: 'hint' } as Record<string, string>)}
        className="gr-toggletip rounded-lg border border-border bg-popover px-3.5 py-2.5 text-xs leading-relaxed text-popover-foreground shadow-lg"
      >
        <p className="font-semibold text-foreground mb-1">{term}</p>
        <p className="text-muted-foreground">{explanation}</p>
      </div>
    </span>
  );
}
