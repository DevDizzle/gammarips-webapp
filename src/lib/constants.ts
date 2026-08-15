// Single source of truth for the two product literals that otherwise drift
// across marketing copy, structured data, transactional emails, and the
// agent-discovery files.
//
// TOOL_COUNT: the number of tools the live MCP server exposes. 9 as of the
// MCP v4 consolidation (2026-07-17 replan): the 29-tool V3 surface collapsed
// into 9 arg-driven tools. Paired with the /developers catalog + public/*
// agent-discovery rewrite (replan slice step 4). The static public/ files
// (llms.txt, mcp.json, skill.md, .well-known/ai-plugin.json, .well-known/
// ai-catalog.json) cannot import this constant, so they are kept in sync by
// hand at the v4 surface.
export const TOOL_COUNT = 9;

// PRICE_MONTHLY: the Agent Access subscription price, display form ($ + amount).
// Structured-data numeric price fields (e.g. "39.00" in JSON-LD) are a separate
// format and are left as literals.
export const PRICE_MONTHLY = '$39';

// OG_IMAGE: the social/link-preview card, in Next's openGraph image shape.
//
// Next.js merges metadata SHALLOWLY: a page declaring its own `openGraph` block
// REPLACES the root layout's entirely, images included. Eleven pages did exactly
// that and silently shipped with no og:image — every link to /pricing,
// /developers, /how-it-works, a blog post or a daily report rendered as a bare
// text card on X, Slack, iMessage, Discord and HN.
//
// So: any page that declares `openGraph` MUST also set `images: [OG_IMAGE]`.
// Once the block exists, inheritance is not an option.
export const OG_IMAGE = {
  url: 'https://gammarips.com/og-image.png?v=3',
  width: 1200,
  height: 630,
  alt: 'GammaRips — Options-flow data for AI agents',
};

// MCP_ENDPOINT: the public Streamable HTTP endpoint of the GammaRips MCP
// server. Legacy SSE lives at /sse. Used by the connect tabs; the developers
// and account pages carry their own literal for historical reasons.
export const MCP_ENDPOINT = 'https://mcp.gammarips.com/mcp';

// HARNESS_REPO: the open-source harness, the clone-me GTM artifact.
export const HARNESS_REPO = 'https://github.com/DevDizzle/gammarips-harness';
