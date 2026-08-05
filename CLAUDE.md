# CLAUDE.md — GammaRips Webapp (gammarips.com)

## What this repo is
The public Next.js 15 (App Router) site for GammaRips, deployed via Firebase App
Hosting. **Pushing to `main` auto-deploys production** — do feature work on a
branch and treat every merge as a ship.

The backend engine lives in a separate repo (`gammarips-engine`); the MCP server
in another (`gammarips-mcp`). This repo is presentation + Stripe + Firebase auth.

## Positioning (owner-locked 2026-07-03) — every page must agree with this
- **The human web UI is 100% free.** It is the SEO top-of-funnel. Nothing
  human-readable is paywalled.
- **The paid product is MCP access — $39/mo ("Agent Access").** Bring-your-own-
  agent traders connect Claude/ChatGPT/any MCP client to the GammaRips MCP
  server (9 tools: curated pool, opportunity surfaces, outcome history,
  methodology playbooks).
- **We are a data vendor, not an advisor.** We sell the opportunity surface —
  curated data + tools an agent reasons over — never a pick, never a return.
- **There is no public daily pick.** The tournament pick is the operator's
  private signal. The site shows the POOL. Never reintroduce a "today's pick"
  card, push, or endpoint.
- **The hero angle is agentic trading** — educating traders on using AI agents
  to analyze data. We build the category; established options-flow SEO terms
  are captured by the free pages.
- **The Lab** (`/lab`) publishes the engine's research experiments (hypothesis,
  method, N, confirmed-or-killed) — pool-level findings only, cohort-shaped
  stats, never one blended avg-ROI headline.

## Forbidden claims (compliance — non-negotiable in ALL copy)
1. Never state or imply an expected return, win rate, or profit as a product
   promise. Research findings cite N + window + conditions, framed as research.
2. Never sell or imply "picks," "signals to take," or "trades to follow." The
   agent reaches its own conclusion; copy says so.
3. Never claim a timing advantage, "edge" as a guarantee, or anything
   resembling "insider."
4. The whole-pool composite under a fixed exit is NEGATIVE — we publish that
   honestly. Never publish a selected-positive blended ROI number.
5. Every performance-adjacent surface carries: paper-trading, educational only,
   not investment advice.
6. No aggregate live-cohort performance marketing until 30 closed trades
   (see /disclosures #03).

## Voice
Confident, dry, receipts-forward. Plain sentences over hype. We say the
uncomfortable true thing before the flattering one. Numbers always carry their
conditions. No rocket emojis, no "moon," no urgency theater.

## Key facts copy must get right
- MCP endpoint: `https://mcp.gammarips.com/mcp`
  (Streamable HTTP, primary) — legacy SSE at `/sse`. **9 tools** since the MCP v4
  consolidation (2026-07-17, 29 → 9 arg-driven tools). Auth: bearer API key (Phase 2);
  5 free tools, 4 pro. **Never hardcode the count in copy** — import `TOOL_COUNT` from
  `src/lib/constants.ts`, which is the single source of truth and already propagates to
  all 28 usages. The static `public/` agent-discovery files cannot import it and are
  synced by hand; upstream truth is `gammarips-mcp/src/server.py` `_ALL_TOOLS`.
- Engine mechanics: nightly scan of 5,230+ tickers → enrichment (score ≥ 4,
  UOA > $500K, bullish-only, edge-ranked to ~50) → two safety rails (earnings,
  VIX ≤ VIX3M). The paper cohort validates selection under the V7.1 GIGO exit
  (10:00 entry, +40/−30, flat 15:45 ET).
- Pricing: Free (whole webapp) / Agent Access $39/mo (MCP), 7-day trial, Stripe.

## Repo landmines
- `src/lib/config.ts` `FREE_MODE = true` — everyone is treated as Pro; UI
  gating is retired. Don't reintroduce `<ProLock>` on human content.
- Marketing copy is hardcoded in components/pages; blog + reports + signals are
  Firestore-driven (`src/lib/firebase-admin.ts`), rendered with react-markdown.
- `src/content/blog/*.mdx` is legacy seed content — NOT the live blog.
- Stripe webhook (`src/app/api/stripe/webhook/route.ts`) provisions
  entitlements in Firestore; MCP key issuance rides the same pattern.
- App Hosting returns 200 for notFound pages (SEO landmine) — keep explicit
  metadata + canonical on every page.
- AI-discovery files (`public/llms.txt`, `public/mcp.json`,
  `public/.well-known/ai-plugin.json`, `public/skill.md`) are product surfaces
  read by agents — keep them in lockstep with the MCP server's real tool list.

## Subagent
- `.claude/agents/gammarips-copywriter.md` — writes/edits marketing copy under
  the messaging system above. Use it for any copy change beyond a typo.
