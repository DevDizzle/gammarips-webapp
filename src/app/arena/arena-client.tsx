'use client';

import { ArenaDebate, AgentPick, AgentAttack, AgentDefense, ConsensusObject } from "@/lib/firebase-admin";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInSeconds } from "date-fns";

interface ArenaClientPageProps {
  debate: ArenaDebate | null;
}

const AGENT_INFO: Record<string, { name: string; emoji: string }> = {
  grok: { name: "Grok", emoji: "🔴" },
  gemini: { name: "Gemini", emoji: "🟡" },
  claude: { name: "Claude", emoji: "🟣" },
  deepseek: { name: "DeepSeek", emoji: "🟢" },
  gpt: { name: "GPT", emoji: "🔵" },
  llama: { name: "Llama", emoji: "🟤" },
  mistral: { name: "Mistral", emoji: "⚪" },
};

function getAgent(id: string) {
  const normalizedId = id.toLowerCase().replace(/[^a-z0-9]/g, '');
  // Try exact match first, then partial match
  const key = Object.keys(AGENT_INFO).find(k => normalizedId.includes(k));
  return AGENT_INFO[key || ''] || { name: id, emoji: "🤖" };
}

export function ArenaClientPage({ debate }: ArenaClientPageProps) {
  const { dbUser } = useAuth();
  
  // Logic for access. Explicitly as requested.
  const hasAccess = dbUser?.plan === 'warroom' || dbUser?.subscriptionStatus === 'founder_lifetime';

  if (!debate) {
      return (
        <div className="flex-1 container max-w-4xl py-24 px-4 space-y-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl md:text-5xl font-bold font-headline">🏟️ Agent Arena</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The first debate is coming soon.
                <br /><br />
                3 AI agents will analyze overnight institutional flow
                and argue over the best trade — every trading day.
            </p>
            <div className="p-8 bg-card/50 border rounded-lg max-w-md mx-auto space-y-4 w-full">
                <p className="font-medium">Want to be the first to see it?</p>
                <div className="flex flex-col gap-3">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/pricing">Join The War Room — $149/mo</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                        <Link href="/pricing">View Pricing</Link>
                    </Button>
                </div>
            </div>
        </div>
      );
  }

  const agentIds = debate.agents || [];
  
  // Calculate duration if not present directly (schema has start/completed timestamps)
  let duration = 0;
  if (debate.started_at && debate.completed_at) {
      try {
        duration = differenceInSeconds(parseISO(debate.completed_at), parseISO(debate.started_at));
      } catch (e) {
          console.error("Error calculating duration", e);
      }
  }

  // Consensus logic: Schema has an array of consensus objects. We pick the first one if it exists.
  const consensusTrade = (debate.consensus && debate.consensus.length > 0) ? debate.consensus[0] : null;
  const hasConsensus = !!consensusTrade;

  // Rounds access
  const rounds = debate.rounds || {};
  const round1 = rounds.round1_picks || {};
  const round2 = rounds.round2_attacks || {};
  const round3 = rounds.round3_defenses || {}; // Plural in schema
  const round4 = rounds.round4_final || {};

  return (
    <main className="flex-1 container max-w-4xl py-8 px-4 space-y-12">
      {/* Section 1: Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold font-headline">🏟️ Agent Arena</h1>
        <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-3xl mx-auto">
          3 AI agents analyze the same institutional flow data.
          Then they argue about it. The ones that survive 
          cross-examination become today's consensus trade.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 text-sm font-medium text-muted-foreground">
          {agentIds.map(id => {
            const agent = getAgent(id);
            return (
                <span key={id} className="inline-flex items-center gap-1">
                {agent.emoji} {agent.name}
                </span>
            );
          })}
        </div>

        <div className="text-sm text-muted-foreground">
          Debate for {debate.scan_date ? format(parseISO(debate.scan_date), 'MMMM do, yyyy') : 'Today'} • Completed in {duration}s
        </div>
      </section>

      {/* Section 2: Consensus */}
      <section>
        {hasConsensus && consensusTrade ? (
          <Card className={cn("border-2", hasAccess ? "border-primary/20" : "border-muted")}>
            <CardHeader className="bg-muted/20 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                🏆 CONSENSUS TRADE
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 relative overflow-hidden">
               {hasAccess ? (
                 <>
                    <div className="flex flex-col gap-1">
                        <div className="text-3xl font-bold text-primary flex flex-wrap items-baseline gap-2">
                            <span>{consensusTrade.ticker}</span>
                            <span className="text-foreground">—</span>
                            <span>{consensusTrade.direction.toUpperCase()}</span>
                            <span className="text-foreground">·</span>
                            <span className="text-2xl font-mono text-muted-foreground">
                                {consensusTrade.contract || (consensusTrade.votes && consensusTrade.votes[0]?.contract) || "No Contract"}
                            </span>
                        </div>
                        <div className="text-lg font-medium text-muted-foreground">
                            {consensusTrade.vote_count}/{consensusTrade.total_agents} agents agree
                        </div>
                    </div>
                    <div className="text-muted-foreground">
                        Avg conviction: <span className="font-semibold text-foreground">{consensusTrade.avg_conviction}/10</span>
                    </div>
                    
                    <div className="pt-4 space-y-3">
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Agent Votes</h4>
                        <div className="grid gap-3">
                            {(consensusTrade.votes || []).map((vote, i) => {
                                const agent = getAgent(vote.agent);
                                return (
                                    <div key={i} className="bg-muted/30 p-3 rounded-md text-sm">
                                        <div className="font-medium flex items-center gap-2 mb-1">
                                            <span>{agent.emoji}</span> <span>{agent.name}</span>
                                            <Badge variant="outline" className="ml-auto">Conviction {vote.conviction}/10</Badge>
                                        </div>
                                        <div className="text-muted-foreground font-mono text-xs mb-2">{vote.contract}</div>
                                        <p>{vote.reasoning}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 </>
               ) : (
                 <>
                    {/* Blurred Content */}
                    <div className="filter blur-sm select-none pointer-events-none opacity-50">
                        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
                            <div className="text-3xl font-bold text-primary">
                                $XXXX <span className="text-foreground">—</span> BULLISH
                            </div>
                            <div className="text-lg font-medium text-muted-foreground">
                                ?/7 agents agree
                            </div>
                        </div>
                         <div className="text-muted-foreground">
                            Avg conviction: <span className="font-semibold text-foreground">?/10</span>
                        </div>
                        <div className="pt-4 space-y-3 h-32"></div>
                    </div>

                    {/* Lock Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/10 backdrop-blur-[2px] p-6">
                        <div className="bg-card border shadow-lg rounded-xl p-6 md:p-8 max-w-md text-center space-y-4">
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Lock className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold">War Room Members Only</h3>
                            <p className="text-muted-foreground text-sm">
                                Every morning, 3 AI agents debate the best trade from overnight institutional flow. 
                                The consensus pick — plus the full argument — is delivered to your WhatsApp before the market opens.
                            </p>
                            <Button asChild className="w-full">
                                <Link href="/pricing">Join The War Room — $149/mo</Link>
                            </Button>
                        </div>
                    </div>
                 </>
               )}
            </CardContent>
          </Card>
        ) : (
            <div className="p-8 border-2 border-dashed rounded-xl text-center space-y-2 bg-muted/10">
                <div className="text-3xl">⚖️</div>
                <h3 className="text-xl font-semibold">No Consensus Today</h3>
                <p className="text-muted-foreground">Agents couldn't agree. That's a signal too.</p>
            </div>
        )}
      </section>

      {/* Section 3: The Debate Feed */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold font-headline">The Debate</h2>
        
        {/* Round 1: Initial Picks */}
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground border-b pb-2">Round 1 — Initial Picks</h3>
            <div className="grid gap-4 md:grid-cols-2">
                {agentIds.map(agentId => {
                    const agent = getAgent(agentId);
                    const picks = round1[agentId] || [];
                    if (picks.length === 0) return null;
                    
                    return picks.map((pick, i) => (
                        <Card key={`${agentId}-${i}`} className="bg-card/50">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 font-medium">
                                        <span>{agent.emoji}</span> <span>{agent.name}</span>
                                    </div>
                                    <Badge variant={pick.direction === 'bull' ? 'default' : 'destructive'} className="uppercase text-[10px]">
                                        {pick.direction}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className={cn(
                                        "font-bold text-lg",
                                        !hasAccess && "filter blur-[4px] select-none"
                                    )}>
                                        {pick.ticker}
                                    </span>
                                    <span className="text-muted-foreground text-xs">Conviction {pick.conviction}/10</span>
                                </div>
                                <div className={cn("font-mono text-xs text-muted-foreground", !hasAccess && "filter blur-[4px] select-none")}>
                                    {pick.contract}
                                </div>
                                <div className={cn("pt-2", !hasAccess && "filter blur-[3px] select-none text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600")}>
                                    "{pick.reasoning}"
                                </div>
                            </CardContent>
                        </Card>
                    ));
                })}
            </div>
        </div>

        {/* Round 2: Cross-Examination */}
        <div className="space-y-4 relative">
             <h3 className="text-lg font-semibold text-muted-foreground border-b pb-2">Round 2 — Cross-Examination</h3>
             
             {hasAccess ? (
                 <div className="space-y-4">
                    {Object.entries(round2).map(([agentId, attacks]) => {
                        const agent = getAgent(agentId);
                        return (attacks || []).map((attack, i) => {
                            const targetAgent = getAgent(attack.target_agent);
                            const isAttack = attack.action === 'attack';
                            
                            return (
                                <div key={`${agentId}-${i}`} className="flex gap-4 p-4 rounded-lg bg-muted/20 border">
                                    <div className="text-2xl pt-1">{agent.emoji}</div>
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="font-semibold">{agent.name}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span className="text-muted-foreground">{targetAgent.name}'s {attack.target_ticker}</span>
                                            <Badge 
                                                variant="outline" 
                                                className={cn(
                                                    "ml-auto uppercase text-[10px]",
                                                    isAttack 
                                                      ? "bg-red-500/10 text-red-500 border-red-500/20" 
                                                      : "bg-green-500/10 text-green-500 border-green-500/20"
                                                )}
                                            >
                                                {isAttack ? '⚔️ ATTACK' : '🤝 SUPPORT'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm">"{attack.argument}"</p>
                                    </div>
                                </div>
                            );
                        });
                    })}
                 </div>
             ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 border rounded-lg bg-muted/5">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                    <div className="space-y-1">
                         <h4 className="font-semibold">Debate Locked</h4>
                         <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                            War Room members see the full cross-examination, defense, and final votes.
                         </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href="/pricing">Unlock The Arena</Link>
                    </Button>
                </div>
             )}
        </div>

        {/* Round 3: Defense */}
        {hasAccess && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground border-b pb-2">Round 3 — Defense</h3>
                <div className="space-y-4">
                    {Object.entries(round3).map(([agentId, defenses]) => {
                         const agent = getAgent(agentId);
                         return (defenses || []).map((def, i) => {
                             let badgeClass = "bg-gray-500/10 text-gray-500";
                             if (def.action === 'hold') badgeClass = "bg-green-500/10 text-green-500";
                             if (def.action === 'revise') badgeClass = "bg-yellow-500/10 text-yellow-500";
                             if (def.action === 'drop') badgeClass = "bg-red-500/10 text-red-500";

                             return (
                                <div key={`${agentId}-${i}`} className="flex gap-4 p-4 rounded-lg bg-muted/20 border">
                                    <div className="text-2xl pt-1">{agent.emoji}</div>
                                    <div className="space-y-2 flex-1">
                                         <div className="flex flex-wrap items-center gap-2 text-sm">
                                            <span className="font-semibold">{agent.name}</span>
                                            <span className="text-muted-foreground">— {def.ticker}</span>
                                            <Badge variant="outline" className={cn("ml-auto uppercase text-[10px]", badgeClass)}>
                                                {def.action === 'revise' ? `📉 ${def.action} (${def.original_conviction}→${def.new_conviction})` : 
                                                 def.action === 'hold' ? `✅ ${def.action} (${def.original_conviction}/10)` : 
                                                 `🗑️ ${def.action}`}
                                            </Badge>
                                        </div>
                                        <p className="text-sm">"{def.defense}"</p>
                                    </div>
                                </div>
                             );
                         });
                    })}
                </div>
            </div>
        )}

        {/* Round 4: Final Vote */}
        {hasAccess && (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-muted-foreground border-b pb-2">Round 4 — Final Votes</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(round4).map(([agentId, picks]) => {
                         const agent = getAgent(agentId);
                         const finalPicks = picks || [];
                         return (
                             <Card key={agentId} className="bg-card">
                                 <CardHeader className="p-4 pb-2 flex flex-row items-center gap-2 space-y-0">
                                     <span className="text-xl">{agent.emoji}</span>
                                     <span className="font-semibold text-sm">{agent.name}</span>
                                 </CardHeader>
                                 <CardContent className="p-4 pt-2 space-y-2">
                                     {finalPicks.length > 0 ? finalPicks.map((pick, i) => (
                                         <div key={i} className="bg-muted/30 p-2 rounded text-xs space-y-1">
                                             <div className="flex justify-between font-medium">
                                                 <span>{pick.ticker}</span>
                                                 <span className={cn(pick.direction === 'bull' ? "text-green-500" : "text-red-500")}>
                                                     {(pick.direction || '').toUpperCase()} ({pick.conviction})
                                                 </span>
                                             </div>
                                         </div>
                                     )) : (
                                         <div className="text-xs text-muted-foreground italic">No final picks.</div>
                                     )}
                                 </CardContent>
                             </Card>
                         );
                    })}
                </div>
            </div>
        )}

      </section>

      {/* Section 4: How It Works */}
      <section className="py-8 border-t">
        <h2 className="text-2xl font-bold font-headline mb-6">How The Arena Works</h2>
        <div className="grid gap-6 md:grid-cols-4">
            {[
                { step: "1", title: "PICK", desc: "Each agent independently picks their top trades from overnight institutional flow data." },
                { step: "2", title: "ATTACK", desc: "Agents see each other's picks and challenge weak reasoning. 'What's the hole in your thesis?'" },
                { step: "3", title: "DEFEND", desc: "Agents defend their picks, revise conviction, or drop positions that got exposed." },
                { step: "4", title: "VOTE", desc: "Final picks. Consensus is tallied. Only the strongest ideas survive." }
            ].map((item, i) => (
                <div key={i} className="space-y-2">
                    <div className="text-xs font-bold text-primary tracking-wider">{item.step}. {item.title}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
        <div className="mt-6 p-4 bg-muted/20 rounded-lg text-sm text-muted-foreground">
            When the agents independently converge on the same trade after adversarial debate, that's a signal you can't get anywhere else.
        </div>
      </section>

      {/* Section 5: War Room CTA */}
      <section className="bg-primary/5 border border-primary/20 rounded-xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-2xl md:text-3xl font-bold font-headline">The Full Debate. Delivered to WhatsApp. Before the Bell.</h2>
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto text-left text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>The consensus trade every morning at 6 AM</span>
            </div>
            <div className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>The full adversarial debate delivered to WhatsApp</span>
            </div>
            <div className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Real-time alerts when institutional flow spikes intraday</span>
            </div>
            <div className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Direct access to GammaMolt for questions</span>
            </div>
        </div>
        
        <p className="text-lg font-medium max-w-lg mx-auto">
            This isn't a newsletter. It's a front-row seat to 3 AI models arguing over your money.
        </p>

        <Button asChild size="lg" className="px-8">
            <Link href="/pricing">Join The War Room — $149/mo</Link>
        </Button>
      </section>
    </main>
  );
}
