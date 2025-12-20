
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
    {
        question: "Is this financial advice?",
        answer: "No. GammaRips is an AI-powered educational research tool, not a registered investment advisor. We surface data-driven trade ideas and performance stats, but we do not provide personalized financial, investment, or trading advice. You’re fully responsible for your own trades, position sizing, and risk management."
    },
    {
        question: "How do you find bullish call options setups?",
        answer: "We start by ranking the strongest stocks in the Russell 1000 using AI-driven conviction scores, then look for call contracts with attractive liquidity, risk/reward, and higher gamma so they respond more strongly to underlying price moves. In simple terms: we hunt for strong stocks first, then pair them with option contracts that can participate in potential breakouts-while clearly showing you the risk."
    },
    {
        question: "Do you track unusual options flow or volume spikes?",
        answer: "Yes. We treat unusual options activity (UOA)-for example, volume that’s large relative to open interest or recent averages-as a conviction booster in our scoring. It’s one of several inputs into the signal, not the only thing we look at, so you’re not just chasing raw flow without context."
    },
    {
        question: "How does the $19/month membership work?",
        answer: "Membership is a flat $19 per month, billed monthly with no long-term contract. You can cancel anytime. We also offer a 7-day money-back guarantee on your first month-if you don’t find GammaRips useful, email us within the first 7 days and we’ll refund that first payment."
    },
    {
        question: "What do I get immediately after signing up?",
        answer: "You get instant access to: Today’s daily options playbook (our “Rip Hunter” breakout and hedge signals), the interactive research dashboard, AI-generated briefings that explain the “why” behind each stock, and our live performance tracker, which currently measures signals from December 9, 2025 onward."
    },
    {
        question: "Does GammaRips use AI to pick stocks?",
        answer: "Yes. GammaRips uses large language models on Google Cloud’s Vertex AI to analyze earnings call transcripts, SEC filings, and news, then converts thousands of data points into a single directional conviction score for each stock. That conviction score sits on top of our quantitative filters for trend, volatility, and liquidity."
    },
    {
        question: "What is the “Rip Hunter” protocol?",
        answer: "The Rip Hunter protocol is our stock-first breakout engine. It looks for high-conviction stocks that are primed for sharp moves (“rips”), then pairs them with short-term, higher-gamma options contracts that can react strongly to those moves. These trades can be powerful but also carry higher risk and faster time decay, so they’re intended for experienced options traders."
    },
    {
        question: "Is this platform for day trading or swing trading?",
        answer: "GammaRips is optimized for swing trading. Most signals are designed for moves over roughly 3 to 20 trading days, so you can capture trends without staring at the screen all day. You can still choose to manage entries and exits intraday, but our research is built around short-term swing horizons, not hyper-scalping."
    },
    {
        question: "How do you handle risky or volatile markets?",
        answer: "When conviction is lower or conditions are choppy, our “Tier 2” safety logic automatically tightens the rules: stricter liquidity and spread requirements, fewer marginal setups, and more emphasis on quality over quantity. That doesn’t remove the risk of options trading, but it helps filter out low-quality ideas when markets are noisy."
    },
    {
        question: "Can I use GammaRips with a small account?",
        answer: "Possibly-but only if you fully understand options risk. GammaRips often highlights lower-cost, further out-of-the-money contracts that offer high potential reward and a high risk of losing 100% of the premium. For smaller accounts, that can be attractive because you can define your maximum loss up front, but it is still speculative and not suitable for everyone."
    },
    {
        question: "Do you analyze news and earnings calls?",
        answer: "Yes. Our pipelines ingest and summarize earnings call transcripts, SEC filings, and news to detect catalysts that pure technical screens might miss. That qualitative information is combined with price, volume, and options data to strengthen or weaken the conviction score behind each idea."
    },
    {
        question: "When did you start tracking performance for the current engine?",
        answer: "We significantly upgraded our scoring logic in late 2025 and reset live performance tracking as of December 22, 2025. The performance charts you see on the site reflect signals from the current engine only. We keep earlier data internally for research but don’t want you judging the new engine by the old version’s behavior."
    }
]

export default function Faq() {
    return (
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
    )
}
