'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Sparkles, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';
import {
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
  PRICE_MONTHLY,
  TRIAL_DAYS,
  TOOL_COUNT,
} from '@/lib/constants';
import { event as trackEvent } from '@/lib/gtag';

const INSTALL_URL = 'https://gammarips.com/install.md';

interface AgentQuickConnectProps {
  apiKey?: string | null;
  forceProPrompt?: boolean;
  compact?: boolean;
}

export function AgentQuickConnect({
  apiKey,
  forceProPrompt = false,
  compact = false,
}: AgentQuickConnectProps) {
  const { isPro } = useAuth();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const effectivePro = isPro || forceProPrompt || !!apiKey;

  const agentPrompt = apiKey
    ? `Read ${INSTALL_URL} and connect my GammaRips Pro MCP server using API key ${apiKey}, then call get_pool(view="enriched") and summarize today's top 3 contracts.`
    : effectivePro
      ? `Read ${INSTALL_URL} and connect my GammaRips Pro MCP server at ${MCP_PRO_ENDPOINT}, then call get_pool(view="enriched") and summarize today's top 3 contracts.`
      : `Read ${INSTALL_URL} and connect the GammaRips MCP server (${MCP_ENDPOINT}), then call get_pool(view="preview") and summarize today's 3-contract preview.`;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(agentPrompt);
      setCopiedPrompt(true);
      trackEvent('copy_agent_setup_prompt', { pro: effectivePro, has_key: !!apiKey });
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const copyProUrl = async () => {
    try {
      await navigator.clipboard.writeText(MCP_PRO_ENDPOINT);
      setCopiedUrl(true);
      trackEvent('copy_mcp_pro_url', { pro: effectivePro });
      setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-5 sm:p-6 space-y-5 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold font-headline text-foreground">
            Zero-Bash Setup: Let Your AI Connect Itself
          </h3>
        </div>
        {effectivePro && (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Pro Active
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        No terminal commands required. Copy the sentence below and paste it directly into{' '}
        <strong className="text-foreground">Claude Code, Cursor, Codex, Windsurf, or GrokBot</strong>
        —your agent will read{' '}
        <a
          href="/install.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 font-mono text-xs"
        >
          gammarips.com/install.md
        </a>
        , configure its own MCP connection, and pull your first pool summary automatically.
      </p>

      {/* Option 1: 1-Click Agent Prompt */}
      <div className="rounded-lg border bg-background/95 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Option 1 · Paste this prompt to your AI agent {apiKey ? '(Your API key is included)' : ''}
          </span>
          <Button size="sm" onClick={copyPrompt} className="gap-1.5">
            {copiedPrompt ? (
              <>
                <Check className="h-4 w-4" /> Prompt Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copy Prompt for Your AI
              </>
            )}
          </Button>
        </div>
        <pre className="p-3 rounded bg-muted/70 text-xs sm:text-sm font-mono text-foreground whitespace-pre-wrap break-all select-all">
          <code>{agentPrompt}</code>
        </pre>
      </div>

      {/* Option 2: No-Code GUI Connector for Claude / ChatGPT */}
      {!compact && (
        <div className="rounded-lg border bg-background/80 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Option 2 · Claude App or ChatGPT (No Terminal, Sign In with Browser)
            </span>
            <Button size="sm" variant="outline" onClick={copyProUrl} className="gap-1.5">
              {copiedUrl ? (
                <>
                  <Check className="h-3.5 w-3.5" /> URL Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy {MCP_PRO_ENDPOINT.replace('https://', '')}
                </>
              )}
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            In <strong className="text-foreground">Claude Desktop / Claude.ai</strong> (Customize &rarr; Connectors &rarr; Add custom connector) or{' '}
            <strong className="text-foreground">ChatGPT</strong>, paste{' '}
            <code className="text-primary font-mono">{MCP_PRO_ENDPOINT}</code> and sign in with your GammaRips account. All {TOOL_COUNT} tools unlock immediately.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Subscription-aware CTA button: never pitches "$29/mo Start Free Trial" to a
 * user who is already on an active Pro subscription or trial.
 */
export function ProAwareCta({
  size = 'lg',
  proLabel = 'Manage API Key & Connect AI',
  freeLabel = `Start ${TRIAL_DAYS}-Day Free Trial (${PRICE_MONTHLY}/mo)`,
  className,
}: {
  size?: 'sm' | 'default' | 'lg';
  proLabel?: string;
  freeLabel?: string;
  className?: string;
}) {
  const { isPro } = useAuth();

  if (isPro) {
    return (
      <Button asChild size={size} className={className}>
        <Link href="/account">
          <KeyRound className="mr-2 h-4 w-4" />
          {proLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild size={size} className={className}>
      <Link href="/pricing">
        {freeLabel} <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
    </Button>
  );
}
