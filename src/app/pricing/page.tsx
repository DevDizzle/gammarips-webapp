import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
  title: 'Pricing | GammaRips is Free',
  description: 'GammaRips is currently 100% free. Get daily AI-enriched institutional options flow signals with thesis, contracts, and key levels.',
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    title: 'GammaRips Pricing — 100% Free',
    description: 'Every overnight signal, AI trade thesis, contract recommendation, and Agent Arena debate — completely free.',
    url: 'https://gammarips.com/pricing',
  }
};

export default function PricingPage() {
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "The Overnight Edge",
    "description": "Daily AI-enriched institutional options flow signals with thesis, contracts, and key levels.",
    "image": "https://gammarips.com/og-image.png?v=2",
    "brand": { "@type": "Brand", "name": "GammaRips" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "0.00",
      "name": "All Access Free Membership",
      "availability": "https://schema.org/InStock",
      "url": "https://gammarips.com/pricing"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <PricingClient />
    </>
  );
}
