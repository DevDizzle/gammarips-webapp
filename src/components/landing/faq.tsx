import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
  {
    question: "What is agentic trading?",
    answer: "Using an AI agent — Claude, ChatGPT, or one you build — as your own market analyst instead of following someone else's calls. The agent pulls real data, reasons over it, and presents you a decision surface; you keep the judgment and place (or skip) the trade. The catch: agents are only as good as the data they can reach. A chatbot with no market data will happily improvise. GammaRips is the data layer that fixes that for options flow — your agent connects over MCP and reasons over curated, timestamped, leakage-checked data instead of vibes."
  },
  {
    question: "What does GammaRips actually sell?",
    answer: "Data and tools, not picks. The paid product is MCP access for your AI agent: today's curated options-flow pool in structured form, the opportunity surface for historical setups (how far each contract actually ran, and how far it drew down), a queryable outcome database, regime context, and methodology playbooks — 23 tools in total. Everything human-readable on gammarips.com is free, forever. The $39/mo is the machine connection."
  },
  {
    question: "Which AI agents work with this?",
    answer: "Anything that speaks MCP (Model Context Protocol): Claude via connectors or Claude Code, ChatGPT with MCP support, Cursor, or any custom agent using an MCP client library. You add the GammaRips server to your agent's config with your API key, and the 23 tools show up like native capabilities. Setup takes a few minutes; the Developers page has copy-paste instructions."
  },
  {
    question: "Why don't you just tell me what to buy?",
    answer: "Two reasons, and we mean both. First, shared picks get crowded — everyone piling into the same thin options contract destroys the very thing they paid for. Second, our own published data shows that mechanically buying everything the engine surfaces, under a fixed exit rule, loses money. The value isn't a pick — it's the surface a good trade comes from: a small curated pool plus the historical data showing how setups like each one actually behaved. We give your agent that surface. It reasons to its own conclusion, sized to your risk, on your horizon."
  },
  {
    question: "How is the pool curated?",
    answer: "Every weeknight the engine scans 5,230+ US tickers for unusual options activity. A name needs an overnight score ≥ 4 and directional dollar volume above $500K to be enriched at all. Then a bullish-only gate and a delta-based edge-rank — levers validated on over a thousand historically labeled trades — cut the list to the strongest ~50 setups, each carrying its flow data, technicals, news context, and a recommended contract. Two safety rails sit on top: no names with earnings in the window, and a volatility regime check (VIX ≤ VIX3M). Every candidate is leakage-checked — no field your agent sees contains information that wasn't knowable at scan time."
  },
  {
    question: "Where's the track record?",
    answer: "On the Scorecard page, and in the Lab. A paper-traded cohort tests the selection methodology every market day under fixed mechanical rules — every trade timestamped, every outcome logged, nothing edited after the fact. Preliminary aggregates always carry their sample size and a small-sample warning, and we make no marketing claims from them until a cohort has at least 30 closed trades. We also tell you the unflattering part up front: the whole pool bought blindly under a fixed exit is negative. That number is exactly why we sell the data layer and not a pick."
  },
  {
    question: "Is this financial advice?",
    answer: "No. GammaRips is a data vendor. We publish market data, methodology, and research on a paper-trading basis. We never see your account, never manage money, and never make personalized recommendations — and the MCP deliberately has no 'what should I buy' endpoint. What your agent concludes from the data is your analysis, not our advice. If you want personalized investment advice, work with a licensed advisor."
  },
  {
    question: "Can't I just scrape the free site?",
    answer: "The webapp shows today's pool and reports in human-readable form, and it always will, free. The MCP is a different animal: structured point-in-time data built for machine reasoning, the historical opportunity-surface and outcome databases that never render on a webpage, exit-rule simulation, regime context, and the methodology playbooks — including the bracket-tournament selection pattern your agent can run against its own objective. You could rebuild some of that from scraping. By the time you have, you'll have built a worse version of the thing we sell for $39."
  },
  {
    question: "Who runs this?",
    answer: "Evan Parra (founder, ML engineer, data architect) built the engine. The nightly pipeline — scanning, scoring, enriching, publishing — runs autonomously, and every decision is logged to BigQuery. The Lab publishes experiments run on the engine's own data, including the failed ones. Read more on the About page."
  },
  {
    question: "What happened to the WhatsApp pick subscription?",
    answer: "Retired. We used to sell a daily pushed pick for $39/mo; we ended it deliberately. A single shared pick concentrates everyone into one contract, and our research kept showing the edge lives in how a setup is traded, not in the name itself. The same $39 now buys something better-aligned: full MCP data access, so your agent works the whole pool your way. If you had an active subscription, email evan@gammarips.com and we'll make it right."
  },
  {
    question: "What happens if I cancel?",
    answer: "Your agent's MCP access ends with your billing cycle — no retention tricks. Everything human-readable stays free forever: the daily pool, reports, scorecard, methodology, blog, and Lab. Come back whenever your agent misses the data."
  },
];

export default function Faq() {
    // FAQPage JSON-LD is emitted by the pages that render this component
    // (home, about) — not here, to avoid duplicate FAQPage markup per page.
    return (
        <>
            <Accordion type="single" collapsible className="w-full mt-12">
                {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    )
}
