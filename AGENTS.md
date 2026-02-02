# Agent Architecture & System Design
> Documentation of the AI Layer for GammaRips

## 1. Core Architecture: Model Context Protocol (MCP)
The system has been refactored to use a "Pure MCP" approach. Instead of hardcoded tool definitions in the agent prompt, the agent discovers tools dynamically.

## 2. Active Agents

### **A. GammaRips Agent (The Financial Analyst)**
- **File:** `src/ai/agents/profit-scout-agent.ts`
- **Role:** The primary persona. Analyzes stocks, provides recommendations, and interprets financial data.
- **Tools:**
  - `src/ai/tools/financial-data.ts`: Access to raw market data.
  - `src/ai/tools/profitscout.ts`: GammaRips algorithms and scoring.
- **Status:** **Active**. Needs fine-tuning for "Financial Analyst" persona depth.

### **B. Customer Service Agent**
- **File:** `src/ai/flows/customer-service-agent.ts`
- **Role:** Handles non-financial queries, account issues, and general support.
- **Knowledge Base:** `src/ai/knowledge/customer-service-policy.md`.
- **Status:** **Active**. Requires verification of recent refactors to ensure it correctly retrieves policy data.

## 3. Orchestration & Flows

### **Chat Router (The Entry Point)**
- **File:** `src/ai/flows/chat-router.ts`
- **Logic:**
  - Receives the raw user input.
  - Classifies intent (e.g., `FINANCIAL_ANALYSIS` vs `CUSTOMER_SUPPORT`).
  - Routes the request to the appropriate sub-agent.

### **Automated Workflows (Cron/Trigger-based)**
- **Daily Setups:** `src/ai/flows/send-daily-setups.ts` (Morning briefing).
- **Midday Movers:** `src/ai/flows/send-midday-movers.ts` (Intraday updates).
- **Top Pick:** `src/ai/flows/send-top-pick.ts`.
- **Feedback Loop:** `src/ai/flows/feedback-summarization.ts` & `src/ai/flows/send-feedback-requests.ts`.

## 4. Legacy / Deprecated Components
> *Note: These files exist but are being phased out or kept for reference.*
- `src/ai/flows/grounded-qa-flow.ts`: Replaced by the dynamic MCP agent.
- `src/ai/flows/customer-service-flow.ts`: Superseded by `customer-service-agent.ts`.

## 5. Testing & Verification
- **Test Scripts:** Located in `scripts/`.
  - `npm run test:agent`: Runs `scripts/test-profit-scout-agent.ts`.
  - `npm run test:router`: Runs `scripts/test-chat-router.ts`.
