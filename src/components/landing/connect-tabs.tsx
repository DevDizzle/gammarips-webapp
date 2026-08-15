'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CONNECT_CLIENTS, PRO_STATUS_LABEL, type ConnectStep } from '@/lib/connect-clients';
import { PRICE_MONTHLY, TOOL_COUNT } from '@/lib/constants';

// The activation step, above the fold: every client gets the free ten-second
// connect first, then the honest pro line for that client. Facts come from
// src/lib/connect-clients.ts (checked against vendor docs); this component
// only renders them. Order: the four clients that can send the key today
// come first, the chat clients after.

function Steps({ steps }: { steps: ConnectStep[] }) {
  return (
    <ol className="space-y-3 text-sm">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-muted text-[11px] font-semibold flex items-center justify-center text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-muted-foreground">{s.text}</p>
            {s.code && (
              <pre className="p-3 bg-muted rounded text-xs md:text-sm text-left overflow-x-auto whitespace-pre-wrap break-all font-mono text-primary">
                <code>{s.code}</code>
              </pre>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ConnectTabs() {
  return (
    <section id="connect" className="scroll-mt-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary text-center mb-3">
        Connect your agent
      </p>
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center text-balance mb-3">
        Free first. Then the paid tools, where your client can send a key.
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-8">
        Pick your client. The free tier needs no card, no key, and no signup.
        Agent Access ({PRICE_MONTHLY}/mo, 7-day trial) gives your agent all {TOOL_COUNT}{' '}
        tools. Some chat clients cannot send a key yet, and we say so on the tab.
      </p>

      <Tabs defaultValue={CONNECT_CLIENTS[0].id} className="max-w-3xl mx-auto">
        <TabsList className="flex h-auto flex-wrap justify-center gap-1 bg-muted/60 p-1">
          {CONNECT_CLIENTS.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="px-3 py-1.5 text-xs md:text-sm">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CONNECT_CLIENTS.map((c) => (
          <TabsContent key={c.id} value={c.id} className="mt-4">
            <div className="rounded-xl border bg-card/60 p-5 md:p-6 space-y-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-headline">Free</h3>
                  <Badge variant="outline" className="text-[10px]">
                    no card, no key
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.free.intro}</p>
                <Steps steps={c.free.steps} />
              </div>

              <div className="space-y-3 border-t border-border/60 pt-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold font-headline">Pro, {PRICE_MONTHLY}/mo</h3>
                  <Badge
                    variant={c.pro.status === 'full' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {PRO_STATUS_LABEL[c.pro.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.pro.intro}</p>
                <Steps steps={c.pro.steps} />
                {(c.pro.status === 'full' || c.pro.status === 'beta') && (
                  <div className="pt-1">
                    <Button asChild size="sm">
                      <Link href="/pricing">Start your 7-day free trial, get your key</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-6 text-center space-y-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/developers">See all {TOOL_COUNT} MCP tools &rarr;</Link>
        </Button>
        <p className="text-xs text-muted-foreground">
          The Python SDK connects the same way. Steps are on the developer docs.
        </p>
        <p className="text-xs text-muted-foreground">
          Before you pay: the whole pool under one fixed exit loses money.{' '}
          <Link href="#honesty" className="text-primary hover:underline">
            Read why.
          </Link>
        </p>
      </div>
    </section>
  );
}
