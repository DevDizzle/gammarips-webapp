'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Check, CheckCircle2, Copy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HARNESS_REPO,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
} from '@/lib/constants';
import { event as trackEvent } from '@/lib/gtag';
import { ProAwareCta } from '@/components/account/agent-quick-connect';

const FREE_SETUP_PROMPT = `Read https://gammarips.com/install.md and connect the GammaRips MCP server (${MCP_ENDPOINT}), then call get_pool(view="preview") and summarize today's 3-contract preview.`;
const PRO_SETUP_PROMPT = `Read https://gammarips.com/install.md and connect my GammaRips Pro MCP server at ${MCP_PRO_ENDPOINT}, then call get_pool(view="enriched") and summarize today's top 3 contracts.`;

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
            ? 'You have full access to all 40–50 daily Combo A signals on the web (/signals) and all 9 Pro MCP tools. Paste the prompt below into your AI to query the full enriched dataset.'
            : subline}
        </p>
      </div>

      <div className="rounded-lg border bg-background/90 p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-mono">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {isPro
              ? 'Paste this prompt to your AI to connect Pro MCP automatically:'
              : 'Paste this prompt to your AI to connect automatically (no terminal required):'}
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
                  View Full Daily Pool (/signals) <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/account">Manage API Key &amp; Account</Link>
              </Button>
            </>
          ) : (
            <>
              <ProAwareCta size="lg" className="font-semibold" />
              <Button
                asChild
                variant="outline"
                size="lg"
                onClick={() => trackEvent('cta_click', { source, destination: '/developers#connect' })}
              >
                <Link href="/developers#connect">Connect OAuth / API Key</Link>
              </Button>
            </>
          )}
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
