import type { Metadata } from 'next';
import {
  AGENT_CARE_MCP_PRICE,
  AGENT_CARE_PRICE,
  BUILD_STANDARD_PRICE,
  BUILD_TURNAROUND_DAYS,
  OG_IMAGE,
  PRICE_ANNUAL,
  PRICE_MONTHLY,
  TRIAL_DAYS,
} from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Terms of service for GammaRips market data, Pro MCP subscriptions, and work-for-hire Custom Trading Agent Builds.',
  alternates: { canonical: 'https://gammarips.com/terms' },
  openGraph: {
    images: [OG_IMAGE],
    title: 'Terms of Service | GammaRips',
    description:
      'Terms of service for GammaRips market data, Pro MCP subscriptions, and Custom Trading Agent Builds.',
    url: 'https://gammarips.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold font-headline mb-4">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: November 25, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6">
        <h2>1. Service Description</h2>
        <p>
          GammaRips provides market-data and software-engineering services: (a) a public website
          with a free 3-setup daily pool preview, morning briefings, and research pages; (b) a free
          anonymous MCP preview endpoint (<code>/mcp</code>); (c) a paid Pro MCP subscription (
          {PRICE_MONTHLY}/mo or {PRICE_ANNUAL}/yr after a {TRIAL_DAYS}-day free trial) unlocking the
          full nightly US stock, 2x/inverse ETF, and options dataset, 10-minute intraday liquidity
          snapshots, and 3-day move history via OAuth 2.1 or API key; and (d) fixed-scope
          work-for-hire Custom Trading Agent Builds ({BUILD_STANDARD_PRICE} one-time) plus optional
          monthly Agent Care ({AGENT_CARE_PRICE}/mo or {AGENT_CARE_MCP_PRICE}/mo bundled with Pro
          MCP). GammaRips sells data and software tools — never trade recommendations or investment
          advice.
        </p>

        <h2>2. Not Financial Advice</h2>
        <p>
          <strong>
            All content, data, and software provided by GammaRips are for educational and
            informational purposes only and do not constitute investment, financial, trading, tax,
            or legal advice.
          </strong>{' '}
          GammaRips does not recommend that any stock, ETF, option, or strategy is suitable for any
          investor. You are solely responsible for your own trading decisions.
        </p>

        <h2>3. Market Risk &amp; No Guarantees</h2>
        <p>
          Past performance, historical move statistics, and paper-trading benchmarks do not
          guarantee future results. Trading US equities, leveraged/inverse single-stock ETFs
          (which reset daily and can suffer compounding decay), and options involves substantial
          risk of loss, including total loss of capital. Data is provided &ldquo;as is&rdquo;
          without warranty of accuracy, completeness, or uninterrupted availability.
        </p>

        <h2>4. Pro MCP Subscriptions &amp; Billing</h2>
        <ul>
          <li>Pro MCP plans are billed monthly ({PRICE_MONTHLY}/mo) or annually ({PRICE_ANNUAL}/yr) via Stripe after your {TRIAL_DAYS}-day free trial.</li>
          <li>You may cancel or switch billing intervals at any time via the Stripe Billing Portal on your Account page (<code>/account</code>).</li>
          <li>Cancellations take effect at the end of the current billing period; no pro-rated refunds are issued mid-cycle. If something breaks, email evan@gammarips.com and we will make it right.</li>
          <li>Founding pricing stays locked for active founding subscribers; any future price change to standard tiers carries at least 30 days notice.</li>
        </ul>

        <h2>5. Custom Trading Agent Builds &amp; Agent Care</h2>
        <ul>
          <li>Standard Custom Agent Builds ({BUILD_STANDARD_PRICE} flat) are fixed-scope work-for-hire engineering engagements implementing client-authored trading rules, delivered to the client&apos;s private GitHub repository in Paper Mode within {BUILD_TURNAROUND_DAYS} business days.</li>
          <li><strong>24-Hour Out-of-Scope Refund Guarantee:</strong> If you pay to reserve a build slot and our engineering review determines your specification exceeds standard fixed scope, we refund your {BUILD_STANDARD_PRICE} payment in full within 24 hours.</li>
          <li><strong>Client Code Ownership:</strong> Upon delivery and payment, you own 100% of the custom strategy repository delivered to your private GitHub account, while GammaRips retains ownership of its pre-existing reusable risk-kernel patterns and platform infrastructure.</li>
          <li>You remain solely responsible for your brokerage accounts, API keys, hosting environment, and deciding whether or when to move an agent from Paper Mode to live funds.</li>
          <li>Optional Agent Care ({AGENT_CARE_PRICE}/mo, or {AGENT_CARE_MCP_PRICE}/mo with Pro MCP) is billed monthly only after handoff and may be canceled anytime.</li>
        </ul>

        <h2>6. MCP API Usage</h2>
        <ul>
          <li>Free preview access at <code>/mcp</code> is available anonymously subject to fair-use rate limits. Pro MCP access requires an active subscription authenticated via OAuth 2.1 (<code>/pro</code>) or a personal Bearer API key (<code>gr_live_...</code>).</li>
          <li>Your credentials are personal to you and the agents you control. Do not share, publish, or resell API access.</li>
          <li>You may not bulk-redistribute or resell GammaRips datasets or API responses without written permission. We reserve the right to rate-limit or revoke access for abuse.</li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          GammaRips&apos;s nightly scanning pipeline, website design, research content, and dataset
          compilation remain the intellectual property of GammaRips. Custom client-authored agent
          code delivered under Section 5 is owned by the commissioning client.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, GammaRips shall not be liable for any trading
          losses, missed fills, broker outages, API changes, software defects in live trading, or
          indirect damages arising from your use of our data or software. You trade at your own
          risk.
        </p>

        <h2>9. Changes &amp; Contact</h2>
        <p>
          We may update these terms as our products evolve; material updates are posted here with a
          new date. Questions? Email{' '}
          <a href="mailto:evan@gammarips.com" className="text-primary">
            evan@gammarips.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
