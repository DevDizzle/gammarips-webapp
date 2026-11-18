'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HARNESS_REPO,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
  PRICE_MONTHLY,
  TRIAL_DAYS,
} from '@/lib/constants';
import { event as trackEvent } from '@/lib/gtag';

const FREE_INSTALL_CMD = `claude mcp add --transport http gammarips ${MCP_ENDPOINT}`;

interface McpConversionCardProps {
  source?: string;
  headline?: string;
  subline?: string;
}

export function McpConversionCard({
  source = 'content_footer',
  headline = 'Put your AI agent on the full Combo A options dataset',
  subline = `Every trading night, GammaRips filters ~3,500 optionable US stocks to 40–50 liquid bullish calls (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45, RV/IV >= 0.85), plus 10-minute morning liquidity snapshots and 3-day excursion history.`,
}: McpConversionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FREE_INSTALL_CMD);
      setCopied(true);
      trackEvent('copy_mcp_command', { source });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures on restricted contexts
    }
  };

  return (
    <aside className="rounded-xl border border-primary/30 bg-card/70 p-6 sm:p-8 space-y-5">
      <div className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider text-primary">
          Claude · ChatGPT · Cursor · Codex · MCP
        </p>
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
          {headline}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {subline}
        </p>
      </div>

      <div className="rounded-lg border bg-background/90 p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            Try today&apos;s 3-contract preview free in 10 seconds (no key, no card):
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto text-xs sm:text-sm font-mono text-foreground select-all">
          <code>{FREE_INSTALL_CMD}</code>
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="font-semibold"
            onClick={() => trackEvent('cta_click', { source, destination: '/pricing' })}
          >
            <Link href="/pricing">
              Start {TRIAL_DAYS}-Day Free Trial ({PRICE_MONTHLY}/mo) <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            onClick={() => trackEvent('cta_click', { source, destination: '/developers#connect' })}
          >
            <Link href="/developers#connect">Connect OAuth / API Key</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          OAuth 2.1 at <code className="text-foreground">{MCP_PRO_ENDPOINT.replace('https://', '')}</code> ·{' '}
          <a
            href={HARNESS_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Open-source harness
          </a>{' '}
          · Educational data, not advice.
        </p>
      </div>
    </aside>
  );
}
