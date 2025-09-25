
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | ProfitScout',
  description: 'Read the Terms of Service for ProfitScout.',
};

export default function TermsPage() {
  return (
    <article className="prose prose-invert">
      <h1>Terms of Service</h1>
      <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using ProfitScout (the "Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Service's particular services, you shall be subject to any posted guidelines or rules applicable to such services. Any participation in this service will constitute acceptance of this agreement.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        Our service provides AI-generated financial data analysis for informational purposes only. It is not intended as financial, investment, or trading advice. You are responsible for your own investment decisions.
      </p>

      <h2>3. Disclaimer of Warranties</h2>
      <p>
        The service is provided "as is". We and our suppliers and licensors hereby disclaim all warranties of any kind, express or implied, including, without limitation, the warranties of merchantability, fitness for a particular purpose and non-infringement. Neither we nor our suppliers and licensors, makes any warranty that the service will be error-free or that access thereto will be continuous or uninterrupted.
      </p>

      <h2>4. Limitation of Liability</h2>
      <p>
        In no event will we, or our suppliers or licensors, be liable with respect to any subject matter of this agreement under any contract, negligence, strict liability or other legal or equitable theory for: (i) any special, incidental or consequential damages; (ii) the cost of procurement for substitute products or services; (iii) for interruption of use or loss or corruption of data.
      </p>

      <h2>5. User Conduct</h2>
      <p>
        You agree not to use the service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Service, the services, or the general business of ProfitScout.
      </p>

      <h2>6. Subscriptions and Payments</h2>
      <p>
        <strong>Billing:</strong> Access to the Service may require a paid subscription. You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set on a monthly basis. At the end of each Billing Cycle, your subscription will automatically renew under the exact same conditions unless you cancel it or ProfitScout cancels it.
      </p>
      <p>
        <strong>Payment:</strong> A valid payment method is required to process the payment for your subscription. Our monthly subscription fee is $19 USD.
      </p>
      <p>
        <strong>Cancellation:</strong> You may cancel your subscription renewal at any time. The cancellation will take effect at the end of your current billing period, and you will continue to have access to the service until the end of that period.
      </p>
      <p>
        <strong>No Refunds:</strong> Payments are non-refundable, and we do not provide refunds or credits for any partial-month subscription periods or unused services.
      </p>
      <p>
        <strong>Fee Changes:</strong> ProfitScout, in its sole discretion and at any time, may modify the subscription fees. Any subscription fee change will become effective at the end of the then-current Billing Cycle. We will provide you with reasonable prior notice of any change in subscription fees to give you an opportunity to terminate your subscription before such change becomes effective.
      </p>

      <h2>7. Modification of Terms</h2>
      <p>
        We reserve the right, at our sole discretion, to modify or replace any part of this Agreement. It is your responsibility to check this Agreement periodically for changes. Your continued use of or access to the Service following the posting of any changes to this Agreement constitutes acceptance of those changes.
      </p>

      <h2>8. Contact Information</h2>
      <p>
        If you have any questions about these Terms, please contact us at <a href="mailto:admin@profitscout.app">admin@profitscout.app</a>.
      </p>
    </article>
  );
}
