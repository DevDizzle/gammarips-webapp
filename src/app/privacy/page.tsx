
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | ProfitScout',
  description: 'Read the Privacy Policy for ProfitScout.',
};

export default function PrivacyPage() {
  return (
    <article>
      <h1>Privacy Policy</h1>
      <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

      <h2>1. Information We Collect About You</h2>
      <p>
        We collect several types of information from and about users of our Website, including:
      </p>
      <ul>
        <li><strong>Personal Information:</strong> Information by which you may be personally identified, such as name, email address, or any other identifier by which you may be contacted online or offline.</li>
        <li><strong>Usage Details:</strong> Information about your internet connection, the equipment you use to access our Website, and usage details, including IP addresses, and information collected through cookies.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use information that we collect about you or that you provide to us, including any personal information:
      </p>
      <ul>
        <li>To present our Website and its contents to you.</li>
        <li>To provide you with information, products, or services that you request from us.</li>
        <li>To fulfill any other purpose for which you provide it.</li>
        <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
        <li>To notify you about changes to our Website or any products or services we offer or provide through it.</li>
      </ul>

      <h2>3. Disclosure of Your Information</h2>
      <p>
        We do not sell, rent, or otherwise disclose personal information that we collect or you provide as described in this privacy policy, except as described in this policy.
      </p>

      <h2>4. Data Security</h2>
      <p>
        We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. The safety and security of your information also depend on you.
      </p>
      
      <h2>5. Changes to Our Privacy Policy</h2>
      <p>
        It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the Website home page.
      </p>
      
      <h2>6. Contact Information</h2>
      <p>
        To ask questions or comment about this privacy policy and our privacy practices, contact us at: <a href="mailto:admin@profitscout.app">admin@profitscout.app</a>.
      </p>
    </article>
  );
}
