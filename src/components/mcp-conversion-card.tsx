'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Check, CheckCircle2, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  HARNESS_REPO,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
} from '@/lib/constants';
import { event as trackEvent } from '@/lib/gtag';
import { ProAwareCta } from '@/components/account/agent-quick-connect';

const FREE_SETUP_PROMPT = `Read https://gammarips.com/install.md and connect the GammaRips MCP server (${MCP_ENDPOINT}), then call get_pool(view="preview") and summarize today's 3-setup preview across stocks, 2x ETFs, and options.`;
const PRO_SETUP_PROMPT = `Read https://gammarips.com/install.md and connect my GammaRips Pro MCP server at ${MCP_PRO_ENDPOINT}, then call get_pool(view="enriched") and summarize 3 liquid setups from today's pool with their stock, 2x ETF, and option vehicles.`;

interface McpConversionCardProps {
  source?: string;
  headline?: string;
  subline?: string;
}

export function McpConversionCard({
  source = 'content_footer',
  headline = 'Give your AI real nightly market data — for stocks, 2x ETFs, or options',
  subline = 'Every trading night, GammaRips screens 3,500+ US stocks for institutional flow, tight liquidity, and volatility value — plus live morning liquidity checks and 3-day move history inside Claude, ChatGPT, Cursor, or Codex.',
}: McpConversionCardProps) {
  const { isPro } = useAuth();
  const [copied, setCopied] = useState(false);

  const promptToCopy = isPro ? PRO_SETUP_PROMPT : FREE_SETUP_PROMPT;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptToCopy);
      setCopied(true);
      trackEvent('copy_mcp_command', { source, pro: isPro });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard failures on restricted contexts
    }
  };

  return (
    <aside className="rounded-xl border border-primary/30 bg-card/70 p-6 sm:p-8 space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-mono uppercase tracking-wider text-primary">
            Claude · ChatGPT · Cursor · Codex · MCP
          </p>
          {isPro && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Pro Active
            </Badge>
          )}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
          {isPro ? 'Your Pro Subscription is Active' : headline}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {isPro
            ? 'You have full access to all 40–50 daily setups on the web (/signals) and all 9 Pro MCP tools across stocks, 2x/inverse ETFs, and options. Paste the prompt below into your AI to query today’s pool.'
            : subline}
        </p>
      </div>

      <div className="rounded-lg border bg-background/90 p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {isPro
              ? 'Paste this prompt to your AI to connect Pro MCP automatically:'
              : 'Paste this prompt to your AI to connect in 60 seconds (no terminal needed):'}
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
                <Copy className="h-3.5 w-3.5" /> Copy Prompt
              </>
            )}
          </button>
        </div>
        <pre className="overflow-x-auto text-xs sm:text-sm font-mono text-foreground whitespace-pre-wrap break-all select-all">
          <code>{promptToCopy}</code>
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex flex-wrap gap-3">
          {isPro ? (
            <>
              <Button asChild size="lg" className="font-semibold">
                <Link href="/signals">
                  View Full Daily Pool <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/account">Manage Billing &amp; API Key</Link>
              </Button>
            </>
          ) : (
            <>
              <ProAwareCta size="lg" className="font-semibold" />
              <Button
                asChild
                variant="outline"
                size="lg"
                onClick={() => trackEvent('cta_click', { source, destination: '/build' })}
              >
                <Link href="/build">
                  Or Have Us Build Your Agent ({BUILD_STANDARD_PRICE})
                </Link>
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Custom builds ship in {BUILD_TURNAROUND_DAYS} days ·{' '}
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
