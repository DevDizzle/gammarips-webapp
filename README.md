# GammaRips

**Overnight options flow intelligence for serious traders.**

[gammarips.com](https://gammarips.com)

---

## What Is GammaRips?

GammaRips surfaces institutional options activity that happens overnight — before retail traders wake up. Every trading day, our pipeline scans thousands of tickers for unusual options flow, enriches the top signals with AI-generated trade theses, technical levels, and news context, then runs them through a 5-model adversarial debate system (Agent Arena) to produce a single high-conviction consensus pick.

The result: actionable intelligence delivered before the opening bell.

## Products

| Tier | What You Get | Price |
|------|-------------|-------|
| **The Overnight Edge** | Daily scanner output, enriched signals with AI theses, technical levels, key support/resistance, 52-week context | $49/mo |
| **The War Room** | Everything in Edge + Agent Arena consensus picks, full debate transcripts, real-time WhatsApp alerts | $149/mo |
| **MCP API** | Free programmatic access to overnight signals for AI agents and developers | Free |

## The Pipeline

```
4:00 AM UTC    Overnight Scanner → scans options flow across all tickers
4:30 AM UTC    Enrichment → AI thesis, technicals, news, risk/reward for top signals
5:00 AM UTC    Agent Arena → 5 models debate, produce consensus pick
8:30 AM EST    Daily report published to gammarips.com
6:15 AM EST    Signal drop posted to X (@GammaRips)
7:30 AM EST    Arena consensus pick posted
```

All pipeline services run on **Google Cloud Run**. Data lives in **BigQuery** (analytics) and **Firestore** (serving).

## Agent Arena

Five frontier models with assigned analytical roles debate each day's top signals through 4 rounds of structured adversarial challenge:

| Agent | Model | Role |
|-------|-------|------|
| Grok | grok-4-1-fast-reasoning | Momentum |
| Gemini | gemini-3-flash-preview | Contrarian |
| Claude | claude-sonnet-4 | Risk Manager |
| DeepSeek | deepseek-chat (V3) | Catalyst Hunter |
| GPT-5.2 | gpt-5.2-2025-12-11 | Technical Analyst |

The Arena produces exactly one consensus trade with specific contract details (strike, expiration, delta target, entry/exit thesis). When agents can't agree, the highest-conviction individual pick surfaces instead.

## MCP API

Free, no auth, no API key. Built for AI agents to discover and consume overnight signals programmatically.

**Endpoint:** `https://mcp.gammarips.com/sse`

9 tools available — get signals, reports, enriched data, arena consensus, and more. See [gammarips.com/developers](https://gammarips.com/developers) for documentation.

## Stack

- **Frontend:** Next.js 15, React, Tailwind CSS, Firebase Hosting
- **Auth:** Firebase Authentication
- **Payments:** Stripe (subscriptions + billing portal)
- **Database:** Firestore (serving), BigQuery (analytics + pipeline)
- **Backend:** Google Cloud Run (scanner, enrichment, win tracker, arena, MCP server)
- **Scheduling:** Google Cloud Scheduler
- **AI:** Google Gemini (enrichment + grounded search), Grok, Claude, DeepSeek, GPT-5.2 (arena)

## Links

- **Website:** [gammarips.com](https://gammarips.com)
- **X:** [@GammaRips](https://twitter.com/GammaRips)
- **MCP API Docs:** [gammarips.com/developers](https://gammarips.com/developers)
- **Founder:** [Evan Parra](https://linkedin.com/in/evanparra)

---

© 2026 GammaRips. All rights reserved.
