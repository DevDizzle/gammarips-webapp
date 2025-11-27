
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy | GammaRips',
  description: 'Read the Privacy Policy for GammaRips.',
};

export default function PrivacyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Privacy Policy</CardTitle>
      </CardHeader>
      <CardContent>
        <article className="prose prose-invert max-w-none">
          <p><em>Last updated: October 16, 2025</em></p>
          <p>
            GammaRips (“we,” “us,” or “our”) provides AI-powered research tools for equity and options analysis. This Privacy Policy explains what information we collect, how we use it, how it’s shared, and the choices you have. By using our website, apps, APIs, or ChatGPT Actions (collectively, the “Services”), you agree to this Policy.
          </p>
          <p>Educational only; not investment advice.</p>

          <h2>1) What we collect</h2>
          <p>We collect information in three ways: (a) you provide it, (b) it’s collected automatically, and (c) it comes from third-party sources.</p>
          
          <h3>a) Information you provide</h3>
          <ul>
            <li><strong>Account &amp; contact:</strong> name, email, and any profile or support messages you send us.</li>
            <li><strong>Queries &amp; content:</strong> prompts, tickers, and text you submit when using our tools or ChatGPT.</li>
            <li><strong>Payment info:</strong> if you buy paid features, our payments processor (e.g., Stripe) collects and processes payment details; we do not store full card numbers. Stripe</li>
          </ul>

          <h3>b) Information collected automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> pages viewed, features used, referrer, timestamps.</li>
            <li><strong>Device/technical:</strong> IP address, browser type, settings, crash logs, and similar diagnostic data. Our cloud provider processes some of this data as part of hosting and logging.</li>
          </ul>

          <h3>c) Third-party sources</h3>
          <p>Service providers and analytics may provide aggregated or device-level data to help us secure and improve the Services.</p>

          <h2>2) How we use information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide the Services: run queries, generate outputs, return API results, and deliver ChatGPT Actions.</li>
            <li>Improve &amp; secure: debug, monitor reliability, prevent abuse/fraud, and enhance features.</li>
            <li>Communicate: respond to support, send service notices, and (if you opt in) product updates.</li>
            <li>Comply with legal obligations and enforce our terms.</li>
          </ul>

          <h2>3) AI processing and your data</h2>
          <p><strong>ChatGPT Actions &amp; the OpenAI API.</strong> When you invoke our ChatGPT Action, OpenAI transmits the user’s request and our Action’s response as part of delivering the feature. OpenAI describes how it processes ChatGPT and API data in its Privacy Policy and API Data Usage Policies. Notably, OpenAI states that API data is not used to train models by default.</p>
          <p><strong>Our API &amp; storage.</strong> GammaRips hosts read-only datasets and responses in Google Cloud (Cloud Run, Cloud Storage). Google’s Cloud Privacy Notice describes how Google processes customer data as a service provider/processor.</p>

          <h2>4) How we share information</h2>
          <p>We do not sell personal information. We share it only with:</p>
          <ul>
            <li>
              <strong>Service providers / processors, including:</strong>
              <ul>
                <li>OpenAI (ChatGPT Actions/API processing).</li>
                <li>Google Cloud (hosting, storage, logging).</li>
                <li>Stripe (payments). Stripe</li>
              </ul>
            </li>
            <li><strong>Legal and safety:</strong> if required by law, to protect rights, security, or prevent fraud/abuse.</li>
            <li><strong>Business transfers:</strong> in a merger, acquisition, or asset sale, subject to this Policy.</li>
          </ul>

          <h2>5) Payments</h2>
          <p>When you purchase paid features, payments are processed by Stripe. Stripe’s Privacy Policy explains what data it collects and how it uses and shares it. Stripe</p>

          <h2>6) Data retention</h2>
          <p>We retain personal information only as long as necessary for the purposes above, including providing the Services, security, accounting, and legal obligations. Hosting and log retention are also subject to our cloud provider’s infrastructure practices.</p>

          <h2>7) Security</h2>
          <p>We use administrative, technical, and physical safeguards appropriate to the nature of the data, including encryption in transit, access controls, and cloud provider protections. No method of transmission or storage is 100% secure.</p>

          <h2>8) International transfers</h2>
          <p>We and our service providers may process data globally. Where required, we rely on appropriate safeguards for cross-border transfers as described by those providers (e.g., OpenAI, Google Cloud, Stripe). Stripe</p>

          <h2>9) Your rights &amp; choices</h2>
          <p>Depending on your location, you may have rights to:</p>
          <ul>
            <li>Access, correct, delete, or export your personal information.</li>
            <li>Object to or restrict processing, and withdraw consent (where applicable).</li>
            <li>Opt out of certain communications.</li>
          </ul>
          <p>You can exercise rights by contacting us (see Contact). We may need to verify your identity. You also have the right to complain to a supervisory authority where you live.</p>

          <h2>10) Children’s privacy</h2>
          <p>Our Services are not directed to children under 13 (or the age required by your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided personal data, contact us and we will take appropriate steps to delete it.</p>

          <h2>11) Cookies and similar technologies</h2>
          <p>We (and our providers) may use cookies and similar technologies for core functionality, analytics, fraud prevention, and to remember your preferences. You can control cookies via browser settings; some features may not work without them. See provider notices for details.</p>

          <h2>12) Third-party links</h2>
          <p>Our Services may link to third-party sites or tools. Their privacy practices are governed by their own policies (e.g., OpenAI, Google Cloud, Stripe). Stripe</p>

          <h2>13) Changes to this Policy</h2>
          <p>We may update this Policy from time to time. We will post the new effective date at the top and, if changes are material, provide additional notice as required.</p>

          <h2>14) Contact</h2>
          <p>Questions or requests?<br />Email: admin@gammarips.com</p>
        </article>
      </CardContent>
    </Card>
  );
}
