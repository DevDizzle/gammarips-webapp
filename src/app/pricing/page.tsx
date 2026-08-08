import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';
import { TOOL_COUNT, PRICE_MONTHLY, OG_IMAGE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    `Humans browse free, agents subscribe. The website is free forever; ${PRICE_MONTHLY}/mo buys full MCP access for your AI agent. 7-day free trial.`,
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Pricing | GammaRips',
    description:
      `Humans browse free. Agents subscribe. ${PRICE_MONTHLY}/mo for full MCP data access for your AI agent. 7-day free trial.`,
    url: 'https://gammarips.com/pricing',
  },
};

export default function PricingPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GammaRips Agent Access',
    description:
      `MCP data access for AI agents: the curated overnight options-flow pool in structured form, opportunity surfaces (realized excursion distributions per historical setup), a queryable outcome database, regime context, and methodology playbooks. ${TOOL_COUNT} tools for Claude, ChatGPT, or any MCP client. Data on a paper-trading basis, not investment advice.`,
    image: 'https://gammarips.com/og-image.png?v=3',
    brand: { '@type': 'Brand', name: 'GammaRips' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '39.00',
      name: 'GammaRips Agent Access (monthly)',
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
