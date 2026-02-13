import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, X, Minus } from 'lucide-react';
import { PublicHeader } from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Pricing | The Overnight Edge by GammaRips",
  description: "See what institutions did last night. Free daily previews. Full analysis from $49/mo.",
};

export default function PricingPage() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Daily previews & public data",
      features: [
        { name: "Daily signal previews", included: true },
        { name: "Top movers + themes", included: true },
        { name: "Public reports archive", included: true },
        { name: "AI trade thesis", included: false },
        { name: "Recommended contracts", included: false },
        { name: "Key levels (S/R)", included: false },
        { name: "Technical analysis", included: false },
        { name: "News deep-dive", included: false },
        { name: "WhatsApp alerts", included: false },
        { name: "Priority signals", included: false },
        { name: "Direct analyst access", included: false },
      ],
      cta: "Get Started",
      ctaLink: "/signals", // Direct to dashboard for free users
      variant: "outline" as const,
    },
    {
      name: "The Overnight Edge",
      price: "$49",
      period: "/mo",
      description: "Full AI analysis & levels",
      features: [
        { name: "Daily signal previews", included: true },
        { name: "Top movers + themes", included: true },
        { name: "Public reports archive", included: true },
        { name: "AI trade thesis", included: true },
        { name: "Recommended contracts", included: true },
        { name: "Key levels (S/R)", included: true },
        { name: "Technical analysis", included: true },
        { name: "News deep-dive", included: true },
        { name: "WhatsApp alerts", included: false },
        { name: "Priority signals", included: false },
        { name: "Direct analyst access", included: false },
      ],
      cta: "Subscribe",
      ctaLink: "/account", // Placeholder: Redirect to account for upgrade
      popular: true,
      variant: "default" as const,
    },
    {
      name: "The War Room",
      price: "$149",
      period: "/mo",
      description: "Real-time alerts & access",
      features: [
        { name: "Daily signal previews", included: true },
        { name: "Top movers + themes", included: true },
        { name: "Public reports archive", included: true },
        { name: "AI trade thesis", included: true },
        { name: "Recommended contracts", included: true },
        { name: "Key levels (S/R)", included: true },
        { name: "Technical analysis", included: true },
        { name: "News deep-dive", included: true },
        { name: "WhatsApp alerts", included: true },
        { name: "Priority signals", included: true },
        { name: "Direct analyst access", included: true },
      ],
      cta: "Subscribe",
      ctaLink: "/account", // Placeholder: Redirect to account for upgrade
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      
      <main className="flex-1 container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            See what institutions did last night. Start for free, upgrade for the full edge.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <div 
              key={tier.name} 
              className={`relative flex flex-col rounded-xl border ${tier.popular ? 'border-primary shadow-lg scale-105 z-10' : 'border-border'} bg-card p-6 md:p-8`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 -mt-3 mr-6 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold font-headline">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && <span className="text-muted-foreground ml-1">{tier.period}</span>}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              </div>

              <div className="flex-1 mb-8">
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground/30 shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                variant={tier.variant} 
                className="w-full" 
                asChild
              >
                <Link href={tier.ctaLink}>
                  {tier.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center max-w-2xl mx-auto bg-muted/30 p-8 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Need Enterprise Access?</h3>
          <p className="text-muted-foreground mb-4">
            For funds, family offices, and API access, contact us directly for custom pricing.
          </p>
          <Button variant="link" asChild>
            <a href="mailto:support@gammarips.com">Contact Sales &rarr;</a>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
