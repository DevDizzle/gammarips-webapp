# CLAUDE.md — GammaRips Webapp (gammarips.com)

## What this repo is
The public Next.js 15 (App Router) site for GammaRips, deployed via Firebase App
Hosting. **Pushing to `main` auto-deploys production** — do feature work on a
branch and treat every merge as a ship.

The backend engine lives in a separate repo (`gammarips-engine`); the MCP server
in another (`gammarips-mcp`). This repo is presentation + Stripe + Firebase auth.

## Positioning (owner-locked 2026-07-03, revised 2026-10-02) — every page must agree with this
- **The human web UI is 100% free.** It is the SEO top-of-funnel. Nothing
  human-readable is paywalled.
- **The paid product is MCP access — $29/mo founding price ("Agent Access").** Bring-your-own-
  agent traders connect Claude/ChatGPT/any MCP client to the GammaRips MCP
  server (9 tools: curated pool, opportunity surfaces, outcome history,
  methodology playbooks).
- **What we sell (owner call 2026-10-02):** better-quality option contracts every
  night, the history to set targets and stops (the exit lab), and the user's AI
  builds the trade plan with them, in Claude, ChatGPT, Cursor, and Codex. "Data,
  not advice" stays in the disclaimer and the FAQ. It is never a headline.
- **There is no public daily pick.** The tournament pick is the operator's
  private signal. The site shows the POOL. Never reintroduce a "today's pick"
  card, push, or endpoint.
- **The hero is the value and the receipts:** better contracts, 2 or 3 sourced
  numbers, install buttons for each AI, and the trial CTA. The buyer already uses
  an AI agent. Do not explain agents from zero.
- **/lab and /methodology** keep the research record (hypothesis, method, N,
  confirmed or killed), framed as rigor. Nothing on them becomes a homepage or
  pricing headline.

## Forbidden claims (compliance — non-negotiable in ALL copy; revised 2026-10-02)
Owner decision record: gammarips-engine
`docs/DECISIONS/2026-10-02-web-revamp-positive-first-rules.md`.
1. Never promise a return or a win rate for the user's own trades. Real results
   may appear with N, window, and the disclaimer: the live agent record and the
   pool hit rates. Write a touch as "hit +50% within 3 trading days", never as
   profit kept.
2. Never sell a pick, a signal to follow, or a trade to copy. The user's AI
   builds the trade plan with them. (The MCP has no pick endpoint.)
3. Never guarantee a result. No "insider", no guaranteed edge, no
   timing-advantage claim.
4. Show complete cohorts only: every trade in the window, wins and losses. Never
   a cherry-picked subset or a selected-positive blended ROI. The whole-pool
   fixed-exit composite lives on /methodology only. It is not a marketing duty.
5. Every performance-adjacent surface carries: educational only, not investment
   advice (plus "paper-trading" on paper results; the live record says
   "real-money trades"). A page section that shows a performance number carries
   the marker in that section, including the homepage hero.
   **Scope, owner-ruled 2026-08-08:** "surface" means the
   page. A `<meta name="description">` that makes no performance claim does not
   need the marker, and must not be padded with one at the cost of the value
   proposition — GammaRips is a data vendor, not an advisor, and the SERP snippet
   is not where that line gets drawn. Markers stay on the descriptions for
   /scorecard, /disclosures, /methodology, /about and /reports because those do
   reference results. SETTLED: do not re-add a disclaimer to the homepage
   description.
6. (Deleted 2026-10-02, owner call.) The live record shows from trade 1, every
   trade, with its N and window. /disclosures #03 says the same.

## Voice
Confident, positive, receipts-forward. Lead with what the product does and the
numbers that show it. Every number carries its N and window. Research caveats go
on research pages (/methodology, /lab). No rocket emojis, no "moon", no
countdown urgency.

## Approved numbers (owner-approved 2026-10-02; every site number comes from here)
Recompute before you change one. Source detail is in the DECISIONS note above.
- **Live record (headline):** 11 of 14 real-money trades closed at a profit,
  +$2,263 net realized. Claude Code trades the GammaRips pool in an agent
  account. Entries 2026-09-14 to 2026-10-02. Source: gammarips-trader
  `scripts/tally.py --account LIVE`. 10 of 14 closed at the agent's pre-set
  target. Median trade +24.5% on premium. 8 of 14 were NVDA calls.
- **Pool hit rates (headline: +50%):** of N=1,150 pool contracts (scan dates
  2026-08-24 to 2026-09-28, closed 3-day windows), 52.8% hit +25%, 34.5% hit
  +50%, 15.9% hit +100% within 3 trading days. Median peak +27.7%. 74.1% also
  touched −30% in the same window (exit-lab context). Source: MCP
  `query_outcomes(view="harvest")`.
- **Contract quality (headline: open interest):** median open interest 4,664 vs
  906, median session volume 1,039 vs 232, thinnest 10% at 1,635 vs 29. After:
  N=1,300, 2026-08-24 to 2026-10-01. Before: N=3,501, the 60 scan days
  2026-05-27 to 2026-08-21. Do not use the old 893 / 233 / 86.
- **No-fill at 10:00 ET:** 40.5% to 6.1% (study, 60 sessions ending
  2026-08-14, 3,190 vs 545 legs). Label it a study.

## Key facts copy must get right
- MCP endpoint: `https://mcp.gammarips.com/mcp`
  (Streamable HTTP, primary) — legacy SSE at `/sse`. **9 tools** since the MCP v4
  consolidation (2026-07-17, 29 → 9 arg-driven tools). Auth: bearer API key (Phase 2);
  5 free tools, 4 pro. **Never hardcode the count in copy** — import `TOOL_COUNT` from
  `src/lib/constants.ts`, which is the single source of truth and already propagates to
  all 28 usages. The static `public/` agent-discovery files cannot import it and are
  synced by hand; upstream truth is `gammarips-mcp/src/server.py` `_ALL_TOOLS`.
- Engine mechanics (LIQUID-UNIVERSE funnel, live 2026-08-24): nightly scan of about 3,500 optionable US stocks (say "about 3,500";
  the universe is refreshed weekly since 2026-08-05; it was 5,230 nominal before,
  of which ~1,700 had no listed options; never write 5,230 again) → keep names with
  3M+ session share volume and 25+ listed strikes → top 100 by combined liquidity
  rank (z of chain dollar volume + z of share volume) → bullish names only → one
  OTM call per name, chosen on contract liquidity → pool of roughly 40-50 (most
  days MORE than 50 bullish names qualify and a deterministic edge rank — delta
  band, mom_60, liquidity demotion — cuts to ENRICH_TOP_N=50. The cap DOES bind:
  never write "the cap does not bind" or "no hidden ranking" (that was a dry-run
  artifact, corrected 2026-08-26); overnight_score ≥ 1 is a cosmetic floor — the
  ≥ 4 floor never ran in production, so never claim it) → the published pool is NOT
  earnings-screened, and copy must never say it is (the earnings and VIX ≤ VIX3M
  rails ran at the paper cohort's entry; that cohort was retired 2026-09-28).
  The $500K UOA floor is GONE (dropped 2026-08-24). Never describe
  the scan as unusual-activity-driven: flow gives context, liquidity decides
  membership. Lead with better-quality contracts: deeper books, more volume,
  fewer no-fills, with the approved numbers. Do not claim the pool returns more
  than other contracts (the same rule as the MCP start-here). The 2026-08-22
  selection research lives on /methodology and /lab. Spec:
  gammarips-engine `docs/DECISIONS/2026-08-24-liquid-universe-funnel.md` +
  `docs/DECISIONS/2026-10-02-web-revamp-positive-first-rules.md`.
- Pricing: Free (whole webapp) / Agent Access $29/mo (MCP), 30-day trial, Stripe.
  $29 is the FOUNDING price (owner call 2026-08-22): the first 100 subscribers keep
  it as long as they stay subscribed, and the price is $39/mo after the cap. An
  optional annual price is $299/yr. Never write a price or a trial length as a
  literal: import `PRICE_MONTHLY`, `PRICE_ANNUAL`, `PRICE_STANDARD`, `FOUNDING_CAP`
  and `TRIAL_DAYS` from `src/lib/constants.ts`. The annual option only renders when
  `NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID` is set, so copy must not promise it
  unconditionally. The founding offer carries no countdown and no urgency copy.

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
