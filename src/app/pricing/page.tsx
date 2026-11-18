import type { Metadata } from 'next';
import { PricingClient } from './pricing-client';
import {
  TOOL_COUNT,
  PRICE_MONTHLY,
  PRICE_STANDARD,
  FOUNDING_CAP,
  TRIAL_DAYS,
  OG_IMAGE,
} from '@/lib/constants';

export const revalidate = 3600;

// The JSON-LD price is a numeric string ("29.00"), a different format from the
// display constant. Derive it so there is one number to change, not three.
const PRICE_NUMERIC = (Number(PRICE_MONTHLY.replace(/[^0-9.]/g, '')) || 0).toFixed(2);

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    `Pro gives your AI the full nightly Combo A options dataset (40–50 contracts), 10-minute intraday liquidity snapshots, and 3-day excursion outcome history over MCP. ${PRICE_MONTHLY}/mo founding price, ${TRIAL_DAYS}-day free trial.`,
  alternates: { canonical: 'https://gammarips.com/pricing' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Pricing | GammaRips',
    description:
      `Free 3-contract preview. Full nightly Combo A options dataset and 10-minute intraday liquidity snapshots for your AI on Pro MCP, ${PRICE_MONTHLY}/mo with a ${TRIAL_DAYS}-day free trial.`,
    url: 'https://gammarips.com/pricing',
  },
};

export default function PricingPage() {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'GammaRips Agent Access',
    description:
      `MCP access for AI agents: the full nightly Combo A pool of liquid option contracts (Mid >= $1.00, OI >= 500, Delta 0.22–0.48, DTE 10–45) with rv_iv_ratio, technicals, and grounded catalysts, 10-minute intraday liquidity snapshots, 3-day MFE/MAE outcome surfaces, price replay, regime context, and methodology playbooks. ${TOOL_COUNT} tools for Claude, ChatGPT, Cursor, Codex, or any MCP client, by OAuth sign-in or API key. Educational data, not investment advice.`,
    image: 'https://gammarips.com/og-image.png?v=4',
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

  const pricingFaqs = [
    {
      q: `How does the ${TRIAL_DAYS}-day trial work?`,
      a: `Card on file, no charge for ${TRIAL_DAYS} days, full Pro MCP access from minute one. If you cancel before day ${TRIAL_DAYS} you pay nothing. After day ${TRIAL_DAYS} your card is charged ${PRICE_MONTHLY} and you're billed monthly until you cancel.`,
    },
    {
      q: "Why don't you just tell me what to buy?",
      a: 'Shared picks crowd everyone into the same contract at the open. Furthermore, our Catalyst Lab walk-forward audit showed that black-box composite scores fail out-of-sample, whereas transparent microstructure and volatility primitives (Combo A) hold up. Your AI uses the dataset and historical 3-day excursion surfaces to build a plan tailored to your risk budget.',
    },
    {
      q: 'How are the Combo A filters validated?',
      a: 'Every filter gate on this page comes from walk-forward Catalyst Lab audits across N = 5,575 enriched option contracts (66 scan dates) joined to BigQuery enriched_option_outcomes. Read the full walkthrough on Learn (/how-it-works) and Methodology (/methodology).',
    },
    {
      q: 'What happens if I cancel?',
      a: 'Pro MCP access stops at the end of your billing cycle. The 3-contract preview on the web and on the anonymous MCP endpoint stays free forever.',
    },
    {
      q: "What's the refund policy?",
      a: `The ${TRIAL_DAYS}-day trial gives you a full month to evaluate at no charge. After that, billing is monthly, with no pro-rated refunds mid-cycle. If something breaks, email evan@gammarips.com and we'll make it right.`,
    },
    {
      q: 'Will the price go up?',
      a: `${PRICE_MONTHLY}/mo is the founding price, for the first ${FOUNDING_CAP} subscribers. It stays at that rate as long as you stay subscribed. After the first ${FOUNDING_CAP}, the price is ${PRICE_STANDARD}/mo.`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PricingClient />
    </>
  );
}
