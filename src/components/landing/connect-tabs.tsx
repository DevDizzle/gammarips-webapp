'use client';

import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Disclosure } from '@/components/ui/disclosure';
import { CONNECT_CLIENTS, PRO_STATUS_LABEL, type ConnectStep } from '@/lib/connect-clients';
import { HARNESS_REPO, MCP_PRO_ENDPOINT, PRICE_MONTHLY, TOOL_COUNT, TRIAL_DAYS } from '@/lib/constants';
import { AgentQuickConnect, ProAwareCta } from '@/components/account/agent-quick-connect';

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
      <h2 className="text-2xl md:text-3xl font-bold font-headline text-center mb-3">
        Connect your AI in one step
      </h2>
      <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-6">
        Copy one prompt to let your AI wire itself up, or paste our server URL into Claude or ChatGPT and sign in with your browser.
      </p>

      <div className="max-w-3xl mx-auto mb-5">
        <AgentQuickConnect />
      </div>

      {/* Progressive disclosure: keeps manual CLI/IDE configs searchable via Ctrl+F
          without overwhelming non-technical visitors on the homepage. */}
      <div className="max-w-3xl mx-auto">
        <Disclosure
          label="Manual setup steps by AI client"
          hint="Claude Code, Cursor, Codex, Gemini CLI, ChatGPT, Claude App"
        >
          <Tabs defaultValue={CONNECT_CLIENTS[0].id} className="pt-2">
            <TabsList className="flex h-auto flex-nowrap overflow-x-auto justify-start gap-1 bg-muted/60 p-1">
              {CONNECT_CLIENTS.map((c) => (
                <TabsTrigger key={c.id} value={c.id} className="px-3 py-1.5 text-xs md:text-sm shrink-0">
                  {c.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {CONNECT_CLIENTS.map((c) => (
              <TabsContent key={c.id} value={c.id} className="mt-4">
                <div className="rounded-xl border bg-background/80 p-5 space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold font-headline text-foreground">Free 3-Setup Preview</h3>
                      <Badge variant="outline" className="text-[10px]">
                        no card, no key
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.free.intro}</p>
                    <Steps steps={c.free.steps} />
                  </div>

                  <div className="space-y-3 border-t border-border/60 pt-5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold font-headline text-foreground">Pro, {PRICE_MONTHLY}/mo</h3>
                      <Badge variant="default" className="text-[10px]">
                        {PRO_STATUS_LABEL[c.pro.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.pro.intro}</p>
                    <Steps steps={c.pro.steps} />
                    <div className="pt-1">
                      <ProAwareCta
                        size="sm"
                        freeLabel={
                          c.pro.status === 'full'
                            ? `Start your ${TRIAL_DAYS}-day free trial, get your key`
                            : `Start your ${TRIAL_DAYS}-day free trial, then sign in`
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Disclosure>
      </div>

      <div className="mt-6 text-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/developers">See all {TOOL_COUNT} MCP tools &rarr;</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={HARNESS_REPO} target="_blank" rel="noopener noreferrer">
              Explore open-source agent harness on GitHub &rarr;
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Pro OAuth URL: <code className="text-primary">{MCP_PRO_ENDPOINT}</code>
        </p>
      </div>
    </section>
  );
}
