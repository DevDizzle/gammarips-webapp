import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
  {
    question: "What exactly lands on my phone every morning?",
    answer: "By 07:30 ET you get one pick or none. A ticker, a direction (call or put), a specific contract with strike and expiration, a recommended mid price, a −60% stop, and a +80% target. Some days the engine stays out — when VIX closes above VIX3M (backwardation) or nothing clears the filter stack, nothing is sent. On those days, do nothing. That's the routine."
  },
  {
    question: "How does the engine pick which one?",
    answer: "Four mechanical filters, in order. (1) Overnight score ≥ 1 — any level of unusual activity qualifies. (2) Bid-ask spread ≤ 10%. (3) Directional dollar volume > $500K. (4) Volume/open-interest ratio > 2.0 at the focal strike, moneyness 5–15% OTM, and VIX ≤ VIX3M. Whatever clears all four, the pick is whichever has the highest directional dollar volume. Five deterministic tiebreakers after that — no judgment, no override."
  },
  {
    question: "What's free, what's paid, what do you actually charge for?",
    answer: "Free webapp: the full signals haystack — every signal that cleared the enrichment gates this morning, with per-ticker drill-downs, daily reports, methodology, and the public scorecard. Pro ($39/mo, 7-day free trial): the curation. The engine picks ONE trade each weekday morning — strike, DTE, contract, stop, target, exit — and delivers it to your inbox + private WhatsApp group at 07:30 ET. Plus access to an AI chat agent in the WhatsApp group that answers questions against live engine data."
  },
  {
    question: "Why is the curated pick blurred on the homepage?",
    answer: "Because the curation IS the value. The free webapp shows every signal — that's the haystack. Pro picks THE one for you so you don't have to scan it. The blurred card on the homepage exists so you can see that we picked something today; subscribing reveals which one and gets it delivered to your inbox + WhatsApp at 07:30 ET. The signals haystack itself is never paywalled."
  },
  {
    question: "What if the trade hits −60% right after I buy it?",
    answer: "Then the stop fills and you lose up to $300 on a $500 position. That is the engineered maximum per-trade loss, and it's the whole point. The trade either hits −60%, +80%, or closes at 3:50 ET on day-3 — nothing else. No 'should I hold one more day' decisions. A −60% fill is a clean outcome for the routine; you closed and moved on."
  },
  {
    question: "Are you telling me what to trade?",
    answer: "No. GammaRips is educational content about what one mechanical engine picked, based on public overnight options-flow data. You decide whether to take the trade in your account, at what size, and whether to deviate. We never see your account, never manage your money, and never personalize the pick. If you want personalized investment advice, work with a licensed advisor."
  },
  {
    question: "Where's the track record?",
    answer: "On the Scorecard page, updated as the engine's paper trades close. We promoted V5.4 — our LLM agent ranker — on May 8, 2026; the V5.4 cohort starts fresh from that date. Sample size is small — we'll publish specific win-rate numbers when at least 30 V5.4 trades have closed. In the meantime, every signal is timestamped, every outcome is logged, and nothing is edited after the fact. That's the receipt."
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
