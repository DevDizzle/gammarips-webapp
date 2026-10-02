import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  TOOL_COUNT,
  PRICE_MONTHLY,
  PRICE_STANDARD,
  FOUNDING_CAP,
  TRIAL_DAYS,
  OG_IMAGE,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
  HARNESS_REPO,
} from '@/lib/constants';
import { CONNECT_CLIENTS, type ClientId, type ConnectStep } from '@/lib/connect-clients';
import {
  CONTRACT_QUALITY,
  POOL_HIT_RATES,
  RECEIPTS_DISCLAIMER,
  INSTALL_LINKS,
  int,
  pct,
} from '@/lib/receipts';

export const metadata = {
  title: "GammaRips MCP: The Options-Flow Data Layer for AI Agents",
  description:
    `Connect GammaRips to Claude, ChatGPT, Cursor, or Codex. Better-quality option contracts every night, the exit lab, and ${TOOL_COUNT} MCP tools your AI uses to build the trade plan with you.`,
  alternates: { canonical: "https://gammarips.com/developers" },
  openGraph: {
    images: [OG_IMAGE],
    title: "GammaRips MCP: The Options-Flow Data Layer for AI Agents",
    description:
      `Better-quality option contracts every night and the history to plan the exit, in Claude, ChatGPT, Cursor, or Codex. ${TOOL_COUNT} MCP tools. ${PRICE_MONTHLY}/mo, ${TRIAL_DAYS}-day free trial.`,
    url: "https://gammarips.com/developers",
  },
};

const webApiSchema = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "GammaRips MCP",
  description:
    `Model Context Protocol (MCP) server for AI agents: ${TOOL_COUNT} tools covering the nightly liquidity-ranked options pool, point-in-time feature vectors, fresh contract liquidity, the exit lab (opportunity surfaces, touch probabilities, and exit-rule scoring), minute and daily price replay, regime context, methodology playbooks, and daily reports. The pro tools need a credential (${PRICE_MONTHLY}/mo subscription, ${TRIAL_DAYS}-day free trial): an OAuth 2.1 sign-in at ${MCP_PRO_ENDPOINT}, or a bearer API key. The free tier needs neither. Paper-traded research data, educational only, not investment advice.`,
  url: MCP_ENDPOINT,
  documentation: "https://gammarips.com/developers",
  provider: {
    "@type": "Organization",
    name: "GammaRips",
    url: "https://gammarips.com",
  },
};

/* FAQ. Single source of truth for both the rendered section and the FAQPage
 * JSON-LD below, so the two can never drift.
 *
 * SEO intent: GSC (90d to 2026-08-05) has `options flow api` at position 24.2,
 * page 3 on the one query with real buyer intent that matches this product.
 * These answers are the literal question-and-answer form of facts stated
 * elsewhere on this page, which is also what FAQPage structured data wants.
 *
 * Every answer here is descriptive of the product surface. None asserts a
 * return, a win rate, a timing advantage, or a trade to follow (see the
 * forbidden-claims list in CLAUDE.md). */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Is there a GammaRips options flow API?",
    a: `Yes. The GammaRips options flow API is an MCP server at ${MCP_ENDPOINT}, served over Streamable HTTP, with ${TOOL_COUNT} tools. Claude, ChatGPT, Cursor, Codex, and any other MCP client can call it, and so can an ordinary HTTP client. The free tier needs no key and no card. The pro tools take an OAuth 2.1 sign-in at ${MCP_PRO_ENDPOINT}, or a bearer API key on either endpoint.`,
  },
  {
    q: "What options flow data does the API return?",
    a: "The nightly pool: roughly 40 to 50 bullish names, each with its overnight score, flow dollars, thesis, technicals, catalyst, and one out-of-the-money call selected on contract liquidity. Also point-in-time feature vectors from a leakage-safe view, fresh liquidity for any pool contract, the exit lab (opportunity surfaces, how often past contracts touched each profit level, and a score for any target and stop), minute and daily price replay, regime context, the daily reports, and the methodology playbooks.",
  },
  {
    q: "Is the options flow data real time or overnight?",
    a: "Overnight. The scan runs after the close across about 3,500 optionable US stocks. It keeps the 100 most liquid names, takes the bullish ones, and selects one out-of-the-money call in each on contract liquidity. The pool holds roughly 40 to 50 contracts and publishes each trading morning. Liquidity decides membership, and flow gives context. For the entry window, get_liquidity reads fresh open interest and session volume on any pool contract.",
  },
  {
    q: "How do I connect Claude, ChatGPT, Cursor, or Codex?",
    a: `Each client has its own steps on this page. In Claude Code, run: claude mcp add --transport http gammarips ${MCP_ENDPOINT} for the free tier. In the Claude app and ChatGPT, add ${MCP_ENDPOINT} as a custom connector to try it free, or add ${MCP_PRO_ENDPOINT} and sign in with your GammaRips account for Pro. Cursor and Codex take one config entry, with your API key or a sign-in. GammaRips plugins are being submitted to the Claude directory, the ChatGPT and Codex plugin directory, and cursor.directory.`,
  },
  {
    q: "Why doesn't the API just tell me what to buy?",
    a: "Because your AI can build a plan for your account and your risk: 1 to 3 candidates that pass the liquidity and earnings checks, each with an entry, a target and a stop set from history, and a size. One shared list crowds everyone into the same contracts. A plan built from the data, for your account, does not. You decide on every trade. All data is educational only and not investment advice.",
  },
  {
    q: "What does the options flow API cost?",
    a: `The free tier costs nothing: the pool preview, daily reports, regime context, the market calendar, and the methodology playbooks. Pro opens all ${TOOL_COUNT} tools for ${PRICE_MONTHLY}/mo, the founding price for the first ${FOUNDING_CAP} subscribers, with a ${TRIAL_DAYS}-day free trial. The whole website is free.`,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

/* The three pillars. Every number comes from src/lib/receipts.ts with its N
 * and window, and the section carries RECEIPTS_DISCLAIMER (claim 5). */
const PILLARS: {
  title: string;
  body: string;
  stat: string;
  statLabel: string;
  source: string;
}[] = [
  {
    title: "Better-quality contracts every night",
    body: "The 100 most liquid optionable names, bullish only, and one out-of-the-money call per name, selected on contract liquidity. Your AI starts from contracts it can enter and exit near the quote.",
    stat: int(CONTRACT_QUALITY.medianOi.after),
    statLabel: `median open interest, vs ${int(CONTRACT_QUALITY.medianOi.before)} before the liquidity rule`,
    source: `N=${int(CONTRACT_QUALITY.nAfter)} ${CONTRACT_QUALITY.afterLabel}, vs N=${int(CONTRACT_QUALITY.nBefore)} over ${CONTRACT_QUALITY.beforeLabel}.`,
  },
  {
    title: "The exit lab",
    body: "How often past pool contracts hit +25%, +50%, and +100% within 3 trading days, how far they moved for and against, and a score for any target and stop. Most contracts move both ways, so your AI sets the exit from history.",
    stat: pct(POOL_HIT_RATES.hit50, 1),
    statLabel: `of pool contracts hit +50% within ${POOL_HIT_RATES.horizon}`,
    source: `N=${int(POOL_HIT_RATES.n)}, ${POOL_HIT_RATES.windowLabel}. +25%: ${pct(POOL_HIT_RATES.hit25, 1)}. +100%: ${pct(POOL_HIT_RATES.hit100, 1)}. In the same window, ${pct(POOL_HIT_RATES.stopTouch30, 1)} also touched −30%, which is why the exit plan matters.`,
  },
  {
    title: "Your AI builds the trade plan",
    body: "Ask for a trade. Your AI shortlists 1 to 3 candidates that pass the liquidity and earnings checks, then gives the entry, target, stop, maximum loss, and size. If nothing passes, it tells you why. You decide.",
    stat: "1 to 3",
    statLabel: "candidates per plan, each with entry, target, stop, and size",
    source: "Built by your AI from GammaRips data, for your account and your risk budget.",
  },
];

/* Per-client connect steps. The homepage install buttons link to these ids
 * (INSTALL_LINKS in src/lib/receipts.ts), so keep claude, chatgpt, cursor and
 * codex exactly. Steps that src/lib/connect-clients.ts already holds come from
 * there (checked against vendor docs). The OAuth sign-in blocks below follow
 * the engine repo's docs/GTM-CLIENT-CONNECT-MATRIX.md: vendor-documented UI
 * steps plus the /pro sign-in, which passed a full OAuth flow per client
 * profile against production on 2026-08-22. */
type Block = { title: string; pro: boolean; intro: string; steps: ConnectStep[] };

function fromClient(id: ClientId, tier: "free" | "pro", title: string): Block {
  const c = CONNECT_CLIENTS.find((x) => x.id === id);
  const part = c ? c[tier] : { intro: "", steps: [] };
  return { title, pro: tier === "pro", intro: part.intro, steps: part.steps };
}

const SIGN_IN_DONE = `Approve access on gammarips.com with the account that carries your subscription. All ${TOOL_COUNT} tools appear, and the token refreshes itself from then on.`;

const CLIENT_SECTIONS: { id: string; label: string; plugin: string; blocks: Block[] }[] = [
  {
    id: "claude",
    label: "Claude",
    plugin:
      "The GammaRips plugin for Claude is being submitted to the Claude directory. These steps connect the same server today, in Claude Code and in the Claude app.",
    blocks: [
      fromClient("claude-code", "free", "Claude Code"),
      fromClient("claude-code", "pro", "Claude Code with Pro"),
      fromClient("claude", "free", "Claude app"),
      {
        title: "Claude app with Pro",
        pro: true,
        intro: "No key to paste. Add the Pro URL as a custom connector and sign in.",
        steps: [
          { text: "Open Customize, then Connectors, then Add custom connector." },
          { text: "Paste the Pro URL and add it.", code: MCP_PRO_ENDPOINT },
          { text: `Claude opens the GammaRips sign-in. ${SIGN_IN_DONE}` },
        ],
      },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    plugin:
      "The GammaRips plugin is being submitted to the ChatGPT and Codex plugin directory. These steps connect the same server today.",
    blocks: [
      fromClient("chatgpt", "free", "ChatGPT"),
      {
        title: "ChatGPT with Pro",
        pro: true,
        intro: "No key to paste. Add the Pro URL and sign in.",
        steps: [
          { text: "Settings, then Security and login, then turn Developer mode on." },
          {
            text: "Open Plugins, press +, enter a name and the Pro URL, and set Authentication to OAuth.",
            code: MCP_PRO_ENDPOINT,
          },
          { text: `ChatGPT opens the GammaRips sign-in. ${SIGN_IN_DONE}` },
        ],
      },
    ],
  },
  {
    id: "cursor",
    label: "Cursor",
    plugin:
      "The GammaRips plugin is coming to cursor.directory. These steps connect the same server today.",
    blocks: [
      fromClient("cursor", "free", "Cursor"),
      fromClient("cursor", "pro", "Cursor with Pro, using your key"),
      {
        title: "Cursor with Pro, signing in",
        pro: true,
        intro: "Skip the key. Point Cursor at the Pro URL with no headers.",
        steps: [
          {
            text: "Add the Pro URL.",
            code: `{\n  "mcpServers": {\n    "gammarips": { "url": "${MCP_PRO_ENDPOINT}" }\n  }\n}`,
          },
          { text: `Cursor runs the OAuth sign-in for the server. ${SIGN_IN_DONE}` },
        ],
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    plugin:
      "The GammaRips plugin is being submitted to the ChatGPT and Codex plugin directory. These steps connect the same server today.",
    blocks: [
      fromClient("codex", "free", "Codex"),
      fromClient("codex", "pro", "Codex with Pro, using your key"),
      {
        title: "Codex with Pro, signing in",
        pro: true,
        intro: "Skip the key. Point Codex at the Pro URL, then log in once.",
        steps: [
          {
            text: "Set the Pro URL in ~/.codex/config.toml.",
            code: `[mcp_servers.gammarips]\nurl = "${MCP_PRO_ENDPOINT}"`,
          },
          { text: `Run the login. ${SIGN_IN_DONE}`, code: "codex mcp login gammarips" },
        ],
      },
    ],
  },
];

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

type Tier = "free" | "pro" | "free-preview";
const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  pro: "Pro",
  "free-preview": "Free preview · Pro full",
};

const toolGroups: {
  group: string;
  blurb: string;
  tools: { name: string; tier: Tier; description: string }[];
}[] = [
  {
    group: "The pool",
    blurb:
      "The 100 most liquid optionable names, bullish only, one out-of-the-money call each, selected on contract liquidity. Roughly 40 to 50 contracts, structured for your AI.",
    tools: [
      {
        name: "get_pool",
        tier: "free-preview",
        description:
          "The candidate pool for a scan date, in one tool. view=preview is the free public view: ticker, direction, score, headline, flow dollars. The full pool comes with Pro: view=enriched (thesis, technicals, catalyst, the selected contract, the 60-day momentum feature), view=raw (the wide pre-curation scan), and view=features (point-in-time feature vectors from the leakage-safe view).",
      },
      {
        name: "get_signal",
        tier: "pro",
        description:
          "Deep dive on one ticker. view=detail is the full enriched signal (thesis, catalyst, the selected contract, point-in-time features). view=earnings checks for an earnings date on or before the contract expiration. The pool can carry earnings-window names, so your AI runs this check on each candidate.",
      },
      {
        name: "get_liquidity",
        tier: "pro",
        description:
          "Fresh entry-day liquidity, beyond the pool's session-frozen snapshot. Pass one contract for its live open interest, session volume, last trade, and greeks, or omit it to read the whole pool in one call for the 10:00 ET decision window. Bid and ask are not on the current data plan.",
      },
    ],
  },
  {
    group: "The exit lab and outcome history",
    blurb: "The history your AI uses to set the target and the stop.",
    tools: [
      {
        name: "query_outcomes",
        tier: "pro",
        description:
          "The exit lab and the outcome history, in one tool with nine views. view=harvest gives how often past pool contracts touched each profit level and each stop. view=surface is the opportunity surface: realized peak and drawdown per contract with no exit applied. view=exit_rule scores your own target, stop, and horizon. view=labels and view=summary are row-level and grouped bracket outcomes. view=positions and view=performance hold the record of the engine's retired paper test.",
      },
      {
        name: "replay_contract",
        tier: "pro",
        description:
          "The raw option price tape for your own entry and exit rule. granularity=minute returns the intraday minute path for one session and, if you pass a bracket, the exact first-crossing sequence. granularity=day returns the daily mark series. Your AI applies its own rule to real bars.",
      },
    ],
  },
  {
    group: "Free context, methodology, and reports",
    blurb: "The reference layer that keeps your AI's answers grounded. No key needed.",
    tools: [
      {
        name: "get_regime_context",
        tier: "free",
        description:
          "Point-in-time volatility regime for a scan date: VIX versus VIX3M and the engine's regime rail evaluated on those values.",
      },
      {
        name: "get_market_calendar_status",
        tier: "free",
        description:
          "view=status answers whether the US market is open today, from the deterministic NYSE calendar with holidays and early closes. view=scan_dates lists which recent scan dates have GammaRips data. view=freshness confirms that the pool your AI reads is the right pool for the session.",
      },
      {
        name: "get_playbook",
        tier: "free",
        description:
          "Methodology and reference. Pass a name for a playbook in markdown: start-here, exit-lab, daily-workflow, and the bracket-tournament selection pattern your AI runs against your own objective. Pass field= for the plain-English definition of any signal field. Pass name=schema for the machine-readable data contract: every column with its leakage classification and as-of boundary.",
      },
      {
        name: "get_daily_report",
        tier: "free",
        description:
          "view=report is the full daily intelligence report in markdown, the editorial synthesis of the scan. view=list returns the recent reports.",
      },
    ],
  },
];

export default function DevelopersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApiSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-16">
        {/* Hero */}
        <section className="text-center py-12 space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            The options-flow data layer for AI agents
          </p>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
            Give your AI better contracts
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              and the history to plan the exit.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {TOOL_COUNT} MCP tools for Claude, ChatGPT, Cursor, and Codex. Every
            night your AI gets a pool of liquid option contracts, the exit lab,
            and the checks to build a trade plan with you: entry, target, stop,
            and size. You decide.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {INSTALL_LINKS.map((l) => (
              <Button key={l.id} asChild variant="outline" size="lg">
                <a href={`#${l.id}`}>Add to {l.label}</a>
              </Button>
            ))}
          </div>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/pricing">Start your {TRIAL_DAYS}-day free trial &rarr;</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Free tier: no card, no key, no signup. Pro: {PRICE_MONTHLY}/mo
            founding price, {TRIAL_DAYS}-day free trial.
          </p>
        </section>

        {/* Three pillars */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-center">
            What your AI gets
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PILLARS.map((p) => (
              <Card key={p.title} className="bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="font-headline text-lg">{p.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{p.body}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-3xl font-bold text-primary">{p.stat}</div>
                  <p className="text-sm text-foreground">{p.statLabel}</p>
                  <p className="text-xs text-muted-foreground pt-1">{p.source}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">{RECEIPTS_DISCLAIMER}</p>
        </section>

        {/* Connect, per client */}
        <section id="connect" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold font-headline">Connect your AI</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Try the free tier first: no card, no key, no signup. With Pro, sign
              in at {MCP_PRO_ENDPOINT} or send your API key, and all {TOOL_COUNT}{" "}
              tools open. Then ask your AI for a trade plan.
            </p>
          </div>

          {CLIENT_SECTIONS.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="scroll-mt-24 rounded-xl border bg-card/60 p-5 md:p-6 space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-headline">{s.label}</h3>
                <p className="text-sm text-muted-foreground">{s.plugin}</p>
              </div>
              {s.blocks.map((b) => (
                <div key={b.title} className="space-y-3 border-t border-border/60 pt-5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold font-headline">{b.title}</h4>
                    <Badge variant={b.pro ? "default" : "outline"} className="text-[10px]">
                      {b.pro ? `Pro, ${PRICE_MONTHLY}/mo` : "Free, no card, no key"}
                    </Badge>
                  </div>
                  {b.intro && <p className="text-sm text-muted-foreground">{b.intro}</p>}
                  <Steps steps={b.steps} />
                </div>
              ))}
              <div className="border-t border-border/60 pt-5">
                <Button asChild size="sm">
                  <Link href="/pricing">Start your {TRIAL_DAYS}-day free trial &rarr;</Link>
                </Button>
              </div>
            </div>
          ))}

          <div
            id="other-clients"
            className="scroll-mt-24 rounded-xl border bg-card/60 p-5 md:p-6 space-y-6"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-headline">Any other MCP client</h3>
              <p className="text-sm text-muted-foreground">
                Gemini CLI, Grok, and every other MCP client reach the same{" "}
                {TOOL_COUNT} tools. Add {MCP_ENDPOINT} for the free tier. For Pro,
                send your API key as an Authorization header, or add{" "}
                {MCP_PRO_ENDPOINT} in a client that supports OAuth and sign in.
              </p>
            </div>
            {[
              fromClient("gemini-cli", "free", "Gemini CLI"),
              fromClient("gemini-cli", "pro", "Gemini CLI with Pro"),
            ].map((b) => (
              <div key={b.title} className="space-y-3 border-t border-border/60 pt-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold font-headline">{b.title}</h4>
                  <Badge variant={b.pro ? "default" : "outline"} className="text-[10px]">
                    {b.pro ? `Pro, ${PRICE_MONTHLY}/mo` : "Free, no card, no key"}
                  </Badge>
                </div>
                {b.intro && <p className="text-sm text-muted-foreground">{b.intro}</p>}
                <Steps steps={b.steps} />
              </div>
            ))}
            <div className="space-y-3 border-t border-border/60 pt-5">
              <h4 className="font-semibold font-headline">Python (fastmcp)</h4>
              <pre className="p-3 bg-muted rounded text-xs md:text-sm text-left overflow-x-auto whitespace-pre-wrap break-all font-mono text-primary">
                <code>{`from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

transport = StreamableHttpTransport(
    "${MCP_ENDPOINT}",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
)
async with Client(transport) as client:
    pool = await client.call_tool("get_pool", {})
    print(pool)`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Reference */}
        <section id="docs" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold font-headline">Reference</h2>
          <div className="bg-muted/30 p-6 rounded-lg border font-mono text-sm overflow-x-auto">
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Endpoint:</span>
                <span className="text-foreground break-all">{MCP_ENDPOINT}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Transport:</span>
                <span className="text-foreground">Streamable HTTP (legacy SSE at /sse)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Auth:</span>
                <span className="text-foreground">Authorization: Bearer &lt;your API key&gt;</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Or sign in:</span>
                <span className="text-foreground break-all">{MCP_PRO_ENDPOINT} (OAuth 2.1, no key to paste)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Start with:</span>
                <span className="text-primary">get_playbook(&quot;start-here&quot;) · get_pool · query_outcomes</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-bold font-headline text-lg">Start from a working loop</h3>
            <p className="text-sm text-muted-foreground max-w-3xl">
              The harness is open source. It is a daily agent loop over these
              tools: grade tradeability, form a thesis, design the exit, record
              every decision as data, and score the whole pool after the close.
              Paper-only by default. Install it as a Claude Code plugin, or clone
              it and make it yours.
            </p>
            <pre className="p-3 bg-muted rounded text-xs md:text-sm text-left overflow-x-auto whitespace-pre-wrap break-all font-mono text-primary max-w-3xl">
              <code>{`/plugin marketplace add DevDizzle/gammarips-harness
/plugin install gammarips@gammarips`}</code>
            </pre>
            <p className="text-sm text-muted-foreground max-w-3xl">
              The plugin bundles the free endpoint and the loop skills. For the
              pro tools, export GAMMARIPS_MCP_KEY and start Claude Code again. Run
              the skills inside a clone of the repo, which holds the data
              directory and the scripts.
            </p>
            <a href={HARNESS_REPO} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                Clone the harness on GitHub &rarr;
              </Button>
            </a>
          </div>
        </section>

        {/* OAuth / sign-in path */}
        <section id="oauth" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold font-headline">Sign in instead of pasting a key</h2>
          <p className="text-muted-foreground">
            Chat clients sign in. {MCP_PRO_ENDPOINT} serves the same transport
            and the same {TOOL_COUNT} tools as {MCP_ENDPOINT}, and it answers an
            anonymous request with a challenge that names our authorization
            server. Your client follows it, you approve the consent screen with
            the account that carries your subscription, and the tools appear. The
            token refreshes itself and re-reads your subscription every time.
          </p>
          <div className="bg-muted/30 p-6 rounded-lg border font-mono text-sm overflow-x-auto">
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Pro endpoint:</span>
                <span className="text-foreground break-all">{MCP_PRO_ENDPOINT}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Auth server:</span>
                <span className="text-foreground break-all">https://gammarips.com</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Discovery:</span>
                <span className="text-foreground break-all">
                  /.well-known/oauth-protected-resource/pro (RFC 9728) and
                  /.well-known/oauth-authorization-server (RFC 8414)
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Grants:</span>
                <span className="text-foreground">authorization_code, refresh_token, client_credentials</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Registration:</span>
                <span className="text-foreground">dynamic (RFC 7591) or a client ID metadata document</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">PKCE:</span>
                <span className="text-foreground">S256, required</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Scope:</span>
                <span className="text-primary">mcp:read</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Nothing to register by hand: your client registers itself. Refresh
            tokens rotate, and replaying a spent one revokes the whole family.
            An API key also works on {MCP_PRO_ENDPOINT}, and {MCP_ENDPOINT}{" "}
            stays open, so the free tier never needs an account.
          </p>
          <div className="space-y-2">
            <h3 className="font-bold font-headline text-lg">Headless agents</h3>
            <p className="text-sm text-muted-foreground">
              A cron job or a server-side agent has no browser to send you to.
              Create a machine client on your account page and use the
              client_credentials grant: your agent exchanges its client ID and
              secret for an access token and calls {MCP_PRO_ENDPOINT} directly.
              Revoke it there too, and the next mint fails.
            </p>
            <Link href="/account">
              <Button variant="outline" size="sm">Create a machine client &rarr;</Button>
            </Link>
          </div>
        </section>

        {/* Built-in prompts */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Built-in prompts</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            The server ships MCP prompts: ready-made workflows your AI can run
            over the tools. Each one ends in analysis that you decide on.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base text-primary">morning_brief</CardTitle>
                <CardDescription>
                  Market status → regime check → today&apos;s pool → historical
                  context by delta bucket → a briefing on the most interesting
                  candidates, with data caveats.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base text-primary">analyze_candidate</CardTitle>
                <CardDescription>
                  Deep-dive one name: enrichment, excursion history, realized
                  labels of similar setups, and the risks.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="font-mono text-base text-primary">run_your_own_tournament</CardTitle>
                <CardDescription>
                  The engine&apos;s bracket-tournament selection pattern, run by
                  YOUR AI against YOUR objective, horizon, and risk tolerance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline">{TOOL_COUNT} tools</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Every tool is leakage-checked: nothing your AI reads contains
              information that was not knowable at the time it is dated. The
              outcome history covers every pool candidate since April 2026 and
              grows every trading day. Full parameter schemas are
              self-describing over MCP.
            </p>
          </div>

          {toolGroups.map((g) => (
            <div key={g.group} className="space-y-3">
              <div className="flex items-baseline gap-3">
                <h3 className="text-lg font-bold font-headline">{g.group}</h3>
                <span className="text-xs text-muted-foreground">{g.blurb}</span>
              </div>
              <div className="grid gap-3">
                {g.tools.map((t) => (
                  <Card key={t.name}>
                    <CardHeader className="py-4">
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="font-mono text-base text-primary shrink-0">{t.name}</CardTitle>
                        <Badge variant={t.tier === "pro" ? "default" : "secondary"} className="shrink-0 whitespace-nowrap">
                          {TIER_LABEL[t.tier]}
                        </Badge>
                      </div>
                      <CardDescription>{t.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-foreground text-background text-xs font-bold rounded">
                FREE
              </div>
              <div className="text-sm text-muted-foreground mb-2">The website and the free MCP tier</div>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ The nightly pool, on the site</li>
                <li>✓ Daily reports and per-ticker deep dives</li>
                <li>✓ The scorecard and the Lab</li>
                <li>✓ Free MCP tools: pool preview, reports, regime, calendar, playbooks</li>
                <li>✓ Free forever, not a trial</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                THE PRODUCT
              </div>
              <div className="text-sm text-primary mb-2">Agent Access (MCP)</div>
              <div className="text-3xl font-bold mb-4">
                {PRICE_MONTHLY}<span className="text-base text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ All {TOOL_COUNT} tools and the built-in prompts</li>
                <li>✓ The full pool: thesis, technicals, catalyst, contract</li>
                <li>✓ The exit lab: hit rates, surfaces, exit-rule scoring</li>
                <li>✓ Fresh liquidity and earnings checks</li>
                <li>✓ Sign in with OAuth, or use an API key</li>
                <li>✓ {TRIAL_DAYS}-day free trial · cancel anytime</li>
              </ul>
              <p className="mt-4 text-sm text-foreground">
                Founding price: {PRICE_MONTHLY}/mo for the first {FOUNDING_CAP}{' '}
                subscribers, locked as long as you stay subscribed.{' '}
                {PRICE_STANDARD}/mo after that.
              </p>
              <Link href="/pricing" className="block mt-4">
                <Button className="w-full">Start your {TRIAL_DAYS}-day free trial &rarr;</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ: renders from the same FAQ array that builds the FAQPage JSON-LD */}
        <section id="faq" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold font-headline">
            Options flow API: common questions
          </h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-border/50 pb-6 last:border-0">
                <h3 className="text-lg font-semibold mb-2">{q}</h3>
                <p className="text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-2xl font-bold font-headline">Give your AI something real to plan with</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            With the pool, the exit lab, and the liquidity and earnings checks,
            your AI turns a question into a trade plan you can act on. Connect it
            in a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing">
              <Button size="lg">Start your {TRIAL_DAYS}-day free trial &rarr;</Button>
            </Link>
            <Link href="/signals">
              <Button variant="outline" size="lg">
                Browse the pool free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t bg-muted/5">
        <div className="container px-4 mx-auto text-center space-y-4">
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/mcp.json" className="hover:text-primary">
              mcp.json
            </Link>
            <Link href="/llms.txt" className="hover:text-primary">
              llms.txt
            </Link>
            <Link href="/.well-known/ai-plugin.json" className="hover:text-primary">
              ai-plugin.json
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Contact:{" "}
            <a
              href="mailto:evan@gammarips.com"
              className="underline hover:text-foreground"
            >
              evan@gammarips.com
            </a>
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            Paper-traded research data. Educational only. Not investment
            advice. Past results do not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
