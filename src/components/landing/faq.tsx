import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FOUNDING_CAP,
  HARNESS_REPO,
  MCP_ENDPOINT,
  MCP_PRO_ENDPOINT,
  PRICE_MONTHLY,
  TOOL_COUNT,
  TRIAL_DAYS,
} from "@/lib/constants";
import { type Receipts } from "@/lib/receipts";

export type FaqItem = { question: string; answer: string };

export const buildFaqs = (_receipts?: Receipts): FaqItem[] => [
  {
    question: "What do I get with Pro MCP Access?",
    answer: `Your AI agent gets the full GammaRips Combo A options dataset every trading night: roughly 40 to 50 liquid bullish call contracts (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45) from the 100 most liquid optionable US stocks, complete with point-in-time Realized-vs-Implied Volatility (rv_iv_ratio), technicals, flow context, and grounded news catalysts. Pro also unlocks 10-minute intraday liquidity snapshots during market hours, earnings checks, 3-day MFE/MAE outcome surfaces, and contract replay across all ${TOOL_COUNT} MCP tools (${PRICE_MONTHLY}/mo after a ${TRIAL_DAYS}-day free trial).`,
  },
  {
    question: "What is included on the Free tier?",
    answer: `The Free tier on ${MCP_ENDPOINT} and gammarips.com/signals gives you a daily 3-contract pool preview (get_pool(view="preview")), the daily macro and options-flow intelligence report, VIX/VIX3M regime context, the NYSE market calendar, and methodology playbooks—with no card and no API key required.`,
  },
  {
    question: "Which AI clients work with GammaRips?",
    answer: `Claude (Claude Code, Claude Desktop, and claude.ai), ChatGPT, Cursor, Codex, Gemini CLI, Grok, and any client that speaks MCP (Model Context Protocol). CLI and IDE clients can send your gr_live_ bearer API key or use OAuth 2.1. Chat clients such as ChatGPT, claude.ai, and Grok connect directly to ${MCP_PRO_ENDPOINT} and sign in with OAuth 2.1. Both routes reach the same ${TOOL_COUNT} tools.`,
  },
  {
    question: "What does the Combo A filter enforce?",
    answer: "Every trading night at 23:00 ET, the engine scans ~3,500 optionable US stocks, keeps the top 100 liquid universe (3M+ session shares and 25+ listed strikes), and selects one bullish call per name passing Mid >= $1.00, OI >= 500, Delta 0.22–0.48, and DTE 10–45. At 05:30 ET each contract is enriched with rv_iv_ratio ((ATR_14/Price * sqrt(252)) / IV) and grounded news catalysts. In walk-forward Catalyst Lab audits across N = 5,575 enriched contracts (66 scan dates), OI >= 500 lifted 5-minute open fill rates from 30.3% to 50.1%, and Delta 0.22–0.48 with DTE 10–45 lifted 3-day MFE >= +40% from 27.6% to 35.4%.",
  },
  {
    question: "What does the free trial include?",
    answer: `Full Pro MCP access for ${TRIAL_DAYS} days: all ${TOOL_COUNT} tools, the full 40–50 contract daily dataset, 10-minute intraday liquidity snapshots, and 3-day outcome history from minute one. Card on file, no charge during the trial. Cancel before day ${TRIAL_DAYS} and you pay nothing. After that it is ${PRICE_MONTHLY}/mo, the founding price, which the first ${FOUNDING_CAP} subscribers keep for as long as they stay subscribed.`,
  },
  {
    question: "Why don't you sell a single daily pick?",
    answer: "Two reasons. First, pushing one shared contract to every subscriber crowds everyone into the same option strike at the open, degrading fills. Second, our Catalyst Lab walk-forward XGBoost audit showed that black-box composite scores fail out-of-sample once schema missingness is stripped, whereas transparent microstructure and volatility primitives (Combo A) hold up cleanly. Your AI uses the dataset to build a trade plan tailored to your own risk budget.",
  },
  {
    question: "Do I need the open-source harness?",
    answer: `No. Any MCP client can call the tools directly in Claude, ChatGPT, Cursor, or Codex. The open-source gammarips-harness (${HARNESS_REPO.replace('https://', '')}) is an optional daily workflow repo that pairs the Pro MCP dataset with live X/web catalyst research and structured trade logging.`,
  },
  {
    question: "Is this financial advice?",
    answer: "No. GammaRips is a financial data vendor. We publish curated market data, point-in-time feature vectors, historical excursion outcomes, and methodology research. We never see your brokerage account, never manage money, and never make personalized recommendations. Any trade plan your AI builds is your own analysis of GammaRips data, and you decide.",
  },
  {
    question: "What happens if I cancel?",
    answer: "Your Pro MCP access ends at the close of your billing cycle with no retention hurdles. The 3-contract preview on /signals and /mcp, daily macro reports, and methodology pages remain free.",
  },
];

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <Accordion type="single" collapsible className="w-full mt-12">
      {faqs.map((faq, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
