
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
    {
        question: "Is this financial advice?",
        answer: "No. ProfitScout provides educational and informational content only to support your research process. We are not financial advisors. All investments involve risk, and you should always conduct your own due diligence."
    },
    {
        question: "How do you find bullish call options setups?",
        answer: "We analyze options chains daily, scoring contracts based on liquidity, implied volatility vs. realized volatility, and alignment with the stock’s trend. This process allows us to surface candidates that our models identify as having a favorable risk/reward profile."
    },
    {
        question: "Do you track unusual options flow or volume spikes?",
        answer: "Yes, our analysis includes monitoring for significant volume and elevated activity. The AI Analyst Briefing often highlights notable volume surges as a key part of its technical analysis, similar to how 'unusual options flow' tools spot aggressive trades."
    },
    {
        question: "What happens after my 30-day free trial?",
        answer: "You will be invited to upgrade to our Pro plan for $19/month. If you choose not to, you will lose access to new daily signals and some premium features, but you can continue to use a limited version of the dashboard."
    },
    {
        question: "What do I get immediately after signing up?",
        answer: "You will get instant access to the interactive dashboard to explore today's top setups. You'll also be added to our mailing list to receive your first 'Daily Setups' email the next morning."
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
