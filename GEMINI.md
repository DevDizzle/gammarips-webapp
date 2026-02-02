# Gemini Memory Context & Technical State
> Exported: Monday, February 2, 2026

## 1. Project Specifications
- **Project Name:** GammaRips
- **Framework:** Next.js (Version **15.0.5** - strict requirement to avoid dependency conflicts).
- **Language:** TypeScript.
- **Operating System:** Linux.
- **Package Manager:** npm.

## 2. Configuration & Strategy ("Growth Mode")
- **Status:** **ACTIVE**
- **Config File:** `src/lib/config.ts`
- **Settings:**
  - `FREE_MODE = true`
- **User Acquisition Strategy:**
  - **Objective:** Reach ~500 Daily Active Users (DAU).
  - **Tactic:** "Frictionless Signup".
  - **Flow:**
    1. Landing Page CTA ("See Today's Picks").
    2. Direct redirect to Public Dashboard.
    3. **Top 3 Picks** are visible immediately (Sneak Peek).
    4. Remaining data/details are blurred/gated behind a signup prompt.
    5. Payments are currently paused to remove friction.

## 3. Technical Challenges & Issues
### Active Issues
- **Cloud Run MCP Server:**
  - **URL:** `profitscout-mcp-hrhjaecvhq-uc.a.run.app`
  - **Error:** Returns `HTTP 421 Invalid Host header`.
  - **Diagnosis:** The server rejects requests even with valid HTTP/1.1 Host headers. This points to a strict `AllowedHosts` middleware configuration on the server side or an issue with the ingress networking.

### Resolved Issues
- **API Keys:**
  - `GEMINI_API_KEY` issues: Found invalid key starting with `AQ.Ab` (legacy/incorrect format). Correct keys typically start with `AIza`.
  - **Genkit:** `API keys are not supported` error was triggered by this invalid key.
- **Model Configuration:** Fixed references to non-existent model `gemini-2.5-flash-lite`.

## 4. Architecture: "Pure MCP"
- **Refactor Status:** Completed transition to Model Context Protocol (MCP).
- **Core Component:** `src/ai/agents/profit-scout-agent.ts`
- **Tooling:** Dynamic tool discovery is enabled.
- **Routing:** `chatRouterFlow` (`src/ai/flows/chat-router.ts`) is the entry point, deciding whether to route to the financial analyst or customer support.

## 5. Key File Locations
- **Backend/AI:** `src/ai/`
- **Frontend/App:** `src/app/`
- **Lib/Config:** `src/lib/`
- **Scripts:** `scripts/` (Contains test scripts for agents: `test-agent-flow.ts`, `test-chat-router.ts`).
