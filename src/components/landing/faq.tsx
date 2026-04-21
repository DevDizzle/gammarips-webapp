import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
  {
    question: "What exactly lands on my phone every morning?",
    answer: "By 09:00 ET you get one pick or none. A ticker, a direction (call or put), a specific contract with strike and expiration, a recommended mid price, a −60% stop, and a +80% target. Some days the engine stays out — when VIX closes above VIX3M (backwardation) or nothing clears the filter stack, nothing is sent. On those days, do nothing. That's the routine."
  },
  {
    question: "How does the engine pick which one?",
    answer: "Four mechanical filters, in order. (1) Overnight score ≥ 1 — any level of unusual activity qualifies. (2) Bid-ask spread ≤ 10%. (3) Directional dollar volume > $500K. (4) Volume/open-interest ratio > 2.0 at the focal strike, moneyness 5–15% OTM, and VIX ≤ VIX3M. Whatever clears all four, the pick is whichever has the highest directional dollar volume. Five deterministic tiebreakers after that — no judgment, no override."
  },
  {
    question: "What's free, what's paid, what do you actually charge for?",
    answer: "The full webapp is free forever — today's pick, full signals list, daily report, per-ticker deep dive, methodology, and the public scorecard. Pro ($39/mo, 7-day free trial) adds a WhatsApp push at 09:00 ET, an exit reminder at 15:50 ET day-3, and access to an AI chat agent inside the private WhatsApp group that answers questions against live engine data."
  },
  {
    question: "Why is the webapp free if you charge for WhatsApp?",
    answer: "We charge for convenience, not information. Pro subscribers get the push to their phone so they don't have to check the webapp at 09:00 ET. They also get the chat agent. Free users see the same pick on the same page at the same second. No information is behind a paywall. We think that's the honest model."
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
    answer: "On the Scorecard page, updated as the engine's paper trades close. We started V5.3 paper-trading on April 17, 2026, so sample size is small — we will publish specific win-rate numbers when at least 30 V5.3 trades have closed. In the meantime, every signal is timestamped, every outcome is logged, and nothing is edited after the fact. That's the receipt."
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
    answer: "You keep Pro access through the end of your billing cycle, then lose the WhatsApp push and chat agent. The webapp stays free forever. No retention tricks, no downgraded experience. Your pick appears on the home page the same as it did before you subscribed."
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
