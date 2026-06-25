import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
  {
    question: "What exactly lands on my phone, and when?",
    answer: "At ~09:50 ET — about ten minutes before the 10:00 ET entry — you get one pick or none. A ticker, a bullish call contract — strike and expiration, a recommended mid price, a −30% stop, and a +40% target. V7 'GIGO' — Get In, Get Out: entry 10:00 ET, exit flat 15:45 ET the same day. The pick lands right before the trade so it's set on fresh, real-time liquidity. Some days the engine stays out — when VIX closes above VIX3M (backwardation), when the enriched pool is empty, or when the selection tournament fails closed, nothing is sent. On those days, do nothing. That's the routine."
  },
  {
    question: "How does the engine pick which one?",
    answer: "A tournament, not a scoring formula. First a thin bar: overnight score ≥ 4 with directional dollar volume > $500K to be enriched at all, then two safety rails (no earnings during the same-day hold; VIX ≤ VIX3M). Then a BULLISH-only gate and a delta edge-rank keep the ~50 strongest bullish setups, which go into a randomized bracket tournament: three independent brackets each shuffle the pool, an LLM advances the top 2 from batches of ≤10 round after round until one winner remains, and the three bracket winners vote (3/3 = high confidence, 2/3 = medium, 1/3 = low). No memory, no rubric, no weights, and every candidate is leakage-checked first. Just before the pick goes out, the engine re-checks each candidate's live open interest and drops any contract too illiquid to actually trade, so the one you get is one you can realistically enter and exit at fair prices."
  },
  {
    question: "What's free, what's paid, what do you actually charge for?",
    answer: "Free webapp: the ~50 bullish setups we analyze each morning, with per-ticker drill-downs, daily reports, methodology, and the public scorecard. Pro ($39/mo, 7-day free trial): the curation. The engine picks ONE trade each weekday — strike, DTE, contract, stop, target, exit — and delivers it to your inbox + private WhatsApp group at ~09:50 ET, just before the 10:00 entry. Plus access to an AI chat agent in the WhatsApp group that answers questions against live engine data."
  },
  {
    question: "Why is the curated pick blurred on the homepage?",
    answer: "Because the curation IS the value. The free webapp shows the ~50 bullish setups we analyze each morning — that's the haystack. Pro picks THE one for you so you don't have to scan it. The blurred card on the homepage exists so you can see that we picked something today; subscribing reveals which one and gets it delivered to your inbox + WhatsApp at ~09:50 ET. The signals haystack itself is never paywalled."
  },
  {
    question: "What if the trade hits −30% right after I buy it?",
    answer: "Then the stop fills and you lose up to $150 on a $500 position. That is the engineered maximum per-trade loss, and it's the whole point. The trade either hits −30%, +40%, or closes flat at 15:45 ET the same day — nothing else. No 'should I hold one more day' decisions. A −30% fill is a clean outcome for the routine; you closed and moved on."
  },
  {
    question: "Are you telling me what to trade?",
    answer: "No. GammaRips is educational content about what one mechanical engine picked, based on public overnight options-flow data. You decide whether to take the trade in your account, at what size, and whether to deviate. We never see your account, never manage your money, and never personalize the pick. If you want personalized investment advice, work with a licensed advisor."
  },
  {
    question: "Where's the track record?",
    answer: "On the Scorecard page, updated as the engine's paper trades close. We launched V7 — our randomized bracket tournament — on June 4, 2026; the V7 cohort starts fresh from that date. Sample size is small — we'll publish specific win-rate numbers when at least 30 V7 trades have closed. In the meantime, every signal is timestamped, every outcome is logged, and nothing is edited after the fact. That's the receipt."
  },
  {
    question: "Why one trade a day? Everyone else sends dozens.",
    answer: "Because you can't take dozens and keep a job. And because most 'more signals' services are firehoses with no exit rules, and the user ends up cherry-picking the ones that worked in hindsight. We'd rather be wrong one time a day than right-in-retrospect twelve times a day."
  },
  {
    question: "Who runs this?",
    answer: "Evan Parra (founder, ML engineer, data architect) built the engine. An autonomous AI operator named GammaMolt runs the daily pipeline — scanning, scoring, enriching, publishing, posting. Every decision is logged to BigQuery. Nothing is human-curated in the pick path. Read more on the About page."
  },
  {
    question: "What happens if I cancel?",
    answer: "You keep Pro access through the end of your billing cycle. After that you lose the curated daily pick email + WhatsApp delivery and the homepage's pick card reverts to the blurred state. The full signals haystack on /signals, the daily reports, methodology, and scorecard all stay free forever. No retention tricks, no downgraded data."
  },
];

export default function Faq() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
            "@type": "Question",
            "name": f.question,
            "acceptedAnswer": { "@type": "Answer", "text": f.answer }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
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
