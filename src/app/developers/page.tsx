import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Disclosure } from "@/components/ui/disclosure";
import Link from "next/link";
import {
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  FOUNDING_CAP,
  HARNESS_REPO,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
  OG_IMAGE,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
  PRICE_STANDARD,
  TOOL_COUNT,
  TRIAL_DAYS,
} from '@/lib/constants';
import { CONNECT_CLIENTS, type ClientId, type ConnectStep } from '@/lib/connect-clients';
import { INSTALL_LINKS } from '@/lib/receipts';
import { AgentQuickConnect, ProAwareCta } from '@/components/account/agent-quick-connect';

// Root layout applies `%s | GammaRips` — never add `| GammaRips` here.
export const metadata = {
  title: "Trading & Market Data MCP Server for AI Agents",
  description:
    `Connect Claude, ChatGPT, Cursor, or Codex to ${TOOL_COUNT} MCP tools: nightly US stock, 2x ETF & options setups, 10-minute liquidity snapshots, and 3-day move history.`,
  alternates: { canonical: "https://gammarips.com/developers" },
  openGraph: {
    images: [OG_IMAGE],
    title: "Trading & Market Data MCP Server for AI Agents | GammaRips",
    description:
      `Nightly US stock, 2x/inverse ETF & options setups, live 10-minute liquidity snapshots, and 3-day move history in Claude, ChatGPT, Cursor, or Codex. ${TOOL_COUNT} MCP tools.`,
    url: "https://gammarips.com/developers",
  },
};

const webApiSchema = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  name: "GammaRips Trading & Market Data MCP Server",
  description:
    `Remote Model Context Protocol (MCP) server for AI trading agents: ${TOOL_COUNT} tools serving nightly pre-filtered US market setups mapped to stocks, 2x/inverse single-stock ETFs, and liquid options, live 10-minute intraday liquidity snapshots, 3-day move history (MFE/MAE), price replay, volatility regime context, daily briefings, and methodology playbooks. Free 3-setup preview at ${MCP_ENDPOINT}; Pro (${PRICE_MONTHLY}/mo or ${PRICE_ANNUAL}/yr, ${TRIAL_DAYS}-day trial) via OAuth 2.1 at ${MCP_PRO_ENDPOINT} or Bearer key. Educational market data only, not investment advice.`,
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
    q: "Does GammaRips work for stocks and 2x ETFs, or only options?",
    a: "It works for stocks, 2x/inverse single-stock ETFs, and options. Every candidate returned by get_pool and get_signal includes mapped execution_vehicles (underlying_stock, long_2x_etfs, inverse_etfs, and option_contract) so your AI agent can analyze institutional options flow and express trades in whichever instrument you prefer.",
  },
  {
    q: "Is there a free tier to test the MCP server?",
    a: `Yes. Connect any MCP client to ${MCP_ENDPOINT} with no card and no API key for the daily 3-setup preview, morning briefings, VIX/VIX3M volatility regime, NYSE market calendar, and methodology playbooks. Pro (${PRICE_MONTHLY}/mo or ${PRICE_ANNUAL}/yr after a ${TRIAL_DAYS}-day free trial) unlocks all 40–50 daily setups, live 10-minute liquidity checks, 3-day move history, and price replay via OAuth 2.1 (${MCP_PRO_ENDPOINT}) or a Bearer API key.`,
  },
  {
    q: "Is the data overnight or intraday?",
    a: "Both. The overnight scan runs at 23:00 ET across ~3,500 optionable US stocks, enriches volatility value, ETF mappings, and news catalysts at 05:30 ET, and publishes before the bell. During regular market hours (09:02–16:52 ET), get_liquidity serves fresh 10-minute snapshots of resting open interest and active session volume.",
  },
  {
    q: "How fast is setup in Claude, ChatGPT, Cursor, or Codex?",
    a: `Under two minutes. Copy the 1-click prompt below so your agent configures itself via gammarips.com/install.md, or paste ${MCP_PRO_ENDPOINT} into Claude Desktop/Web or ChatGPT Connectors and sign in with your browser.`,
  },
  {
    q: "Why doesn't the MCP return one single daily pick?",
    a: "Pushing one shared contract to every subscriber crowds everyone into the same price at the open, hurting fills. Walk-forward research also showed black-box single-pick scores fail out-of-sample, while transparent liquidity and volatility data holds up. Your AI builds a plan tailored to your risk rules.",
  },
  {
    q: "Can you build a custom automated trading bot around this MCP for me?",
    a: `Yes. On gammarips.com/build, we engineer fixed-scope Python trading agents for stocks, 2x/inverse ETFs, or options (Alpaca, Robinhood MCP, Tradier, or Interactive Brokers) in ${BUILD_TURNAROUND_DAYS} business days for ${BUILD_STANDARD_PRICE} flat, delivered in Paper Mode to your private GitHub repo.`,
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

type Block = { title: string; pro: boolean; intro: string; steps: ConnectStep[] };

function fromClient(id: ClientId, tier: "free" | "pro", title: string): Block {
  const c = CONNECT_CLIENTS.find((x) => x.id === id);
  const part = c ? c[tier] : { intro: "", steps: [] };
  return { title, pro: tier === "pro", intro: part.intro, steps: part.steps };
}

const SIGN_IN_DONE = `Approve access on gammarips.com with the account that carries your subscription. All ${TOOL_COUNT} tools appear immediately and refresh automatically.`;

const CLIENT_SECTIONS: { id: string; label: string; plugin: string; blocks: Block[] }[] = [
  {
    id: "claude",
    label: "Claude (Desktop, Web & Claude Code)",
    plugin: "Connect via 1-click browser OAuth in Claude Desktop/Web, or CLI command in Claude Code.",
    blocks: [
      fromClient("claude-code", "free", "Claude Code (Free 3-setup preview)"),
      fromClient("claude-code", "pro", "Claude Code with Pro (API key or OAuth)"),
      fromClient("claude", "free", "Claude app (Free 3-setup preview)"),
      {
        title: "Claude app with Pro (OAuth browser sign-in)",
        pro: true,
        intro: "No API key needed. Add the Pro URL as a custom connector and sign in.",
        steps: [
          { text: "Open Customize → Connectors → Add custom connector." },
          { text: "Paste the Pro URL and save.", code: MCP_PRO_ENDPOINT },
          { text: `Claude opens the GammaRips sign-in. ${SIGN_IN_DONE}` },
        ],
      },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    plugin: "Connect in ChatGPT Developer Mode via OAuth (Pro) or No Auth (Free preview).",
    blocks: [
      fromClient("chatgpt", "free", "ChatGPT (Free 3-setup preview)"),
      {
        title: "ChatGPT with Pro (OAuth browser sign-in)",
        pro: true,
        intro: "No API key needed. Add the Pro URL and sign in.",
        steps: [
          { text: "Open Settings → Security and login → enable Developer mode." },
          {
            text: "Open Plugins, press +, enter a name and the Pro URL, and select OAuth.",
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
    plugin: "Add one entry to .cursor/mcp.json or ~/.cursor/mcp.json.",
    blocks: [
      fromClient("cursor", "free", "Cursor (Free 3-setup preview)"),
      fromClient("cursor", "pro", "Cursor with Pro (API key)"),
      {
        title: "Cursor with Pro (OAuth browser sign-in)",
        pro: true,
        intro: "Skip the API key — point Cursor at the Pro URL with no headers.",
        steps: [
          {
            text: "Add the Pro URL to mcp.json.",
            code: `{\n  "mcpServers": {\n    "gammarips": { "url": "${MCP_PRO_ENDPOINT}" }\n  }\n}`,
          },
          { text: `Cursor triggers OAuth sign-in automatically. ${SIGN_IN_DONE}` },
        ],
      },
    ],
  },
  {
    id: "codex",
    label: "OpenAI Codex CLI",
    plugin: "Add one block to ~/.codex/config.toml with OAuth login or a Bearer token.",
    blocks: [
      fromClient("codex", "free", "Codex (Free 3-setup preview)"),
      fromClient("codex", "pro", "Codex with Pro (API key)"),
      {
        title: "Codex with Pro (OAuth sign-in)",
        pro: true,
        intro: "Skip the API key — point Codex at the Pro URL and log in once.",
        steps: [
          {
            text: "Set the Pro URL in ~/.codex/config.toml.",
            code: `[mcp_servers.gammarips]\nurl = "${MCP_PRO_ENDPOINT}"`,
          },
          { text: `Run the login command. ${SIGN_IN_DONE}`, code: "codex mcp login gammarips" },
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
  "free-preview": "Free 3-setup preview · Pro full pool",
};

const toolGroups: {
  group: string;
  blurb: string;
  tools: { name: string; tier: Tier; description: string }[];
}[] = [
  {
    group: "Daily market pool & live morning liquidity",
    blurb: "40–50 nightly liquid setups mapped to stocks, 2x/inverse ETFs & options, plus 10-minute morning depth checks.",
    tools: [
      {
        name: "get_pool",
        tier: "free-preview",
        description:
          "Returns today's candidate pool. view=preview gives the free 3-setup preview. Pro unlocks all 40–50 daily setups (view=enriched, raw, or features) complete with execution_vehicles (underlying_stock, long_2x_etfs, inverse_etfs, option_contract), rv_iv_ratio, technicals, and grounded news catalysts.",
      },
      {
        name: "get_signal",
        tier: "pro",
        description:
          "Deep dive on any single ticker. view=detail returns the full enriched setup, mapped ETFs/options, and catalysts. view=earnings checks whether an earnings date falls before contract expiration.",
      },
      {
        name: "get_liquidity",
        tier: "pro",
        description:
          "Live 10-minute intraday liquidity snapshots (09:02–16:52 ET). Query one contract or the entire pool to check fresh morning open interest, active volume, and greeks before planning an entry.",
      },
    ],
  },
  {
    group: "3-day move history & price replay",
    blurb: "Historical upside/pullback ranges (MFE/MAE) and minute/daily option price bars.",
    tools: [
      {
        name: "query_outcomes",
        tier: "pro",
        description:
          "Queries historical pool outcomes so your AI can calibrate targets and stops. view=harvest returns touch probabilities across profit and stop levels; view=surface returns 3-day upside (MFE) and drawdown (MAE) distributions; view=exit_rule scores custom target/stop rules.",
      },
      {
        name: "replay_contract",
        tier: "pro",
        description:
          "Historical minute or daily option price tape for backtesting and review, including exact first-crossing checks for custom target/stop brackets.",
      },
    ],
  },
  {
    group: "Free market regime, calendar, briefings & playbooks",
    blurb: "Always free on both /mcp and /pro.",
    tools: [
      {
        name: "get_regime_context",
        tier: "free",
        description: "Point-in-time market volatility regime: VIX versus VIX3M term structure.",
      },
      {
        name: "get_market_calendar_status",
        tier: "free",
        description: "Checks NYSE open/holiday/early-close status (view=status), scan dates, and tonight's dataset freshness.",
      },
      {
        name: "get_playbook",
        tier: "free",
        description: "Built-in workflow guides and field definitions (start-here, daily-workflow, schema) so your agent uses every tool accurately.",
      },
      {
        name: "get_daily_report",
        tier: "free",
        description: "Returns the full daily morning briefing in markdown (view=report) or lists recent briefings (view=list).",
      },
    ],
  },
];

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  "@id": "https://gammarips.com/developers#combo-a-dataset",
  name: "GammaRips Nightly US Market & Options Intelligence Dataset",
  description:
    "Nightly curated US stock, 2x/inverse ETF, and options-flow dataset for AI trading agents. Screens ~3,500 US stocks to 40–50 liquid setups passing Combo A contract floors (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45), enriched with rv_iv_ratio, mapped execution_vehicles, technicals, grounded catalysts, live 10-minute liquidity snapshots, and 3-day move history. Educational market data only, not investment advice.",
  url: "https://gammarips.com/developers",
  license: "https://gammarips.com/terms",
  isAccessibleForFree: true,
  temporalCoverage: "2026-04-10/..",
  creator: [
    { "@type": "Organization", name: "GammaRips", url: "https://gammarips.com" },
    { "@type": "Person", name: "Evan Parra", jobTitle: "Founder & CEO", url: "https://gammarips.com/about" },
  ],
  variableMeasured: [
    "execution_vehicles",
    "rv_iv_ratio",
    "recommended_mid_price",
    "recommended_oi",
    "recommended_delta",
    "recommended_dte",
    "intraday_10m_open_interest",
    "3_day_mfe_mae_excursion",
    "vix_vix3m_regime",
  ],
  distribution: [
    {
      "@type": "DataDownload",
      name: "GammaRips Free 3-Setup Preview MCP",
      contentUrl: MCP_ENDPOINT,
      encodingFormat: "application/json",
    },
    {
      "@type": "DataDownload",
      name: "GammaRips Pro Full Dataset MCP (OAuth 2.1 / Bearer)",
      contentUrl: MCP_PRO_ENDPOINT,
      encodingFormat: "application/json",
    },
  ],
};

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-14">
        {/* Hero */}
        <section className="text-center py-8 sm:py-10 space-y-5">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Trading &amp; Market Data MCP Server
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold font-headline tracking-tight max-w-4xl mx-auto">
            Market &amp; options intelligence MCP
            <span className="block mt-1.5 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              for Claude, ChatGPT, Cursor &amp; Codex.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {TOOL_COUNT} plug-and-play MCP tools delivering nightly US stock, 2x/inverse ETF, and
            options setups, live 10-minute morning liquidity, and 3-day move history. Test the free
            3-setup preview on <code className="text-sm text-foreground">/mcp</code> or start a{' '}
            {TRIAL_DAYS}-day Pro trial ({PRICE_MONTHLY}/mo or {PRICE_ANNUAL}/yr).
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <ProAwareCta />
            <Button asChild variant="outline" size="lg">
              <Link href="/build">Or Hire Us to Build Your Bot ({BUILD_STANDARD_PRICE})</Link>
            </Button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {INSTALL_LINKS.map((l) => (
              <Button key={l.id} asChild variant="ghost" size="sm">
                <a href={`#${l.id}`}>Setup for {l.label}</a>
              </Button>
            ))}
          </div>
        </section>

        {/* Connect — 1-click prompt first, manual configs tucked into searchable disclosures */}
        <section id="connect" className="scroll-mt-24 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold font-headline">Connect in 60 seconds</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Let your AI configure itself with one prompt, sign in with OAuth at{' '}
              <code className="text-xs text-foreground">{MCP_PRO_ENDPOINT}</code>, or expand your
              client below for manual config snippets.
            </p>
          </div>

          <AgentQuickConnect />

          <div className="space-y-3">
            {CLIENT_SECTIONS.map((s) => (
              <div key={s.id} id={s.id} className="scroll-mt-24">
                <Disclosure label={s.label} hint={s.plugin}>
                  <div className="space-y-5 pt-2">
                    {s.blocks.map((b) => (
                      <div key={b.title} className="space-y-2.5 border-t border-border/50 first:border-t-0 first:pt-0 pt-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold font-headline text-foreground">{b.title}</h3>
                          <Badge variant={b.pro ? "default" : "outline"} className="text-[10px]">
                            {b.pro ? "Pro Full Pool" : "Free 3-Setup Preview"}
                          </Badge>
                        </div>
                        {b.intro && <p className="text-xs sm:text-sm text-muted-foreground">{b.intro}</p>}
                        <Steps steps={b.steps} />
                      </div>
                    ))}
                  </div>
                </Disclosure>
              </div>
            ))}

            <div id="other-clients" className="scroll-mt-24">
              <Disclosure
                label="Gemini CLI, Grok & Python SDK (fastmcp)"
                hint="Streamable HTTP Bearer token & Python client snippet"
              >
                <div className="space-y-5 pt-2">
                  {[
                    fromClient("gemini-cli", "free", "Gemini CLI (Free 3-setup preview)"),
                    fromClient("gemini-cli", "pro", "Gemini CLI with Pro"),
                  ].map((b) => (
                    <div key={b.title} className="space-y-2.5 border-t border-border/50 first:border-t-0 first:pt-0 pt-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold font-headline text-foreground">{b.title}</h3>
                        <Badge variant={b.pro ? "default" : "outline"} className="text-[10px]">
                          {b.pro ? `Pro, ${PRICE_MONTHLY}/mo` : "Free 3-Setup Preview"}
                        </Badge>
                      </div>
                      {b.intro && <p className="text-xs sm:text-sm text-muted-foreground">{b.intro}</p>}
                      <Steps steps={b.steps} />
                    </div>
                  ))}
                  <div className="space-y-2.5 border-t border-border/50 pt-4">
                    <h3 className="font-semibold font-headline text-foreground">Python (fastmcp)</h3>
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
              </Disclosure>
            </div>
          </div>
        </section>

        {/* Available Tools */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-headline">All {TOOL_COUNT} MCP Tools</h2>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Every tool is point-in-time and self-describing over MCP — your AI sees parameter
              schemas automatically upon connection.
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
                      <CardDescription className="leading-relaxed">{t.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Endpoints, Harness & OAuth Spec (Progressive Disclosure) */}
        <section id="docs" className="scroll-mt-24 space-y-4">
          <h2 className="text-2xl font-bold font-headline">Endpoints, Open-Source Harness &amp; OAuth 2.1</h2>

          <div className="bg-muted/30 p-5 rounded-xl border font-mono text-xs sm:text-sm space-y-2 overflow-x-auto">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-muted-foreground">Free Preview URL:</span>
              <span className="text-foreground break-all">{MCP_ENDPOINT} (3-setup preview, no auth)</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-muted-foreground">Pro OAuth URL:</span>
              <span className="text-foreground break-all">{MCP_PRO_ENDPOINT} (OAuth 2.1 or Bearer key)</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-muted-foreground">Transport:</span>
              <span className="text-foreground">Streamable HTTP (legacy SSE at /sse)</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="text-muted-foreground">Bearer Header:</span>
              <span className="text-foreground">Authorization: Bearer gr_live_...</span>
            </div>
          </div>

          <div id="oauth" className="scroll-mt-24 space-y-3">
            <Disclosure label="OAuth 2.1 & Machine Client RFC Specification" hint="RFC 9728, RFC 8414, RFC 7591, CIMD, PKCE S256">
              <div className="space-y-2 pt-1 font-mono text-xs overflow-x-auto">
                <p className="font-sans text-sm text-muted-foreground">
                  Chat clients sign in via OAuth 2.1 at <code className="text-foreground">{MCP_PRO_ENDPOINT}</code>. Headless daemons can use a <code className="text-foreground">gr_live_</code> key or <code className="text-foreground">client_credentials</code> minted on your <Link href="/account" className="text-primary hover:underline">account page</Link>.
                </p>
                <p><span className="text-muted-foreground">Auth server:</span> https://gammarips.com</p>
                <p><span className="text-muted-foreground">Discovery:</span> /.well-known/oauth-protected-resource/pro (RFC 9728) · /.well-known/oauth-authorization-server (RFC 8414)</p>
                <p><span className="text-muted-foreground">Grants &amp; Scope:</span> authorization_code, refresh_token, client_credentials · PKCE S256 · scope mcp:read</p>
                <p><span className="text-muted-foreground">Registration:</span> Dynamic (RFC 7591) or Client ID Metadata Document (CIMD)</p>
              </div>
            </Disclosure>

            <Disclosure label="Open-Source Starter Kit (gammarips-harness)" hint="3-step workflow repo & Claude Code plugin">
              <div className="space-y-3 pt-1">
                <p className="text-sm text-muted-foreground">
                  Want a ready-to-run workflow over these {TOOL_COUNT} tools? Install the open-source <code className="text-xs text-foreground">gammarips-harness</code> for daily pool screening, live catalyst research, and structured trade logging.
                </p>
                <pre className="p-3 bg-muted rounded text-xs font-mono text-primary overflow-x-auto">
                  <code>{`/plugin marketplace add DevDizzle/gammarips-harness
/plugin install gammarips@gammarips`}</code>
                </pre>
                <a href={HARNESS_REPO} target="_blank" rel="noopener noreferrer" className="inline-block">
                  <Button variant="outline" size="sm">
                    View gammarips-harness on GitHub &rarr;
                  </Button>
                </a>
              </div>
            </Disclosure>
          </div>
        </section>

        {/* Tiers + Custom Build */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">Free Preview vs. Pro MCP vs. Custom Build</h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border bg-card/50 flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Free Preview</p>
                <div className="text-3xl font-bold mt-1 mb-3">$0</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Daily 3-setup preview on web &amp; MCP</li>
                  <li>✓ Morning briefings &amp; VIX regime</li>
                  <li>✓ Market calendar &amp; playbooks</li>
                  <li>✓ No card or API key required</li>
                </ul>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/signals">Open Free Preview &rarr;</Link>
              </Button>
            </div>

            <div className="p-5 rounded-xl border-2 border-primary bg-card/70 flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pro MCP Access</p>
                <div className="text-3xl font-bold mt-1">
                  {PRICE_MONTHLY}<span className="text-sm font-normal text-muted-foreground">/mo · {PRICE_ANNUAL}/yr</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Founding rate (first {FOUNDING_CAP} subscribers; {PRICE_STANDARD}/mo after). {TRIAL_DAYS}-day trial.
                </p>
                <ul className="space-y-2 text-sm text-foreground/90">
                  <li>✓ Full 40–50 daily setups (stocks, 2x ETFs, options)</li>
                  <li>✓ Live 10-minute morning liquidity checks</li>
                  <li>✓ 3-day move history &amp; price replay</li>
                  <li>✓ OAuth 2.1 or API key across all {TOOL_COUNT} tools</li>
                </ul>
              </div>
              <ProAwareCta size="default" className="w-full" />
            </div>

            <div className="p-5 rounded-xl border bg-card/50 flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Done-For-You Engineering</p>
                <div className="text-3xl font-bold mt-1 mb-3">
                  {BUILD_STANDARD_PRICE}<span className="text-sm font-normal text-muted-foreground"> one-time</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Skip building broker &amp; risk plumbing yourself</li>
                  <li>✓ Stocks, 2x/inverse ETFs, or single-leg options</li>
                  <li>✓ Limit-only orders &amp; duplicate-order safety</li>
                  <li>✓ Delivered in {BUILD_TURNAROUND_DAYS} business days to your repo</li>
                </ul>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/build">Submit Agent Spec &rarr;</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 space-y-6">
          <h2 className="text-2xl font-bold font-headline">
            Trading MCP Server: Common Questions
          </h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-b border-border/50 pb-5 last:border-0">
                <h3 className="text-base sm:text-lg font-semibold mb-1.5">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Guides & Discovery Files */}
        <section id="guides" className="scroll-mt-24 border-t pt-10 space-y-5">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold font-headline">
              Implementation Guides &amp; Machine Discovery Files
            </h2>
            <p className="text-sm text-muted-foreground">
              Walkthroughs for connecting Claude, ChatGPT, Cursor, and Codex to stock, ETF, and options data over MCP.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <Link
              href="/blog/best-mcp-servers-for-trading-and-finance"
              className="rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors"
            >
              <p className="font-semibold text-foreground">Best MCP Servers for Trading &amp; Stock Market Data →</p>
              <p className="text-muted-foreground mt-1">Compare market data, charting, and brokerage execution MCP servers side by side.</p>
            </Link>
            <Link
              href="/blog/how-to-build-a-trading-bot-with-claude"
              className="rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors"
            >
              <p className="font-semibold text-foreground">How to Build a Trading Bot with Claude &amp; MCP →</p>
              <p className="text-muted-foreground mt-1">Step-by-step workflow for screening setups, verifying liquidity, and sizing stops.</p>
            </Link>
            <Link
              href="/blog/connect-claude-to-live-options-data-mcp"
              className="rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors"
            >
              <p className="font-semibold text-foreground">Connect Claude to Live Market &amp; Options Data via MCP →</p>
              <p className="text-muted-foreground mt-1">10-second setup for Claude Code, Claude Desktop, and Claude.ai OAuth.</p>
            </Link>
            <Link
              href="/blog/catalyst-lab-combo-a-options-microstructure-audit"
              className="rounded-lg border p-4 hover:border-primary/50 hover:bg-muted/20 transition-colors"
            >
              <p className="font-semibold text-foreground">Walk-Forward Audit: 5,575 Overnight Setups →</p>
              <p className="text-muted-foreground mt-1">How liquidity floors and volatility value beat black-box composite scores.</p>
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-xs font-mono text-muted-foreground pt-1">
            <Link href="/mcp.json" className="hover:text-primary">mcp.json</Link>
            <Link href="/llms.txt" className="hover:text-primary">llms.txt</Link>
            <Link href="/skill.md" className="hover:text-primary">skill.md</Link>
            <Link href="/.well-known/ai-plugin.json" className="hover:text-primary">ai-plugin.json</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
