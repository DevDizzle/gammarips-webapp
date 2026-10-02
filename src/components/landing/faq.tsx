import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
  FOUNDING_CAP,
  HARNESS_REPO,
  MCP_PRO_ENDPOINT,
  PRICE_MONTHLY,
  TOOL_COUNT,
  TRIAL_DAYS,
} from "@/lib/constants"
import {
  LIVE_RECORD,
  POOL_HIT_RATES,
  RECEIPTS_DISCLAIMER,
  int,
  pct,
  usd,
} from "@/lib/receipts"

// Positive, true answers. Numbers come from src/lib/receipts.ts and
// src/lib/constants.ts only. An answer that shows a performance number ends
// with RECEIPTS_DISCLAIMER (forbidden claim 5). The homepage FAQPage JSON-LD
// derives from this array, so the schema always matches what renders.
export const faqs = [
  {
    question: "What do I get with Agent Access?",
    answer: `Your AI gets the full GammaRips pool every trading night: roughly 40 to 50 calls with deep books, one per bullish name among the 100 most liquid US stocks, each with its thesis, technicals, catalyst, and contract detail. It also gets fresh liquidity checks, earnings dates, the exit lab (how often past pool contracts hit each profit level and each stop, plus a score for any target and stop you choose), contract replay, regime context, and the methodology playbooks. That is ${TOOL_COUNT} tools, ${PRICE_MONTHLY}/mo after a ${TRIAL_DAYS}-day free trial. Everything human-readable on gammarips.com stays free.`
  },
  {
    question: "What does a trade plan look like?",
    answer: "Ask your AI for a trade and it comes back with 1 to 3 candidates from the pool that pass the liquidity and earnings checks. Each one has the contract, why it passed, an entry (about 10:00 ET, a limit order near the mid), a target and a stop set from the exit lab history, the maximum loss, and a size that keeps that loss inside your risk budget. If nothing passes, you get a reasoned no-trade with the check that failed. You decide, and you place the order in your own brokerage. GammaRips never places trades."
  },
  {
    question: "Which AIs work with this?",
    answer: `Claude (Claude Code, Claude Desktop, and claude.ai), ChatGPT, Cursor, and Codex, plus Gemini CLI, Grok, and any other client that speaks MCP (Model Context Protocol). Claude Code, Codex, Cursor, and Gemini CLI send your API key in a header. A chat client that cannot send a header, such as ChatGPT, claude.ai, or Grok, adds ${MCP_PRO_ENDPOINT} and signs in instead. Both routes reach the same ${TOOL_COUNT} tools. The install section on this page has the exact steps for each client.`
  },
  {
    question: "What does the free trial include?",
    answer: `Full Agent Access for ${TRIAL_DAYS} days: every pro tool, the full pool, the exit lab, and trade plans in your AI from minute one. Card on file, no charge during the trial. Cancel before day ${TRIAL_DAYS} and you pay nothing. After that it is ${PRICE_MONTHLY}/mo, the founding price, which the first ${FOUNDING_CAP} subscribers keep for as long as they stay subscribed.`
  },
  {
    question: "Why don't you just tell me what to buy?",
    answer: "Your AI builds a plan for your account and your risk: your size, your stop, your budget. Shared picks get crowded. When every subscriber piles into the same contract, the fills get worse for all of them. A plan your AI builds from the data is yours alone. That is why GammaRips has no pick endpoint."
  },
  {
    question: "Where's the track record?",
    answer: `On the scorecard. Claude Code trades the GammaRips pool with real money in an agent account: ${LIVE_RECORD.wins} of ${LIVE_RECORD.trades} trades closed at a profit, ${usd(LIVE_RECORD.netUsd)} net realized, every trade counted (entries ${LIVE_RECORD.windowLabel}). The pool history is public too. Of ${int(POOL_HIT_RATES.n)} pool contracts (${POOL_HIT_RATES.windowLabel}), ${pct(POOL_HIT_RATES.hit25, 1)} hit +25%, ${pct(POOL_HIT_RATES.hit50, 1)} hit +50%, and ${pct(POOL_HIT_RATES.hit100, 1)} hit +100% within ${POOL_HIT_RATES.horizon}. The Lab publishes the research behind the engine. ${RECEIPTS_DISCLAIMER}`
  },
  {
    question: "How is the pool curated?",
    answer: "Every trading night the engine ranks about 3,500 optionable US stocks by liquidity. A name must trade 3M+ shares that session and carry 25 or more listed strikes, then the top 100 by combined chain dollar volume and share volume go through. The engine keeps the bullish names and chooses one out-of-the-money call in each on contract liquidity. That gives a pool of roughly 40 to 50 contracts, each with its flow data, technicals, news context, and contract detail. Every field is point-in-time, so nothing your AI sees contains information that was not knowable at scan time. Earnings dates are not screened out of the pool, so your AI checks each candidate's earnings date before it plans a trade."
  },
  {
    question: "Is this financial advice?",
    answer: "No. GammaRips is a data vendor. We publish market data, methodology, and research. We never see your account, never manage money, and never make personalized recommendations, and the MCP has no 'what should I buy' endpoint. The plan your AI builds is your own analysis of GammaRips data, and you decide. For personalized investment advice, work with a licensed advisor."
  },
  {
    question: "Do I need the harness?",
    answer: `No. Any MCP client can call the tools directly, and your AI can build a trade plan in Claude, ChatGPT, Cursor, or Codex as is. The harness is a free, open-source repo for traders who want a daily loop: a morning screen, a journal, and an after-the-close review. Clone it from ${HARNESS_REPO.replace('https://', '')}. Its screen uses the pro tools, so it runs on Agent Access.`
  },
  {
    question: "Can't I just scrape the free site?",
    answer: `The website shows the pool and the daily reports free, and it always will. Agent Access is a different thing: structured point-in-time data built for your AI, the outcome history and exit lab that never render on a web page, liquidity checks, contract replay, regime context, and the methodology playbooks. You could rebuild part of that from a scrape. It would cost you far more than ${PRICE_MONTHLY}/mo of your own time.`
  },
  {
    question: "What happens if I cancel?",
    answer: "Your AI's MCP access ends with your billing cycle. No retention tricks. Everything human-readable stays free: the daily pool, reports, scorecard, methodology, blog, and Lab. Come back whenever your AI needs the data again."
  },
  {
    question: "Who runs this?",
    answer: "Evan Parra (founder, ML engineer, data architect) built the engine. The nightly pipeline (scan, enrichment, reports, and outcome labels) runs on its own, and every run is logged to BigQuery. The Lab publishes the experiments run on the engine's own data. Read more on the About page."
  },
  {
    question: "What happened to the WhatsApp pick subscription?",
    answer: "Retired. It pushed one shared pick to every subscriber, and a shared pick puts everyone into the same contract. Agent Access gives your AI the whole pool and the exit lab instead, so it builds a plan for your account. If you had an active subscription, email evan@gammarips.com and we'll make it right."
  },
  {
    question: "What is agentic trading?",
    answer: "Trading with an AI agent as your analyst. Your AI (Claude, ChatGPT, Cursor, Codex, or one you build) pulls real data, reasons over it, and builds a trade plan. You keep the judgment and place the trade, or skip it. An agent is only as good as the data it can reach. GammaRips is that data for options: a nightly pool of liquid contracts and the history to plan the exit, served over MCP."
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
