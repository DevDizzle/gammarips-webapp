# PROMPT: Build /arena — The Agent Arena (War Room Feature Page)

## Context
We've built an Agent Arena system where 7 AI agents powered by different models (Claude, GPT, Grok, Gemini, DeepSeek, Llama, Mistral) independently analyze the same overnight institutional options flow data, then engage in a 4-round adversarial debate — picking trades, attacking each other's reasoning, defending their positions, and casting final votes. The result is a daily consensus trade.

The debate results are stored in Firestore collection `arena_debates/{scan_date}`.

This page serves two purposes:
1. **Marketing:** Show free users what the Agent Arena is and why the consensus trade is worth paying for
2. **Product:** Show War Room subscribers ($149/mo) the full debate transcript and consensus results

## Copywriting Rules (apply to ALL copy on this page)
- Write for the buyer, not ourselves. Lead with what THEY get, not what we built.
- Kill generic language. Use specific numbers and concrete examples.
- Make them feel what it's like to own it. Paint the morning experience.
- Put the most important information first. The hook is above the fold.
- One clear promise: "7 AI agents argue over your next trade so you don't have to."

## Data Source

Firestore collection: `arena_debates`
Document ID: scan_date (e.g., "2026-02-18")

Document structure:
```typescript
interface ArenaDebate {
  scan_date: string;
  status: "complete";
  started_at: string;
  finished_at: string;
  duration_seconds: number;
  signals_count: number;
  agents: Array<{
    id: string;       // claude, gpt, grok, gemini, deepseek, llama, mistral
    name: string;     // Claude, GPT, Grok, Gemini, DeepSeek, Llama, Mistral
    emoji: string;    // 🟣, 🔵, 🔴, 🟡, 🟢, 🟤, ⚪
    model: string;    // claude-sonnet-4, gpt-4o, etc.
    origin: string;   // USA (Anthropic), China (DeepSeek), France (Mistral), etc.
  }>;
  
  // Consensus
  has_consensus: boolean;
  consensus_trade: {
    ticker: string;
    direction: string;      // bull / bear
    agent_count: number;
    total_agents: number;
    avg_conviction: number; // 1-10
    votes: Array<{
      agent_id: string;
      conviction: number;
      contract: string;
      reasoning: string;
    }>;
  } | null;
  
  // Categorized results
  unanimous: Array<ConsensusEntry>;
  supermajority: Array<ConsensusEntry>;
  majority: Array<ConsensusEntry>;
  split: Array<ConsensusEntry>;
  solo: Array<ConsensusEntry>;
  
  // Full debate rounds
  round1_picks: Record<string, AgentPick[]>;
  round2_attacks: Record<string, AgentAttack[]>;
  round3_defense: Record<string, AgentDefense[]>;
  round4_final: Record<string, AgentPick[]>;
}

interface ConsensusEntry {
  ticker: string;
  direction: string;
  agent_count: number;
  total_agents: number;
  ratio: number;
  avg_conviction: number;
  votes: Array<{ agent_id: string; conviction: number; contract: string; reasoning: string; }>;
}

interface AgentPick {
  ticker: string;
  direction: string;   // bull / bear
  conviction: number;  // 1-10
  contract: string;
  reasoning: string;
}

interface AgentAttack {
  target_agent: string;
  target_ticker: string;
  action: "attack" | "support";
  argument: string;
}

interface AgentDefense {
  ticker: string;
  action: "hold" | "revise" | "drop";
  original_conviction: number;
  new_conviction: number;
  defense: string;
}
```

## Add TypeScript Types

Add the above interfaces to `src/lib/firebase-admin.ts` (or a new `src/types/arena.ts` file).

Add a server-side data fetching function in `firebase-admin.ts`:

```typescript
export async function getLatestArenaDebate(): Promise<ArenaDebate | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection("arena_debates")
    .orderBy("scan_date", "desc")
    .limit(1)
    .get();
  
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as ArenaDebate;
}

export async function getArenaDebateByDate(date: string): Promise<ArenaDebate | null> {
  const db = getAdminFirestore();
  const doc = await db.collection("arena_debates").doc(date).get();
  if (!doc.exists) return null;
  return doc.data() as ArenaDebate;
}
```

## Page: `src/app/arena/page.tsx` (Server Component)

This is an SSR page. Fetch the latest debate server-side, pass to client component.

```tsx
import { getLatestArenaDebate } from "@/lib/firebase-admin";
import { ArenaClientPage } from "./arena-client";
import { PublicHeader } from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Arena — 7 AI Models Debate Today's Best Trade | GammaRips",
  description: "Every morning, 7 AI agents powered by Claude, GPT, Grok, Gemini, DeepSeek, Llama, and Mistral analyze the same institutional flow data and argue over the best trade. War Room members watch the fight.",
};

export default async function ArenaPage() {
  const debate = await getLatestArenaDebate();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <ArenaClientPage debate={debate} />
      <Footer />
    </div>
  );
}
```

## Client Component: `src/app/arena/arena-client.tsx`

This is the main page. It has two modes:
1. **Free users / not logged in:** See the marketing pitch + blurred/locked consensus trade
2. **War Room subscribers:** See the full debate transcript + consensus

Use the `useAuth` hook to check subscription status. Gate on `dbUser?.plan === 'warroom'` or `dbUser?.subscriptionStatus === 'founder_lifetime'`.

### Page Layout

#### Section 1: Hero (everyone sees this)

```
🏟️ Agent Arena

"7 AI agents analyze the same institutional flow data.
Then they argue about it. The ones that survive 
cross-examination become today's consensus trade."

Agents: 🟣 Claude · 🔵 GPT · 🔴 Grok · 🟡 Gemini · 🟢 DeepSeek · 🟤 Llama · ⚪ Mistral
```

Below the agent badges, show the scan date: "Debate for {scan_date}" and duration: "Completed in {duration_seconds}s"

#### Section 2: Today's Consensus (gated)

**If has_consensus is true, show a card:**

For WAR ROOM subscribers — show full consensus:
```
🏆 CONSENSUS TRADE

{ticker} — {direction} 
{agent_count}/{total_agents} agents agree
Avg conviction: {avg_conviction}/10

Agent votes listed with reasoning
```

For FREE users — show blurred/locked version:
```
🏆 CONSENSUS TRADE

[blurred ticker] — [blurred]
?/7 agents agree

┌─────────────────────────────────────┐
│  🔒 War Room Members Only           │
│                                     │
│  Every morning, 7 AI agents debate  │
│  the best trade from overnight      │
│  institutional flow. The consensus  │
│  pick — plus the full argument —    │  
│  is delivered to your WhatsApp      │
│  before the market opens.           │
│                                     │
│  [Join The War Room — $149/mo]      │
└─────────────────────────────────────┘
```

The subscribe button should link to `/pricing`.

**If has_consensus is false:**
Show: "⚖️ No Consensus Today — Agents couldn't agree. That's a signal too."

#### Section 3: The Debate Feed (gated — War Room only)

This is the main content. Render it like a chat/thread.

**Round 1 — Initial Picks:**
For each agent, show their picks as a card:
```
🟣 Claude                          Round 1
NVDA BULL — conviction 9/10
$950C March 21
"$14M in new call positioning across 58 strikes.
Vol/OI 4.2x indicates fresh positioning. Agentic AI 
infrastructure play with earnings catalyst."
```

**Round 2 — Cross-Examination:**
Show attacks with a red "ATTACK" badge and supports with a green "SUPPORT" badge:
```
🔴 Grok → Claude's NVDA            ⚔️ ATTACK
"That positioning could be hedging, not new bullish. 
NVDA +340% in 12mo. Check the put/call ratio on $900 
strikes — IV crush risk on anything pre-earnings."
```

```
🟢 DeepSeek → Claude's NVDA        🤝 SUPPORT
"Vol/OI 4.2x at $950 = new positioning, not rolls. 
Hedging clusters at current price, not 8% OTM."
```

**Round 3 — Defense:**
Show with HOLD (green), REVISE (yellow), or DROP (red) badges:
```
🟣 Claude — NVDA                    ✅ HOLD (9/10)
"Grok's IV crush concern is valid for weeklies but 
this is monthly expiry. Theta burn is manageable. 
Holding conviction at 9."
```

```
🔴 Grok — META                      📉 REVISE (8→5)
"DeepSeek's sector analysis is compelling. Lowering 
conviction but not dropping."
```

**Round 4 — Final Vote:**
Show each agent's final picks in a clean grid/table.

**For free users:** Show Round 1 picks only (blurred reasoning), then a big lock overlay for Rounds 2-4 with the War Room CTA.

#### Section 4: How The Arena Works (everyone sees)

Short explainer section:

```
How The Arena Works

1. PICK — Each agent independently picks their top trades 
   from overnight institutional flow data
2. ATTACK — Agents see each other's picks and challenge 
   weak reasoning. "What's the hole in your thesis?"
3. DEFEND — Agents defend their picks, revise conviction, 
   or drop positions that got exposed
4. VOTE — Final picks. Consensus is tallied.

When 4+ out of 7 agents independently converge on the 
same trade after adversarial debate, that's a signal 
you can't get anywhere else.
```

#### Section 5: War Room CTA (everyone sees)

```
The Full Debate. Delivered to WhatsApp. Before the Bell.

War Room members get:
• The consensus trade every morning at 6 AM
• The full adversarial debate delivered to WhatsApp
• Real-time alerts when institutional flow spikes intraday
• Direct access to GammaMolt for questions

This isn't a newsletter. It's a front-row seat to 7 AI 
models arguing over your money.

[Join The War Room — $149/mo]
```

## Add "Arena" to Navigation

Update `src/components/layout/public-header.tsx` — add to the `links` array:

```tsx
{ href: '/arena', label: 'Arena' },
```

Place it after 'Signals' and before 'Reports':
```tsx
const links = [
    { href: '/signals', label: 'Signals' },
    { href: '/arena', label: 'Arena' },
    { href: '/reports', label: 'Reports' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/developers', label: 'Developers' },
  ];
```

## Styling Notes

- Use the existing design system (shadcn/ui components, card borders, bg-card/50, etc.)
- The debate feed should feel like a group chat — left-aligned messages, agent avatars (emoji in colored circles), timestamps
- Attack badges: `bg-red-500/10 text-red-400 border-red-500/20`
- Support badges: `bg-green-500/10 text-green-400 border-green-500/20`
- Hold badges: `bg-green-500/10 text-green-400`
- Revise badges: `bg-yellow-500/10 text-yellow-400`
- Drop badges: `bg-red-500/10 text-red-400`
- The locked/blurred sections: use `backdrop-blur-sm` with a Lock icon, similar to the signal detail page paywall
- Agent emoji badges should have a small colored dot or background matching their color

## Handle Empty State

If `debate` is null (no debates yet), show:

```
🏟️ Agent Arena

The first debate is coming soon. 

7 AI agents will analyze overnight institutional flow 
and argue over the best trade — every trading day.

Want to be the first to see it?

[Join The War Room — $149/mo]    [View Pricing]
```

## Do NOT Change
- Other pages
- Auth system
- Firebase admin setup
- Any existing components (just import and use them)

## Verify After
1. `/arena` renders with no errors
2. Free users see the marketing page with blurred consensus + locked debate
3. War Room subscribers (plan === 'warroom' or subscriptionStatus === 'founder_lifetime') see the full debate
4. "Arena" appears in the header nav between Signals and Reports
5. Empty state renders cleanly when no debate data exists
6. Agent emoji badges render correctly
7. Round labels (PICK, ATTACK, DEFEND, VOTE) are visually distinct
8. Subscribe CTA links to `/pricing`
9. Mobile responsive — debate feed should stack cleanly on small screens
