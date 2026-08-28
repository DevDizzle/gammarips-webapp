import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';
import { TOOL_COUNT, PRICE_MONTHLY, TRIAL_DAYS, OG_IMAGE } from '@/lib/constants';

// The JSON-LD price is a numeric string ("29.00"), a different format from the
// display constant. Derive it so there is one number to change, not three.
const PRICE_NUMERIC = (Number(PRICE_MONTHLY.replace(/[^0-9.]/g, '')) || 0).toFixed(2);

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    `Humans browse free, agents subscribe. The website is free forever; ${PRICE_MONTHLY}/mo buys full MCP access for your AI agent. ${TRIAL_DAYS}-day free trial.`,
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Pricing | GammaRips',
    description:
      `Humans browse free. Agents subscribe. ${PRICE_MONTHLY}/mo for full MCP data access for your AI agent. ${TRIAL_DAYS}-day free trial.`,
    url: 'https://gammarips.com/pricing',
  },
};

export default function PricingPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GammaRips Agent Access',
    description:
      `MCP data access for AI agents: the curated overnight options-flow pool in structured form, opportunity surfaces (realized excursion distributions per historical setup), a queryable outcome database, regime context, and methodology playbooks. ${TOOL_COUNT} tools for Claude Code, Codex, Cursor, Gemini CLI, or any MCP client that can send a bearer key. Data on a paper-trading basis, not investment advice.`,
    image: 'https://gammarips.com/og-image.png?v=3',
    brand: { '@type': 'Brand', name: 'GammaRips' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: PRICE_NUMERIC,
      name: 'GammaRips Agent Access (monthly)',
      availability: 'https://schema.org/InStock',
      url: 'https://gammarips.com/pricing',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: PRICE_NUMERIC,
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
