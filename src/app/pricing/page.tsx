import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';
import { TOOL_COUNT, PRICE_MONTHLY, TRIAL_DAYS, OG_IMAGE } from '@/lib/constants';

// The JSON-LD price is a numeric string ("29.00"), a different format from the
// display constant. Derive it so there is one number to change, not three.
const PRICE_NUMERIC = (Number(PRICE_MONTHLY.replace(/[^0-9.]/g, '')) || 0).toFixed(2);

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    `Pro gives your AI better-quality option contracts every night and the exit lab, so it builds the trade plan with you in Claude, ChatGPT, Cursor, or Codex. ${PRICE_MONTHLY}/mo founding price, ${TRIAL_DAYS}-day free trial. The website is free.`,
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Pricing | GammaRips',
    description:
      `Humans browse free. Agents subscribe. Better contracts every night and the exit lab for your AI, ${PRICE_MONTHLY}/mo with a ${TRIAL_DAYS}-day free trial.`,
    url: 'https://gammarips.com/pricing',
  },
};

export default function PricingPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GammaRips Agent Access',
    description:
      `MCP access for AI agents: the nightly pool of liquid option contracts with thesis, technicals, and catalyst, the exit lab (opportunity surfaces, touch probabilities, and exit-rule scoring), fresh liquidity and earnings checks, price replay, regime context, and methodology playbooks. ${TOOL_COUNT} tools for Claude, ChatGPT, Cursor, Codex, or any MCP client, by OAuth sign-in or API key. Educational data, not investment advice.`,
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
