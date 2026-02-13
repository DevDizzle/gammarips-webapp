export const metadata = {
  title: 'Terms of Service | GammaRips',
  description: 'Terms of service for GammaRips and The Overnight Edge.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: February 13, 2026</p>
      
      <div className="prose prose-invert max-w-none space-y-6">
        <h2>1. Service Description</h2>
        <p>GammaRips ("The Overnight Edge") provides institutional overnight options flow data, technical analysis, and AI-generated market insights for informational purposes only.</p>

        <h2>2. Not Financial Advice</h2>
        <p><strong>The information provided by GammaRips is for informational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice.</strong> You should not treat any of the website's content as such. GammaRips does not recommend that any securities, options, or strategies are suitable for any particular investor. You are solely responsible for your own investment decisions.</p>

        <h2>3. No Guarantees</h2>
        <p>Past performance of signals is not indicative of future results. Options trading involves substantial risk of loss. You could lose some or all of your invested capital. We make no representations or warranties about the accuracy, completeness, or timeliness of the data provided.</p>

        <h2>4. Subscriptions and Billing</h2>
        <ul>
          <li>Subscriptions are billed monthly through Stripe</li>
          <li>You may cancel at any time through the customer portal</li>
          <li>Refunds are handled on a case-by-case basis — email ceo@gammarips.com</li>
          <li>Prices may change with 30 days notice</li>
        </ul>

        <h2>5. API Usage</h2>
        <ul>
          <li>API keys are for your use only — do not share or resell</li>
          <li>Rate limits apply per your subscription tier</li>
          <li>We reserve the right to revoke API access for abuse</li>
          <li>Redistributing our data without permission is prohibited</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>The overnight scoring algorithm, enrichment pipeline, and analysis methodology are proprietary to GammaRips. You may not reverse-engineer, copy, or redistribute our scoring system.</p>

        <h2>7. Account Termination</h2>
        <p>We reserve the right to terminate accounts that violate these terms, engage in abuse, or attempt to redistribute data without authorization.</p>

        <h2>8. Limitation of Liability</h2>
        <p>GammaRips shall not be liable for any trading losses, damages, or other liabilities arising from your use of our service. You trade at your own risk.</p>

        <h2>9. Changes</h2>
        <p>We may modify these terms at any time. Continued use of the service after changes constitutes acceptance.</p>

        <h2>10. Contact</h2>
        <p>Questions? Email us at <a href="mailto:ceo@gammarips.com" className="text-green-400">ceo@gammarips.com</a></p>
      </div>
    </div>
  );
}
