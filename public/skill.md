# GammaRips: Nightly Combo A Options Dataset for AI Agents

## What I Am
The nightly filtered options dataset for AI agents. Every trading night at 23:00 ET I scan ~3,500 optionable US stocks, keep the top 100 liquid universe (3M+ session shares, 25+ listed strikes), and select one out-of-the-money call per bullish name passing Combo A microstructure and convexity gates (`Mid >= $1.00`, `OI >= 500`, `Delta 0.22–0.48`, `DTE 10–45`). At 05:30 ET each contract is enriched with Realized-vs-Implied Volatility (`rv_iv_ratio`), technicals, flow context, and grounded news catalysts. From 09:02 to 16:52 ET I capture 10-minute intraday liquidity snapshots. You (the agent) build the trade plan with your user. I never return a shared daily pick.

Validated in Catalyst Lab walk-forward audits (`N = 5,575` enriched contracts across 66 scan dates joined to BigQuery `enriched_option_outcomes`):
- `rv_iv_ratio >= 0.85` (`(ATR_14 / Price * sqrt(252)) / IV`) is the #1 quantitative predictor of favorable 3-day option excursions.
- Resting `OI >= 500` lifts 5-minute fast execution fills at the open from 30.3% to 50.1% (56.5% at `OI >= 1,000`), and `Mid >= $1.00` eliminates sub-dollar $0.05 tick friction.
- `Delta 0.22–0.48` and `DTE 10–45` lift 3-day Option MFE `>= +40%` from 27.6% baseline to 35.4%.

## What I Serve (9 tools)
- **The Combo A pool**: `get_pool` with `view=preview` returns the 3-contract preview on the Free tier. Pro unlocks the full 40–50 contract daily dataset (`view=enriched`, `raw`, or `features`). `get_signal` provides single-ticker deep dives (`view=detail`) and earnings-window checks (`view=earnings`).
- **10-minute intraday liquidity**: `get_liquidity` returns 10-minute intraday open interest, active session volume, last trade, and greeks (09:02–16:52 ET) for one contract or the whole pool.
- **3-day excursion outcome history**: `query_outcomes` queries BigQuery `enriched_option_outcomes`: touch-probability curves (`view=harvest`), unclipped 3-day MFE/MAE surfaces (`view=surface`), and custom target/stop bracket scoring (`view=exit_rule`).
- **Raw option price tape**: `replay_contract` returns minute or daily bars for any historical pool contract.
- **Regime, calendar, reports & playbooks (Free)**: `get_regime_context` (VIX vs VIX3M), `get_market_calendar_status`, `get_daily_report`, and `get_playbook` (start with `name=start-here` or `name=schema`).

## How to Build the Trade Plan
1. `get_market_calendar_status`: check session status and dataset freshness.
2. `get_regime_context`: check the point-in-time VIX vs VIX3M term structure.
3. `get_pool` with `view=enriched`: read the full Combo A dataset.
4. Shortlist 1 to 3 candidates on your user's criteria (`rv_iv_ratio >= 0.85`, technical structure, catalyst). Verify earnings with `get_signal(view="earnings")` and live morning liquidity with `get_liquidity`.
5. `query_outcomes` with `view=harvest` and `view=surface`: set the target and stop from 3-day historical excursion distributions.
6. Present the trade plan: contract, thesis, entry near the mid, target, stop, maximum loss, and position size within your user's risk budget—or a reasoned no-trade. Your user decides.

## MCP Endpoints (Free Preview vs. Pro Dataset)
- **Free 3-Contract Preview:** `https://mcp.gammarips.com/mcp` (Streamable HTTP; no card, no key). Serves the 3-contract preview (`get_pool(view="preview")` — matching the 3-contract web preview on https://gammarips.com/signals), daily reports, playbooks, regime context, and market calendar.
- **Pro Full Dataset ($29/mo, 30-day free trial):** Subscribe at https://gammarips.com/pricing ($29/mo founding price for the first 100 subscribers, $39/mo after). Authenticate via OAuth 2.1 at `https://mcp.gammarips.com/pro` (PKCE S256, dynamic registration, scope `mcp:read`) or send `Authorization: Bearer gr_live_...` generated at https://gammarips.com/account.

## Disclaimers
Educational market data and historical research only. Not investment advice. Past performance is not a guarantee of future results.
