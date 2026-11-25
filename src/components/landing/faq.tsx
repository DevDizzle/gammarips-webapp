import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AGENT_CARE_PRICE,
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  FOUNDING_CAP,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
  TOOL_COUNT,
  TRIAL_DAYS,
} from "@/lib/constants";
import { type Receipts } from "@/lib/receipts";

export type FaqItem = { question: string; answer: string };

export const buildFaqs = (_receipts?: Receipts): FaqItem[] => [
  {
    question: "Do I have to trade options to use GammaRips?",
    answer:
      "No. Even though our nightly scan uses institutional options flow and volatility to find high-conviction market setups, every candidate includes mapped execution vehicles: the underlying US stock (1x), mapped 2x long or inverse single-stock ETFs, and a liquid option contract. You choose whichever instrument fits your account and risk rules.",
  },
  {
    question: "What do I get with Pro MCP Access?",
    answer: `Your AI gets our full nightly pool of roughly 40 to 50 pre-filtered US setups (stocks, 2x/inverse ETFs, and liquid call contracts), enriched every morning with volatility value (realized vs. implied vol), technical levels, and news catalysts. Pro also unlocks live 10-minute morning liquidity checks, earnings alerts, 3-day historical move data, and price replay across all ${TOOL_COUNT} MCP tools (${PRICE_MONTHLY}/mo or ${PRICE_ANNUAL}/yr after a ${TRIAL_DAYS}-day free trial).`,
  },
  {
    question: "Can you build a custom automated trading agent for my strategy?",
    answer: `Yes. On our Build an Agent page (/build), you submit your written entry, sizing, stop, and exit rules for stocks, 2x/inverse ETFs, or options. For ${BUILD_STANDARD_PRICE} flat, we engineer and safety-harden your Python trading bot (limit-only orders, fill-based stops, crash-safe duplicate guards) and deliver 100% of the code to your private GitHub repo in ${BUILD_TURNAROUND_DAYS} business days in Paper Mode. Optional maintenance is ${AGENT_CARE_PRICE}/mo after handoff.`,
  },
  {
    question: "What is included on the Free tier?",
    answer: `The Free tier on ${MCP_ENDPOINT} and gammarips.com/signals gives you a daily 3-setup preview, our daily morning briefing, market volatility regime context (VIX vs. VIX3M), the NYSE holiday calendar, and our full methodology playbooks — no card and no API key required.`,
  },
  {
    question: "Which AI apps work with GammaRips?",
    answer: `Claude (Claude Desktop, Claude.ai, and Claude Code), ChatGPT, Cursor, Codex, Gemini CLI, Grok, and any tool that supports MCP (Model Context Protocol). Chat apps like Claude and ChatGPT connect in three clicks with browser sign-in at ${MCP_PRO_ENDPOINT}; CLI and coding agents can sign in or paste an API key.`,
  },
  {
    question: "How are the daily setups filtered?",
    answer:
      "Every trading night at 23:00 ET, we scan ~3,500 optionable US stocks, narrow to the 100 most liquid names, and keep setups whose contracts clear strict liquidity and pricing floors (Mid >= $1.00, Open Interest >= 500, Delta 0.22–0.48, 10–45 days to expiration). At 05:30 ET we enrich each setup with realized-vs-implied volatility, mapped 2x/inverse ETFs, and grounded news catalysts. In walk-forward audits across 5,575 historical contracts, those liquidity floors lifted 5-minute open fill rates from 30.3% to 50.1%.",
  },
  {
    question: "Why don't you just send one daily pick?",
    answer:
      "Two reasons. First, pushing one shared trade to every subscriber crowds everyone into the same price at the open, worsening fills. Second, our own walk-forward research showed that black-box single-pick scores fail out-of-sample, whereas transparent liquidity and volatility data holds up. Your AI builds a plan sized to your own risk budget.",
  },
  {
    question: "How do the free trial and cancellation work?",
    answer: `You get full Pro MCP access for ${TRIAL_DAYS} days with zero charge if you cancel before day ${TRIAL_DAYS}. After the trial, billing is ${PRICE_MONTHLY}/mo (or ${PRICE_ANNUAL}/yr) — our founding rate locked for the first ${FOUNDING_CAP} subscribers as long as you stay active. You can cancel anytime directly from your account page with one click.`,
  },
  {
    question: "Is GammaRips financial advice?",
    answer:
      "No. GammaRips is a market-data and software-engineering vendor. We publish filtered market data, historical move statistics, and work-for-hire trading software for educational and analytical use. We never manage money, never hold your broker keys, and never tell you what to buy or sell.",
  },
];

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Accordion type="multiple" className="w-full mt-10">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground leading-relaxed">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
