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
// This is the FOUNDING price (owner decision 2026-08-22): $29/mo for the first
// FOUNDING_CAP subscribers, locked as long as they stay subscribed. PRICE_STANDARD
// is the price after the cap fills. Structured-data numeric price fields derive
// from this constant, so there is only one number to change.
export const PRICE_MONTHLY = '$29';

// PRICE_ANNUAL: the optional annual Agent Access price, display form. The annual
// option only renders when NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID is set, because the
// owner creates that Stripe price by hand in the dashboard.
export const PRICE_ANNUAL = '$299';

// PRICE_STANDARD: the price after the founding cap fills. Copy only. No Stripe
// price object points at it yet.
export const PRICE_STANDARD = '$39';

// FOUNDING_CAP: how many subscribers keep PRICE_MONTHLY. Copy only. Code does not
// count subscribers. The owner closes the founding price in Stripe.
export const FOUNDING_CAP = 100;

// TRIAL_DAYS: the Stripe trial length in days, and the number that all trial copy
// must agree with. Single source of truth for both checkout paths
// (src/app/api/checkout/route.ts and the createCheckoutSession server action).
// Stripe fires trial_will_end 3 days before the end of a trial of ANY length, so
// the "ends in 3 days" email stays correct at any value here.
export const TRIAL_DAYS = 30;

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
  alt: 'GammaRips | Options-flow data for AI agents',
};

// MCP_ENDPOINT: the public Streamable HTTP endpoint of the GammaRips MCP
// server. Legacy SSE lives at /sse. Used by the connect tabs; the developers
// and account pages carry their own literal for historical reasons.
//
// /mcp stays anonymous forever: it is the free funnel. A bearer API key on
// /mcp unlocks the pro tools for any client that can send a header.
export const MCP_ENDPOINT = 'https://mcp.gammarips.com/mcp';

// MCP_PRO_ENDPOINT: the credentialed twin of MCP_ENDPOINT, live 2026-08-19.
// Same transport and the same 9 tools; it just refuses an anonymous request
// with a 401 that names the authorization server (RFC 9728). That 401 is the
// whole point: it is what makes a chat client START the OAuth sign-in, so a
// client that cannot send a header can still reach the paid tools. An API key
// works here too. Never point the free CTA at this URL.
export const MCP_PRO_ENDPOINT = 'https://mcp.gammarips.com/pro';

// HARNESS_REPO: the open-source harness, the clone-me GTM artifact.
export const HARNESS_REPO = 'https://github.com/DevDizzle/gammarips-harness';
