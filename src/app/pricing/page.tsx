import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';

export const metadata: Metadata = {
  title: 'Pricing — GammaRips',
  description:
    'The webapp is free forever. Pro is $39/mo for the WhatsApp push and the AI chat agent inside the private group. 7-day free trial. Cancel anytime.',
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    title: 'Pricing — GammaRips',
    description:
      'Free webapp forever. Pro $39/mo for WhatsApp push + AI chat agent. 7-day free trial.',
    url: 'https://gammarips.com/pricing',
  },
};

export default function PricingPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GammaRips Pro',
    description:
      'One options trade a day, scored overnight and pushed to your phone at 07:30 ET, with an AI chat agent inside the private WhatsApp group.',
    image: 'https://gammarips.com/og-image.png?v=3',
    brand: { '@type': 'Brand', name: 'GammaRips' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '39.00',
      name: 'GammaRips Pro (monthly)',
      availability: 'https://schema.org/InStock',
      url: 'https://gammarips.com/pricing',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '39.00',
        priceCurrency: 'USD',
        unitText: 'MONTH',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <PricingClient />
    </>
  );
}
