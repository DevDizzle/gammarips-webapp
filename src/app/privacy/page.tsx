export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for GammaRips and GammaRips Pro.',
  alternates: { canonical: 'https://gammarips.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: February 13, 2026</p>
      
      <div className="prose prose-invert max-w-none space-y-6">
        <h2>1. Information We Collect</h2>
        <p>When you create an account or subscribe to GammaRips Pro, we collect:</p>
        <ul>
          <li>Email address</li>
          <li>Payment information (processed securely by Stripe — we never store card details)</li>
          <li>Usage data (pages visited, features used)</li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To provide and maintain GammaRips Pro service</li>
          <li>To process subscriptions and payments</li>
          <li>To send daily signal reports (if subscribed)</li>
          <li>To improve our service</li>
        </ul>

        <h2>3. Data Sharing</h2>
        <p>We do not sell your personal information. We share data only with:</p>
        <ul>
          <li><strong>Stripe</strong> — for payment processing</li>
          <li><strong>Firebase/Google Cloud</strong> — for authentication and hosting</li>
        </ul>

        <h2>4. Data Security</h2>
        <p>We use industry-standard security measures including encrypted connections (HTTPS), secure authentication (Firebase Auth), and PCI-compliant payment processing (Stripe).</p>

        <h2>5. Cookies</h2>
        <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies.</p>

        <h2>6. Your Rights</h2>
        <p>You may request deletion of your account and associated data at any time by emailing evan@gammarips.com.</p>

        <h2>7. Changes</h2>
        <p>We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>

        <h2>8. Contact</h2>
        <p>Questions? Email us at <a href="mailto:evan@gammarips.com" className="text-green-400">evan@gammarips.com</a></p>
      </div>
    </div>
  );
}
