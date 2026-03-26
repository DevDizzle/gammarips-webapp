import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
  {
    question: "What do I actually get every morning?",
    answer: "By 8:30 AM EST, you get a scored list of every ticker where institutions placed unusual options bets overnight. Free users see the ticker, score, direction, and move size. Paid users ($49/mo) get the full AI trade thesis, specific contract recommendations with strike and expiry, key support/resistance levels, and technical + news analysis."
  },
  {
    question: "How do you decide which signals are worth paying attention to?",
    answer: "Each signal is scored 1-10 based on four things: how much money institutions put in (positioning size), how many strike prices had unusual activity (strike breadth), how much volume there was vs existing positions (vol/OI ratio), and whether the money was directionally concentrated in calls or puts (flow imbalance). Scores of 6+ get the full AI enrichment."
  },
  {
    question: "Can I try it without paying?",
    answer: "Yes. Free accounts see daily signal previews — ticker, score, direction, percent move, and positioning size — plus daily market themes and the full reports archive. You can watch the signals for as long as you want before deciding if the full analysis is worth $49/mo."
  },
  {
    question: "What's the difference between free and the $49 plan?",
    answer: "Free shows you WHERE institutions moved. The $49 Overnight Edge plan tells you WHY they moved and WHAT to do about it — the AI-written trade thesis, specific contract recommendations (strike + expiry), key price levels where the trade works or breaks down, and detailed technical and news analysis."
  },
  {
    question: "Is the War Room worth 3x the price?",
    answer: "The War Room ($149/mo) is for active traders who want real-time flow alerts during market hours via WhatsApp — not just the overnight scan. You also get direct access to ask GammaMolt questions and priority access to the highest-conviction setups before they're published to Edge subscribers."
  },
  {
    question: "What time do I need to be up?",
    answer: "Signals are ready by 8:30 AM EST. You don't need to be up at 4 AM when the scanner runs — everything is waiting for you when you open gammarips.com with your morning coffee. Most traders check between 8:30-9 AM and have their trade plan set before the 9:30 open."
  },
  {
    question: "Are you telling me what to trade?",
    answer: "No. We surface what institutional money did overnight and generate AI analysis to help you understand it. Every signal is timestamped and tracked publicly so you can judge our accuracy — but all trading decisions are yours. Past performance doesn't guarantee future results."
  },
  {
    question: "Wait — an AI runs this?",
    answer: "The daily pipeline is operated by GammaMolt, an autonomous AI agent built on Claude (Anthropic). GammaMolt runs the scanning, scoring, enriching, reporting, and content. The system was built by Evan Parra, an ML engineer and data architect. Every signal is automated and publicly tracked — no human cherry-picking the good calls."
  },
];

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
