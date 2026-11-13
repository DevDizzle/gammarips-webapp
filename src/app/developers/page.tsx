import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { INSTALL_LINKS } from '@/lib/receipts';

export const metadata = {
  title: "GammaRips MCP: Options Dataset & API Reference for AI Agents",
  description:
    `Connect GammaRips to Claude, ChatGPT, Cursor, or Codex. Stream the nightly Combo A options dataset, 10-minute intraday liquidity snapshots, and 3-day excursion outcomes across ${TOOL_COUNT} MCP tools.`,
  alternates: { canonical: "https://gammarips.com/developers" },
  openGraph: {
    images: [OG_IMAGE],
    title: "GammaRips MCP: Options Dataset & API Reference for AI Agents",
    description:
      `Nightly Combo A options dataset, 10-minute intraday liquidity snapshots, and 3-day outcome history in Claude, ChatGPT, Cursor, or Codex. ${TOOL_COUNT} MCP tools. ${PRICE_MONTHLY}/mo, ${TRIAL_DAYS}-day free trial.`,
    url: "https://gammarips.com/developers",
  },
};

const webApiSchema = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "GammaRips MCP",
  description:
    `Model Context Protocol (MCP) server for AI agents: ${TOOL_COUNT} tools covering the nightly Combo A options dataset, point-in-time feature vectors, 10-minute intraday contract liquidity snapshots, 3-day excursion outcome surfaces, minute and daily price replay, regime context, methodology playbooks, and daily macro reports. The Pro dataset requires a credential (${PRICE_MONTHLY}/mo subscription, ${TRIAL_DAYS}-day free trial): an OAuth 2.1 sign-in at ${MCP_PRO_ENDPOINT}, or a bearer API key (gr_live_...). The 3-contract free preview tier at ${MCP_ENDPOINT} needs neither. Educational market data only, not investment advice.`,
  url: MCP_ENDPOINT,
  documentation: "https://gammarips.com/developers",
  provider: {
    "@type": "Organization",
    name: "GammaRips",
    url: "https://gammarips.com",
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Is there a GammaRips options flow API?",
    a: `Yes. The GammaRips API is a remote Model Context Protocol (MCP) server served over Streamable HTTP with ${TOOL_COUNT} tools. The anonymous free tier at ${MCP_ENDPOINT} serves the 3-contract pool preview, daily reports, regime context, market calendar, and methodology playbooks with no card and no key. The full Pro dataset (${PRICE_MONTHLY}/mo after a ${TRIAL_DAYS}-day free trial) is unlocked via OAuth 2.1 sign-in at ${MCP_PRO_ENDPOINT} or by passing a bearer API key (gr_live_...) in the Authorization header.`,
  },
  {
    q: "What data does the MCP server return?",
    a: "On Pro, your AI agent gets the full nightly Combo A pool (roughly 40 to 50 liquid bullish call contracts passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45), point-in-time feature vectors including Realized-vs-Implied Volatility (rv_iv_ratio), grounded news catalysts, 10-minute intraday liquidity snapshots during market hours, 3-day MFE/MAE outcome surfaces, minute and daily contract price replay, VIX/VIX3M regime context, daily reports, and methodology playbooks.",
  },
  {
    q: "Is the dataset real-time or overnight?",
    a: "Both overnight and intraday. The EOD scanner runs at 23:00 ET across ~3,500 optionable US stocks, enrichment completes at 05:30 ET, and the clean dbt feature view publishes by 06:30–07:00 ET. Then from 09:02 to 16:52 ET, the pipeline captures 10-minute intraday liquidity snapshots (get_liquidity) so your AI verifies morning open interest and active session volume before planning an entry.",
  },
  {
    q: "How do I connect Claude, ChatGPT, Cursor, or Codex?",
    a: `Each client has copy-paste setup steps below (#connect). In Claude Code, run: claude mcp add --transport http gammarips ${MCP_ENDPOINT} for the free 3-contract preview, or connect ${MCP_PRO_ENDPOINT} (OAuth) or pass your gr_live_ bearer key for the full Pro dataset. In Claude Desktop/Web and ChatGPT, add ${MCP_PRO_ENDPOINT} as a custom connector and sign in via OAuth 2.1. Cursor and Codex take a single config entry.`,
  },
  {
    q: "Why doesn't the API return a single daily pick?",
    a: "Shared picks crowd every subscriber into the same option strike at the open, degrading execution fills. Moreover, our Catalyst Lab walk-forward XGBoost audit showed black-box composite scores fail out-of-sample once schema missingness is stripped, whereas transparent microstructure and volatility primitives (Combo A) hold up cleanly. We serve the curated dataset and historical excursion surfaces so your AI builds a plan tailored to your risk budget. All data is educational only and not investment advice.",
  },
  {
    q: "What does Pro MCP access cost?",
    a: `The 3-contract preview tier at ${MCP_ENDPOINT} is $0 forever (pool preview, daily reports, regime context, market calendar, playbooks). Pro unlocks all ${TOOL_COUNT} tools and the full 40–50 contract daily dataset for ${PRICE_MONTHLY}/mo—the founding price for the first ${FOUNDING_CAP} subscribers (${PRICE_STANDARD}/mo after)—starting with a ${TRIAL_DAYS}-day free trial.`,
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

/* Per-client connect steps. Keep #connect, #claude, #chatgpt, #cursor, and #codex
 * anchors intact for homepage and post-checkout links. */
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
      "Connect GammaRips in Claude Code (CLI) or in the Claude desktop and web apps.",
    blocks: [
      fromClient("claude-code", "free", "Claude Code (Free 3-contract preview)"),
      fromClient("claude-code", "pro", "Claude Code with Pro (API key or OAuth)"),
      fromClient("claude", "free", "Claude app (Free 3-contract preview)"),
      {
        title: "Claude app with Pro (OAuth sign-in)",
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
      "Connect GammaRips in ChatGPT Developer Mode via OAuth (Pro) or No Auth (Free preview).",
    blocks: [
      fromClient("chatgpt", "free", "ChatGPT (Free 3-contract preview)"),
      {
        title: "ChatGPT with Pro (OAuth sign-in)",
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
      "Connect GammaRips in Cursor via .cursor/mcp.json or ~/.cursor/mcp.json.",
    blocks: [
      fromClient("cursor", "free", "Cursor (Free 3-contract preview)"),
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
      "Connect GammaRips in ~/.codex/config.toml with a bearer token env var or OAuth login.",
    blocks: [
      fromClient("codex", "free", "Codex (Free 3-contract preview)"),
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
  "free-preview": "Free 3-contract preview · Pro full pool",
};

const toolGroups: {
  group: string;
  blurb: string;
  tools: { name: string; tier: Tier; description: string }[];
}[] = [
  {
    group: "The Combo A dataset & intraday liquidity",
    blurb:
      "The nightly filtered options dataset (40–50 bullish calls passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45) plus 10-minute intraday liquidity snapshots.",
    tools: [
      {
        name: "get_pool",
        tier: "free-preview",
        description:
          "The candidate pool for a scan date. view=preview is the free 3-contract preview (ticker, direction, score, headline, flow dollars). Pro unlocks the full 40–50 contract dataset: view=enriched (thesis, technicals, rv_iv_ratio, grounded catalyst, selected contract), view=raw (wide pre-curation scan), and view=features (point-in-time feature vectors from enriched_features_v1).",
      },
      {
        name: "get_signal",
        tier: "pro",
        description:
          "Deep dive on one ticker. view=detail returns the full enriched signal (thesis, catalyst, selected contract, point-in-time features). view=earnings checks for an earnings date on or before the contract expiration.",
      },
      {
        name: "get_liquidity",
        tier: "pro",
        description:
          "10-minute intraday liquidity snapshots (09:02–16:52 ET) beyond the overnight session-frozen scan. Pass one contract for its current open interest, active session volume, last trade, and greeks, or omit it to inspect the whole pool before entry.",
      },
    ],
  },
  {
    group: "3-day excursion outcomes & contract replay",
    blurb: "Historical MFE/MAE outcome surfaces and minute/daily option price bars.",
    tools: [
      {
        name: "query_outcomes",
        tier: "pro",
        description:
          "Query BigQuery enriched_option_outcomes across historical pool cohorts. view=harvest gives touch probabilities across profit and drawdown levels. view=surface returns the unclipped 3-day Maximum Favorable Excursion (MFE) and Maximum Adverse Excursion (MAE) per contract. view=exit_rule evaluates any target, stop, and hold horizon you specify.",
      },
      {
        name: "replay_contract",
        tier: "pro",
        description:
          "Raw option price tape for backtesting and review. granularity=minute returns the intraday minute path for a session and, if passed a bracket, the exact first-crossing sequence. granularity=day returns daily mark series.",
      },
    ],
  },
  {
    group: "Free context, methodology, and reports",
    blurb: "Reference tools available on both /mcp (free) and /pro.",
    tools: [
      {
        name: "get_regime_context",
        tier: "free",
        description:
          "Point-in-time volatility regime for a scan date: VIX versus VIX3M term structure.",
      },
      {
        name: "get_market_calendar_status",
        tier: "free",
        description:
          "view=status checks whether the NYSE is open today (including holidays and early closes). view=scan_dates lists available scan dates. view=freshness verifies that tonight's pool is published.",
      },
      {
        name: "get_playbook",
        tier: "free",
        description:
          "Methodology and schema reference in markdown: start-here, daily-workflow, field definitions (field=), and the machine-readable point-in-time leakage contract (name=schema).",
      },
      {
        name: "get_daily_report",
        tier: "free",
        description:
          "view=report returns the full daily macro and options-flow intelligence report in markdown. view=list returns recent reports.",
      },
    ],
  },
];

export const revalidate = 3600;

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
            MCP API &amp; Tool Reference
          </p>
          <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
            Stream the nightly options dataset
            <span className="block mt-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              into Claude, ChatGPT, Cursor, or Codex.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {TOOL_COUNT} MCP tools serving the Combo A options dataset, 10-minute
            intraday liquidity snapshots, and 3-day excursion outcome surfaces.
            Start with a {TRIAL_DAYS}-day free trial of Pro ({PRICE_MONTHLY}/mo) or
            test the 3-contract preview on <code className="text-base text-foreground">/mcp</code>.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link href="/pricing">Get Pro MCP Access ({PRICE_MONTHLY}/mo) &rarr;</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            {INSTALL_LINKS.map((l) => (
              <Button key={l.id} asChild variant="outline" size="sm">
                <a href={`#${l.id}`}>Add to {l.label}</a>
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Free tier (<code className="text-foreground">{MCP_ENDPOINT}</code>): 3-contract preview, no card, no key. Pro (<code className="text-foreground">{MCP_PRO_ENDPOINT}</code> or <code className="text-foreground">gr_live_</code> key): full 40–50 contract dataset, {TRIAL_DAYS}-day free trial.
          </p>
        </section>

        {/* Connect, per client */}
        <section id="connect" className="scroll-mt-24 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold font-headline">Connect your AI client</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Use <code className="text-xs text-foreground">{MCP_ENDPOINT}</code> for the anonymous 3-contract preview, or unlock all {TOOL_COUNT} tools and the full daily pool via OAuth 2.1 at <code className="text-xs text-foreground">{MCP_PRO_ENDPOINT}</code> or a <code className="text-xs text-foreground">gr_live_</code> bearer API key.
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
                      {b.pro ? `Pro, ${PRICE_MONTHLY}/mo` : "Free 3-contract preview"}
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
              <h3 className="text-xl font-bold font-headline">Gemini CLI, Grok &amp; Python SDK</h3>
              <p className="text-sm text-muted-foreground">
                Gemini CLI, Grok, and any other MCP client reach the same{" "}
                {TOOL_COUNT} tools. Add {MCP_ENDPOINT} for the free 3-contract preview. For Pro,
                send your <code className="text-xs text-foreground">gr_live_</code> API key as an Authorization header, or add{" "}
                {MCP_PRO_ENDPOINT} in an OAuth-capable client and sign in.
              </p>
            </div>
            {[
              fromClient("gemini-cli", "free", "Gemini CLI (Free 3-contract preview)"),
              fromClient("gemini-cli", "pro", "Gemini CLI with Pro"),
            ].map((b) => (
              <div key={b.title} className="space-y-3 border-t border-border/60 pt-5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold font-headline">{b.title}</h4>
                  <Badge variant={b.pro ? "default" : "outline"} className="text-[10px]">
                    {b.pro ? `Pro, ${PRICE_MONTHLY}/mo` : "Free 3-contract preview"}
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
    pool = await client.call_tool("get_pool", {"view": "enriched"})
    print(pool)`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Reference */}
        <section id="docs" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold font-headline">Endpoint &amp; Harness Reference</h2>
          <div className="bg-muted/30 p-6 rounded-lg border font-mono text-sm overflow-x-auto">
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Free Preview Endpoint:</span>
                <span className="text-foreground break-all">{MCP_ENDPOINT} (3-contract preview, no auth)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Pro OAuth Endpoint:</span>
                <span className="text-foreground break-all">{MCP_PRO_ENDPOINT} (OAuth 2.1 or Bearer key)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Transport:</span>
                <span className="text-foreground">Streamable HTTP (legacy SSE at /sse)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">API Key Header:</span>
                <span className="text-foreground">Authorization: Bearer gr_live_...</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">Start with:</span>
                <span className="text-primary">get_playbook(&quot;start-here&quot;) · get_pool · get_liquidity · query_outcomes</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-bold font-headline text-lg">Open-Source Agent Harness</h3>
            <p className="text-sm text-muted-foreground max-w-3xl">
              The open-source <code className="text-xs text-foreground">gammarips-harness</code> provides a ready-to-run daily agent workflow over these MCP tools—combining Stage 1 dataset screening with live X/web catalyst research, exit bracket evaluation, and structured trade logging.
            </p>
            <pre className="p-3 bg-muted rounded text-xs md:text-sm text-left overflow-x-auto whitespace-pre-wrap break-all font-mono text-primary max-w-3xl">
              <code>{`/plugin marketplace add DevDizzle/gammarips-harness
/plugin install gammarips@gammarips`}</code>
            </pre>
            <a href={HARNESS_REPO} target="_blank" rel="noopener noreferrer" className="inline-block pt-1">
              <Button variant="outline" size="sm">
                Clone gammarips-harness on GitHub &rarr;
              </Button>
            </a>
          </div>
        </section>

        {/* OAuth / sign-in path */}
        <section id="oauth" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold font-headline">OAuth 2.1 &amp; Machine Credentials</h2>
          <p className="text-muted-foreground">
            Chat clients connect to <code className="text-xs text-foreground">{MCP_PRO_ENDPOINT}</code> and authenticate via OAuth 2.1 (RFC 9728 / RFC 8414) using the account that carries your Pro subscription. Headless agents can use a <code className="text-xs text-foreground">gr_live_</code> bearer key or exchange <code className="text-xs text-foreground">client_credentials</code> minted on your <Link href="/account" className="text-primary hover:underline">account page</Link>.
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
                <span className="text-foreground">dynamic (RFC 7591) or client ID metadata document (CIMD)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-muted-foreground">PKCE &amp; Scope:</span>
                <span className="text-primary">S256 · mcp:read</span>
              </div>
            </div>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline">All {TOOL_COUNT} MCP Tools</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Every tool is point-in-time and leakage-checked. Full parameter schemas are self-describing over MCP.
            </p>
          </div>

          {toolGroups.map((g) => (
            <div key={g.group} className="space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
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

        {/* Tiers */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Free Preview vs. Pro Dataset</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg border bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-foreground text-background text-xs font-bold rounded">
                FREE PREVIEW
              </div>
              <div className="text-sm text-muted-foreground mb-2">Anonymous /mcp &amp; /signals preview</div>
              <div className="text-3xl font-bold mb-4">$0</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Daily 3-contract pool preview on web and MCP (<code className="text-xs">get_pool(view=&quot;preview&quot;)</code>)</li>
                <li>✓ Daily macro &amp; options-flow reports</li>
                <li>✓ Point-in-time VIX/VIX3M regime context &amp; NYSE calendar</li>
                <li>✓ Methodology &amp; schema playbooks</li>
                <li>✓ No card, no key, no account required</li>
              </ul>
            </div>
            <div className="p-6 rounded-lg border-2 border-primary bg-card relative">
              <div className="absolute -top-3 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded">
                PRO DATASET
              </div>
              <div className="text-sm text-primary mb-2">Full MCP Access (/pro or gr_live_ key)</div>
              <div className="text-3xl font-bold mb-4">
                {PRICE_MONTHLY}<span className="text-base text-muted-foreground">/mo</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Full daily Combo A pool (roughly 40–50 enriched contracts)</li>
                <li>✓ Point-in-time feature vectors (<code className="text-xs">rv_iv_ratio</code>, technicals, grounded catalysts)</li>
                <li>✓ Live 10-minute intraday liquidity snapshots (<code className="text-xs">get_liquidity</code>)</li>
                <li>✓ Historical 3-day MFE/MAE outcome surfaces &amp; minute/daily contract replay</li>
                <li>✓ OAuth 2.1 sign-in at <code className="text-xs">/pro</code> or <code className="text-xs">gr_live_</code> API key</li>
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

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold font-headline">
            Options flow MCP API: common questions
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
            Educational market data only. Not investment advice. Past results do not guarantee future results.
          </p>
        </div>
      </footer>
    </div>
  );
}
