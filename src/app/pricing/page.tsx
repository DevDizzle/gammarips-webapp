import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';
import {
  AGENT_CARE_MCP_PRICE,
  AGENT_CARE_PRICE,
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  FOUNDING_CAP,
  OG_IMAGE,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
  PRICE_STANDARD,
  TOOL_COUNT,
  TRIAL_DAYS,
} from '@/lib/constants';

export const revalidate = 3600;

const PRICE_NUMERIC = (Number(PRICE_MONTHLY.replace(/[^0-9.]/g, '')) || 0).toFixed(2);
const ANNUAL_PRICE_NUMERIC = (Number(PRICE_ANNUAL.replace(/[^0-9.]/g, '')) || 0).toFixed(2);
const BUILD_PRICE_NUMERIC = (Number(BUILD_STANDARD_PRICE.replace(/[^0-9.]/g, '')) || 0).toFixed(2);

export const metadata: Metadata = {
  title: `Pricing: Pro MCP (${PRICE_MONTHLY}/mo) & Custom Agent Builds`,
  description: `Free 3-setup preview. Pro MCP (${PRICE_MONTHLY}/mo or ${PRICE_ANNUAL}/yr, ${TRIAL_DAYS}-day trial) unlocks full stock, 2x ETF & options data—or get a custom Python trading agent for ${BUILD_STANDARD_PRICE}.`,
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    images: [OG_IMAGE],
    title: `Pricing: Pro MCP (${PRICE_MONTHLY}/mo) & Custom Agent Builds | GammaRips`,
    description: `Free 3-setup preview, Pro MCP (${PRICE_MONTHLY}/mo or ${PRICE_ANNUAL}/yr, ${TRIAL_DAYS}-day free trial) across stocks, 2x ETFs, and options, plus ${BUILD_STANDARD_PRICE} custom trading agent builds.`,
    url: 'https://gammarips.com/pricing',
  },
};

export default function PricingPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GammaRips Pro MCP Access',
    description: `Nightly US market and options-flow intelligence for AI trading agents: 40–50 pre-filtered setups mapped to stocks, 2x/inverse ETFs, and liquid options, live 10-minute morning liquidity snapshots, 3-day move history, and price replay across ${TOOL_COUNT} MCP tools in Claude, ChatGPT, Cursor, or Codex. Educational market data only, not investment advice.`,
    image: 'https://gammarips.com/og-image.png?v=4',
    brand: { '@type': 'Brand', name: 'GammaRips' },
    offers: [
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: ANNUAL_PRICE_NUMERIC,
        name: 'GammaRips Pro MCP Access (Annual)',
        availability: 'https://schema.org/InStock',
        url: 'https://gammarips.com/pricing',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: ANNUAL_PRICE_NUMERIC,
          priceCurrency: 'USD',
          unitText: 'YEAR',
        },
      },
      {
        '@type': 'Offer',
        priceCurrency: 'USD',
        price: PRICE_NUMERIC,
        name: 'GammaRips Pro MCP Access (Monthly)',
        availability: 'https://schema.org/InStock',
        url: 'https://gammarips.com/pricing',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: PRICE_NUMERIC,
          priceCurrency: 'USD',
          unitText: 'MONTH',
        },
      },
    ],
  };

  const buildServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'GammaRips Custom AI Trading Agent Build',
    description: `Fixed-scope work-for-hire Python trading agent engineering for US stocks, 2x/inverse ETFs, or options—delivered in Paper Mode to your private GitHub repository in ${BUILD_TURNAROUND_DAYS} business days.`,
    provider: { '@type': 'Organization', name: 'GammaRips', url: 'https://gammarips.com' },
    url: 'https://gammarips.com/build',
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: BUILD_PRICE_NUMERIC,
      url: 'https://gammarips.com/build',
    },
  };

  const pricingFaqs = [
    {
      q: `How does the ${TRIAL_DAYS}-day free trial work?`,
      a: `You get full Pro MCP access from minute one with zero charge for ${TRIAL_DAYS} days. Cancel anytime from your account page before day ${TRIAL_DAYS} and you pay nothing. After that, billing continues at ${PRICE_ANNUAL}/year (or ${PRICE_MONTHLY}/month) until you cancel.`,
    },
    {
      q: 'Do I have to trade options to get value from Pro?',
      a: 'No. Every nightly setup includes mapped execution vehicles: the underlying US stock (1x), 2x long or inverse single-stock ETFs, and a liquid option contract. Many traders use options flow to spot momentum and execute cleanly in stocks or 2x ETFs.',
    },
    {
      q: `How does the ${BUILD_STANDARD_PRICE} Custom Trading Agent Build work?`,
      a: `You submit your written entry, sizing, stop, and exit rules on /build. We engineer your safety-hardened Python bot (limit-only orders, fill-based stops, duplicate-order protection) for stocks, 2x ETFs, or options and deliver 100% of the code to your private GitHub repo in ${BUILD_TURNAROUND_DAYS} business days in Paper Mode. Optional maintenance is ${AGENT_CARE_PRICE}/mo (${AGENT_CARE_MCP_PRICE}/mo bundled with Pro MCP) after handoff.`,
    },
    {
      q: "Why don't you just tell me one trade to buy?",
      a: 'Shared daily picks crowd everyone into the same price at the open, hurting fills. Our own walk-forward research also showed black-box single-pick scores fail out-of-sample, while transparent liquidity and volatility data holds up. Your AI uses the data to build a plan sized to your own risk budget.',
    },
    {
      q: 'What happens if I cancel Pro?',
      a: 'You can cancel with one click from your account page. Pro access continues through the end of your current billing period, and the 3-setup daily preview, morning briefings, and research pages stay free forever.',
    },
    {
      q: 'Will the founding price go up?',
      a: `${PRICE_MONTHLY}/mo (or ${PRICE_ANNUAL}/yr) is the founding rate for the first ${FOUNDING_CAP} subscribers. You keep that price as long as your subscription stays active; after the first ${FOUNDING_CAP}, new subscribers pay ${PRICE_STANDARD}/mo.`,
    },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFaqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingClient />
    </>
  );
}
