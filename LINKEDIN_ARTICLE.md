# Building a Production-Grade Multi-Agent System with Google Genkit, Next.js, and Firebase

**Subtitle:** How we engineered "ProfitScout AI" — a context-aware financial copilot that combines proprietary data, real-time web grounding, and intelligent routing.

---

In the rapidly evolving landscape of AI, the difference between a "demo" and a "product" often lies in architecture. Today, I'm sharing the technical blueprint behind **ProfitScout AI**, our new intelligent financial assistant.

We moved beyond the standard "chatbot" paradigm to build a **Multi-Agent System** that acts as both a Financial Analyst and a Customer Support Representative, seamlessly integrated into our Next.js dashboard.

Here is a deep dive into the stack, the architecture, and the code patterns we used to bring it to life.

## 🛠️ The Tech Stack

We chose a "Google-Native" stack for its tight integration, security, and scalability:

*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router & Server Actions) for the full-stack application.
*   **AI Engine:** [Google Genkit](https://firebase.google.com/docs/genkit) (TypeScript SDK) for defining flows, prompts, and tools.
*   **Models:** 
    *   `gemini-2.5-pro` for deep reasoning and financial analysis.
    *   `gemini-2.5-flash-lite` for high-speed intent classification and routine tasks.
*   **Data & Knowledge:**
    *   **Google Cloud Storage (GCS):** Storing proprietary markdown reports, earnings transcripts, and news analysis.
    *   **Firestore:** Storing user profiles, structured stock data, and active options setups.
    *   **Google Search Grounding:** Providing real-time market data verification to prevent hallucinations.
*   **Infrastructure:** Deployed on Firebase App Hosting / Vercel.

---

## 🏗️ The Architecture: A "Router-Gateway" Pattern

We didn't want a generic LLM that hallucinates answers about our refund policy or gives financial advice. We needed specialized behavior.

### 1. The Gateway (Server Actions)
Every user message is sent to a secure Next.js Server Action (`submitChatQuery`). This layer handles authentication, rate limiting, and sanitizes the input before it ever touches our AI logic.

### 2. The Semantic Router 🧠
The first stop is our **Router Agent**. Using the lightweight `gemini-2.5-flash-lite` model, it analyzes the user's intent and conversation history in milliseconds.

*   **Intent: `SERVICE`** → User is asking about billing, bugs, or "how-to".
*   **Intent: `FINANCE`** → User is asking about stocks, options, or market outlooks.

### 3. Specialized Agents

#### 🅰️ Agent A: The Customer Service Rep
*   **Goal:** Safe, policy-compliant support.
*   **Mechanism:** It loads our `customer-service-policy.md` into context.
*   **Constraint:** Strictly forbidden from giving financial advice. It answers FAQs about subscriptions and features with empathy and precision.

#### 🅱️ Agent B: The Financial Analyst (RAG + Tools)
*   **Goal:** Deep, data-driven market insights.
*   **Mechanism:** This agent is equipped with two powerful tools:
    1.  `googleSearch`: For live prices and breaking news.
    2.  `fetchProfitScoutData`: A custom tool that queries our Firestore database and retrieves proprietary analysis files from GCS.
*   **The "Secret Sauce":** We prompt the model to *always* check our internal proprietary data first. If we have a generated "Winner's Dashboard" report for `AAPL`, the agent reads that 2,000-character summary before looking at Google. This ensures the AI speaks with *our* voice and data.

---

## 💻 The "Persistent Copilot" UX

We abandoned the traditional "modal" chat that disappears when you click away. Financial research requires context.

*   **Desktop:** A collapsible **Sidebar** that sits alongside your charts. You can read the data and ask questions about it simultaneously.
*   **Mobile:** A **Draggable Bottom Sheet** (using `vaul`) that behaves like a native app drawer, keeping the stock price visible while you chat.
*   **Context Awareness:** If you are viewing the "Tesla" page, the chat automatically initializes with `{ activeTicker: 'TSLA' }`. You don't need to say "What is the outlook for Tesla?"; you just ask "What's the outlook?", and the agent knows.

---

## 🚀 Key Takeaways for Engineers

1.  **Don't use one model for everything.** Use "Flash" models for routing and simple tasks to save cost and latency. Save the "Pro" models for complex reasoning.
2.  **Tools > Context Stuffing.** Instead of dumping all your data into the prompt, build robust tools (`ai.defineTool`) that let the model *pull* exactly what it needs, when it needs it.
3.  **Grounding is non-negotiable.** For financial applications, using Google Search Grounding (or RAG) is essential to build trust and verify facts.

#AI #Genkit #Nextjs #SoftwareEngineering #FinTech #Gemini #GoogleCloud #WebDevelopment
