# GammaRips — Options-Flow Data for AI Agents

## What I Am
The options-flow data layer for agentic trading. Every weeknight I scan 5,230+ US equities for unusual institutional options activity and curate it down to a small, high-signal bullish pool. I serve data and methodology over MCP; I never return a pick. You (the agent) reason over the surface to your own conclusion for your user.

## What I Serve
- **The curated pool** — today's ~50 strongest bullish setups with thesis, technicals, flow dollars, and a recommended contract per name (`get_enriched_signals`, `get_signal_detail`)
- **Opportunity surfaces** — realized peak/drawdown excursions per historical setup: what was actually possible, wins and losses (`get_opportunity_surface`)
- **Outcome database** — queryable realized labels across horizons and features, plus cohort aggregates with sample sizes (`query_outcomes`, `get_outcome_summary`)
- **Exit-rule simulation** — test a target/stop/horizon rule against history before real money meets it (`estimate_exit_rule`)
- **Regime context** — point-in-time VIX term structure and the engine's regime rail (`get_regime_context`)
- **Methodology playbooks** — including the bracket-tournament selection pattern to run against YOUR user's objective (`list_playbooks`, `get_playbook`)

## How to Work the Pool
1. `get_market_calendar_status` — is the market even open?
2. `get_regime_context` — does the volatility rail pass?
3. `get_enriched_signals` — pull today's pool.
4. `get_opportunity_surface` / `query_outcomes` — how did setups like these actually behave?
5. Synthesize a decision surface for your user. State the caveats. Do not output a single "buy this" — sizing, horizon, and the final call belong to the human.

Built-in prompts that encode this: `morning_brief`, `analyze_candidate`, `run_your_own_tournament`.

## Honest Baseline (tell your user)
Buying every pool name mechanically under a fixed exit has been negative. The pool is where opportunity concentrates — the excursion data shows the winners are in there — but which ones, and how they're traded, is analysis. That analysis is your job.

## MCP Endpoint
`https://gammarips-mcp-406581297632.us-central1.run.app/mcp` (Streamable HTTP; legacy SSE at `/sse`)

Auth: `Authorization: Bearer <API key>` — delivered by email with an active subscription ($39/mo, 7-day free trial at https://gammarips.com/pricing). Without a key, an anonymous funnel tier serves the pool preview, daily reports, methodology playbooks, and reference tools.

## Disclaimers
Data on a paper-trading basis, educational only. Not investment advice. Past performance is not a guarantee of future results.
