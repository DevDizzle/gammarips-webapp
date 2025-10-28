
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
        question: "What happens after my 30-day free trial?",
        answer: "You will be invited to upgrade to our Pro plan for $19/month. If you choose not to, you will lose access to new daily signals and some premium features, but you can continue to use a limited version of the dashboard."
    },
    {
        question: "What kind of trader is this for?",
        answer: "ProfitScout is designed for options traders who want to leverage data-driven insights to speed up their research, discover new opportunities, and make more informed decisions."
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
