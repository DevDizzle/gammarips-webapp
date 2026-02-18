import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
  title: 'Pricing | The Overnight Edge by GammaRips',
  description: 'Free daily signal previews. $49/mo for the full trade plan with AI thesis and contract recommendations. $149/mo for real-time WhatsApp alerts and direct analyst access.',
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    title: 'GammaRips Pricing — Overnight Edge $49/mo, War Room $149/mo',
    description: 'Daily AI-enriched institutional options flow signals. Choose your edge.',
    url: 'https://gammarips.com/pricing',
  }
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "GammaRips — The Overnight Edge",
  "description": "Daily AI-enriched institutional options flow signals with thesis, contracts, and key levels.",
  "brand": { "@type": "Brand", "name": "GammaRips" },
  "offers": [
    {
      "@type": "Offer",
      "name": "The Overnight Edge",
      "price": "49.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "url": "https://gammarips.com/pricing"
    },
    {
      "@type": "Offer",
      "name": "The War Room",
      "price": "149.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2027-12-31",
      "availability": "https://schema.org/InStock",
      "url": "https://gammarips.com/pricing"
    }
  ]
};

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <PricingClient />
    </>
  );
}
