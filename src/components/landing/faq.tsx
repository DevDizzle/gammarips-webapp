import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { TOOL_COUNT, PRICE_MONTHLY } from "@/lib/constants"

export const faqs = [
  {
    question: "What is agentic trading?",
    answer: "Using an AI agent (Claude, ChatGPT, or one you build) as your own market analyst instead of following someone else's calls. The agent pulls real data, reasons over it, and lays out the picture; you keep the judgment and place (or skip) the trade. The catch: agents are only as good as the data they can reach. A chatbot with no market data will happily improvise. GammaRips is the data layer that fixes that for options flow. Your agent connects over MCP and reasons over curated, timestamped data with no hindsight in it, instead of vibes."
  },
  {
    question: "What does GammaRips actually sell?",
    answer: `Data and tools, not picks. The paid product is MCP access for your AI agent: today's curated options-flow pool in structured form, the opportunity surface for historical setups (how far each contract actually ran, and how far it drew down), a queryable outcome database, regime context, and methodology playbooks: ${TOOL_COUNT} tools in total. Everything human-readable on gammarips.com is free, forever. The ${PRICE_MONTHLY}/mo is the machine connection.`
  },
  {
    question: "Which AI agents work with this?",
    answer: `Anything that speaks MCP (Model Context Protocol). The free tier works in every MCP client: Claude Code, Codex, Cursor, Gemini CLI, claude.ai and Claude Desktop custom connectors, ChatGPT with Developer mode, Grok connectors, or any MCP client library. The paid tools need your API key in an Authorization header, and today Claude Code, Codex, Cursor and Gemini CLI can send it. ChatGPT cannot send a key (OAuth sign-in is on the roadmap), and claude.ai gets a header field in a limited rollout. Pick your client in the connect section on the homepage. Each tab shows the exact steps and states whether the paid tools run in that client today. Once connected, the ${TOOL_COUNT} tools show up like native capabilities.`
  },
  {
    question: "Why don't you just tell me what to buy?",
    answer: "Two reasons, and we mean both. First, shared picks get crowded: everyone piling into the same thin options contract destroys the very thing they paid for. Second, our own published data shows that mechanically buying everything the engine surfaces, under a fixed exit rule, loses money. The value isn't a pick. It's the surface a good trade comes from: a small curated pool plus the historical data showing how setups like each one actually behaved. We give your agent that surface. It reasons to its own conclusion, sized to your risk, on your horizon."
  },
  {
    question: "How is the pool curated?",
    answer: "Every weeknight the engine ranks 3,532 optionable US names by liquidity: the name must have traded 3M+ shares that session and carry a chain with 25 or more listed strikes, then the top 100 by combined chain dollar volume and share volume survive. We keep the bullish names and price one out-of-the-money call in each, chosen on contract liquidity. That is a pool of roughly 40 to 50 contracts, each carrying its flow data, technicals, news context and contract detail. Two safety checks sit on top: no names with earnings in the window, and a market-stress check (VIX at or below VIX3M). Every candidate is checked so nothing your agent sees contains information that wasn't knowable at scan time. Note what this is not: we do not claim these are the best contracts, and we tested that claim. See the next question."
  },
  {
    question: "Is the pool better than picking at random?",
    answer: "On returns, we could not show that it is, and we say so. In August 2026 we ran two pre-registered tests, decision rules written before any data was pulled. Against liquidity-matched and random optionable controls over 87 trading days, the pool was not distinguishable on same-day return or on realized excursion. A second test over 57 days found no signal from unusual-activity ranking inside the liquid universe either. Those tests can detect a difference of about 5 percentage points per trade and cannot detect 1 to 2, so the honest reading is no large edge, not no edge. What did measurably improve is whether a contract can be traded at all: on a 60-day window ending 2026-08-14, the share of candidates with no fill at 10:00 ET fell from 40.5% to 6.1% after we moved the scan to liquidity-first. Those are study numbers on a stated window, not a live property of today's pool. This is why we sell the data layer and the outcome history rather than a ranked list."
  },
  {
    question: "Where's the track record?",
    answer: "On the Track Record page, and in the Lab. Every candidate in the pool is tracked to its real outcome (how high it ran, how far it fell, and a fixed-exit baseline), published as distributions with sample sizes attached, winners and losers counted the same way. We tell you the unflattering part up front: the whole pool bought blindly under a fixed exit is negative. That number is exactly why we sell the data layer and not a pick. The exit is your agent's job."
  },
  {
    question: "Is this financial advice?",
    answer: "No. GammaRips is a data vendor. We publish market data, methodology, and research on a paper-trading basis. We never see your account, never manage money, and never make personalized recommendations, and the MCP deliberately has no 'what should I buy' endpoint. What your agent concludes from the data is your analysis, not our advice. If you want personalized investment advice, work with a licensed advisor."
  },
  {
    question: "Can't I just scrape the free site?",
    answer: `The webapp shows today's pool and reports in human-readable form, and it always will, free. The MCP is a different animal: structured point-in-time data built for machine reasoning, the historical opportunity-surface and outcome databases that never render on a webpage, exit-rule simulation, regime context, and the methodology playbooks, including the bracket-tournament selection pattern your agent can run against its own objective. You could rebuild some of that from scraping. By the time you have, you'll have built a worse version of the thing we sell for ${PRICE_MONTHLY}.`
  },
  {
    question: "Who runs this?",
    answer: "Evan Parra (founder, ML engineer, data architect) built the engine. The nightly pipeline (scanning, scoring, enriching, publishing) runs autonomously, and every decision is logged to BigQuery. The Lab publishes experiments run on the engine's own data, including the failed ones. Read more on the About page."
  },
  {
    question: "What happened to the WhatsApp pick subscription?",
    answer: `Retired. We used to sell a daily pushed pick for ${PRICE_MONTHLY}/mo; we ended it deliberately. A single shared pick concentrates everyone into one contract, and our research kept showing the edge lives in how a setup is traded, not in the name itself. The same ${PRICE_MONTHLY} now buys something better-aligned: full MCP data access, so your agent works the whole pool your way. If you had an active subscription, email evan@gammarips.com and we'll make it right.`
  },
  {
    question: "What happens if I cancel?",
    answer: "Your agent's MCP access ends with your billing cycle. No retention tricks. Everything human-readable stays free forever: the daily pool, reports, scorecard, methodology, blog, and Lab. Come back whenever your agent misses the data."
  },
];

export default function Faq() {
    // FAQPage JSON-LD is emitted by the pages that render this component
    // (home, about), not here, to avoid duplicate FAQPage markup per page.
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
