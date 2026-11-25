# CLAUDE.md — GammaRips Webapp (gammarips.com)

## What this repo is
The public Next.js 15 (App Router) site for GammaRips, deployed via Firebase App
Hosting. **Pushing to `main` auto-deploys production** — do feature work on a
branch and treat every merge as a ship.

The backend engine lives in `engine/` (`gammarips-engine`); the MCP server lives
in `mcp/` (`gammarips-mcp`). This repo is presentation + Stripe + Firebase auth
+ OAuth 2.1 authorization server.

## Positioning (Revised 2026-11-25 — holistic multi-instrument + dual offering)
Every public page, metadata tag, and email must agree with this:
- **Core product:** GammaRips delivers nightly US market & options-flow
  intelligence for AI trading agents — executable across **US stocks (1x),
  2x/inverse single-stock ETFs, and liquid options** (`execution_vehicles`).
  Never frame GammaRips as options-only on top-level marketing pages.
- **Two offerings (clear dual-path routing):**
  1. **DIY Pro MCP (`https://mcp.gammarips.com/pro` or Bearer API key):**
     `$29/mo` or `$299/yr` founding price (first 100 subscribers; `$39/mo` after),
     **7-day free trial**. Unlocks all 40–50 daily setups (`execution_vehicles`,
     `rv_iv_ratio`, technicals, catalysts), 10-minute morning/intraday liquidity
     snapshots (`09:02–16:52 ET`), 3-day move history (`query_outcomes`), and
     price replay across all `TOOL_COUNT` (9) tools.
  2. **Done-For-You Custom Trading Agent Build (`/build`):** **`$1,000` flat**
     fixed-scope work-for-hire Python trading bot engineering across stocks,
     2x/inverse ETFs, or options — safety-hardened (limit-only orders, fill-based
     stops, duplicate-order guards), delivered in Paper Mode to the client's
     private GitHub repo in **5 business days**, plus optional `$50/mo` Agent
     Care (`$75/mo` Care + Pro MCP bundle).
- **Free tier (`$0` forever):** Daily **3-setup preview** on `/signals` and
  anonymous `https://mcp.gammarips.com/mcp`, morning briefings (`/reports`),
  public dual-book agent log (`/xtrader`), VIX/VIX3M volatility regime, NYSE
  calendar, and methodology/research pages (`/how-it-works`, `/methodology`,
  `/lab`).
- **There is no shared daily pick.** Never reintroduce "today's pick" copy or a
  retired `/scorecard` link (`/scorecard` 301s to `/how-it-works`).

## Copywriting & UX Standard ("Credible Jargon, Human Clarity")
Enforce our **3-Layer Progressive Disclosure** model on every marketing page:
- **Layer 1 (0–5 sec — Hero, Titles, Meta Descriptions, Cards):** Grade 6–8 plain
  English, one idea per headline, problem-first framing. **Never put internal
  jargon (`Combo A`, `rv_iv_ratio`, `MFE/MAE`, `dev.parquet`, `dbt`,
  `enriched_option_outcomes`, `profitscout-fida8`) in `<title>`,
  `<meta description>`, `og:*`, or hero headlines.** (Live GSC audit confirmed
  0 of 6,152 impressions came from internal lab names.)
- **Layer 2 (5–30 sec — Interactive Proof & Clear Choices):** Show concrete UI
  previews (`ProductShowcase`, live 3-setup preview, X-Trader log), max 4–5
  scannable bullets per pricing card, and clean 80/20 routing between DIY Pro
  MCP and the `$1,000` Custom Build.
- **Layer 3 (30s+ — Expandable Technical Authority):** Keep full quantitative
  specs (`Mid >= $1.00`, `OI >= 500`, `Delta 0.22–0.48`, `DTE 10–45`,
  `rv_iv_ratio`, RFCs) inside native `<Disclosure>` (`<details>`) components,
  `<GlossaryTip>` `?` toggletips, `/methodology`, `/lab`, and `/developers`.
- **Engine truth on `rv_iv_ratio`:** Nightly scanner (23:00 ET) enforces
  `Mid >= $1.00`, `OI >= 500`, `Delta 0.22–0.48`, `DTE 10–45`. `rv_iv_ratio` is
  computed at **05:30 ET enrichment** (with `>= 0.85` as the research benchmark
  threshold agents filter on — never claim `rv_iv_ratio` is a hard 23:00 ET gate).

## Compliance Rules (Non-Negotiable)
1. Never promise a return or win rate for the user's own trades. Write touches
   as "hit +40% / +50% within 3 trading days", never profit kept.
2. Never sell a daily pick, signal to follow, or trade to copy.
3. Show complete cohorts only (with N and date window).
4. Carry clear non-advisory disclaimers on performance-adjacent pages, plus
   daily-rebalancing risk for 2x/inverse ETFs and work-for-hire scope on `/build`.
   Keep the homepage `<meta name="description">` disclaimer-free (owner-settled).

## SEO & Metadata Guardrails
- Root `src/app/layout.tsx` sets `title.template: "%s | GammaRips"`. **Never
  append `| GammaRips` inside child route `metadata.title` strings** (causes
  double `| GammaRips | GammaRips`). Keep rendered `<title>` ≤ 60 chars and
  `<meta description>` 140–158 chars.
- Any page declaring `openGraph` (and every indexable page) must explicitly
  include `images: [OG_IMAGE]` from `src/lib/constants.ts`.
- Never hardcode prices, trial days, or tool counts — import `PRICE_MONTHLY`,
  `PRICE_ANNUAL`, `PRICE_STANDARD`, `FOUNDING_CAP`, `TRIAL_DAYS`, `TOOL_COUNT`,
  `BUILD_STANDARD_PRICE`, `AGENT_CARE_PRICE`, `AGENT_CARE_MCP_PRICE`, and
  `BUILD_TURNAROUND_DAYS` from `src/lib/constants.ts`.
- Preserve ranking URL slugs, 301s in `next.config.ts`, and core `"options flow"`
  / ticker terms on `/signals`, `/signals/[ticker]`, and `/reports/[date]`.

## Repo Landmines
- `src/lib/config.ts` `FREE_MODE = false` — `/signals` shows a 3-setup preview
  to free visitors and unlocks the full pool for Pro subscribers.
- Billing & cancellation: `/account` calls `POST /api/billing-portal` (Stripe
  Billing Portal) and `/api/keys` (avoiding Server Action deploy-skew).
- Private routes (`/account`, `/auth/*`) emit `X-Robots-Tag: noindex, nofollow`
  in `next.config.ts` and `robots: { index: false, follow: false }` in layouts.
- Keep AI-discovery files (`public/llms.txt`, `public/mcp.json`,
  `public/skill.md`, `public/install.md`, `public/.well-known/*`) synced with
  stocks, 2x/inverse ETFs, options, `TOOL_COUNT`, current pricing, and `/build`.

## Subagent
- `.claude/agents/gammarips-copywriter.md` — enforces the 7-criterion copy audit
  rubric, plain-English translation rules, and compliance checklist above.
