import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | GammaRips',
  description: 'Read the Terms of Service for GammaRips.',
};

export default function TermsPage() {
  return (
    <article className="prose prose-invert">
      <h1>Terms of Service</h1>
      <p><em>Last updated: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</em></p>

      <p>Welcome to GammaRips (“GammaRips,” “we,” “our,” or “us”). These Terms of Service (“Terms”) govern your access to and use of our website, applications, APIs, data feeds, and any related services (collectively, the “Service”). By using the Service, you agree to these Terms.</p>
      <p>If you do not agree, do not use the Service.</p>

      <h2>1) Eligibility &amp; Accounts</h2>
      <p>You must be at least 18 years old and able to form a binding contract to use the Service. You are responsible for the security of your account and for all activity under it.</p>

      <h2>2) Description of the Service (Educational Use Only)</h2>
      <p>GammaRips provides AI-generated and data-driven research for equities and options. Content is for informational and educational purposes only and is not investment, financial, legal, tax, or trading advice. You are solely responsible for any decisions you make using the Service.</p>

      <h2>3) API &amp; Actions License</h2>
      <p>If you access GammaRips programmatically (e.g., via our HTTP endpoints or ChatGPT Actions):</p>
      <ul>
        <li><strong>License.</strong> We grant you a limited, revocable, non-exclusive, non-transferable license to call our endpoints to retrieve read-only data for personal or internal business use.</li>
        <li><strong>Rate limits &amp; fair use.</strong> We may enforce rate limits, quotas, or fairness algorithms and may throttle or block traffic that degrades Service stability.</li>
        <li><strong>Caching.</strong> You may cache results for up to 24 hours; beyond that, re-fetch from the API to ensure freshness.</li>
        <li><strong>Attribution.</strong> When our data is rendered in downstream experiences, display: “Source: GammaRips.”</li>
        <li><strong>No circumvention.</strong> Do not attempt to bypass authentication, rate limiting, or access controls.</li>
        <li><strong>No re-sale.</strong> Do not repackage, resell, or sub-license our data or models without our express written consent.</li>
        <li><strong>No reverse engineering.</strong> Do not derive underlying models, systems, or non-public datasets from the outputs.</li>
      </ul>
      <p>We may modify or discontinue endpoints (including parameters and schemas) at any time.</p>

      <h2>4) Content; Ownership; Feedback</h2>
      <ul>
        <li><strong>Our Content.</strong> We and our licensors own the Service and all materials available through it, including models, generated text, datasets, UX, and documentation, subject to third-party rights.</li>
        <li><strong>Your Inputs.</strong> You retain rights to prompts, queries, or other content you submit. You grant us a license to use your inputs to operate, maintain, and improve the Service.</li>
        <li><strong>Feedback.</strong> If you provide suggestions or feedback, you grant us a perpetual, irrevocable, royalty-free license to use them without restriction.</li>
      </ul>

      <h2>5) Third-Party Services</h2>
      <p>The Service may rely on or interoperate with third-party providers (e.g., cloud hosting, model providers, payments). Your use may also be subject to their terms and privacy practices. We are not responsible for third-party services and do not control their content or availability.</p>

      <h2>6) Subscriptions, Billing &amp; Taxes</h2>
      <ul>
        <li><strong>Plans &amp; Renewal.</strong> Paid plans renew automatically each billing cycle unless canceled before renewal.</li>
        <li><strong>Pricing Changes.</strong> We may change prices on future cycles after reasonable notice.</li>
        <li><strong>Trials.</strong> Trial access (if offered) converts to a paid plan unless canceled before trial end.</li>
        <li><strong>No Refunds.</strong> Except where required by law, fees are non-refundable and non-creditable once a cycle begins.</li>
        <li><strong>Taxes.</strong> Prices exclude applicable taxes; you are responsible for any taxes due.</li>
      </ul>

      <h2>7) Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for unlawful, harmful, deceptive, or fraudulent purposes.</li>
        <li>Ingest or distribute malware, attempt to gain unauthorized access, or test vulnerabilities without written permission.</li>
        <li>Scrape, harvest, or bulk-download beyond reasonable personal/internal use.</li>
        <li>Generate or disseminate content that violates applicable laws (e.g., market manipulation, insider trading), infringes IP, or invades privacy.</li>
        <li>Use outputs to create competing datasets or services derived from a substantial portion of our data.</li>
      </ul>
      <p>We may investigate violations and suspend or terminate accounts to protect the Service and other users.</p>

      <h2>8) Public Data &amp; Availability</h2>
      <p>Some outputs reference publicly accessible objects (e.g., Google Cloud Storage artifacts). Public availability does not grant any additional license. Links and objects may be changed, moved, or removed at any time. We do not guarantee continuous hosting or availability of any object.</p>

      <h2>9) No Investment Advice; No Fiduciary Duty</h2>
      <p>GammaRips is not a broker, dealer, investment adviser, or fiduciary. The Service does not perform individualized suitability analysis. All decisions are your own and undertaken at your own risk.</p>

      <h2>10) Disclaimers</h2>
      <p>THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, OR SECURE, OR THAT RESULTS WILL BE ACCURATE OR RELIABLE.</p>

      <h2>11) Limitation of Liability</h2>
      <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER GAMMARIPS NOR ITS SUPPLIERS OR LICENSORS WILL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES; LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL; OR BUSINESS INTERRUPTION—EVEN IF ADVISED OF THE POSSIBILITY. OUR AGGREGATE LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE AMOUNT PAID BY YOU TO US FOR THE SERVICE IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO LIABILITY.</p>
      <p>Some jurisdictions do not allow certain limitations; in those cases, the above applies to the fullest extent permitted.</p>

      <h2>12) Indemnification</h2>
      <p>You will defend, indemnify, and hold harmless GammaRips and its affiliates, officers, agents, and employees from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from your use of the Service, your content, or your violation of these Terms or applicable law.</p>

      <h2>13) Suspension &amp; Termination</h2>
      <p>We may suspend or terminate your access at any time with or without notice if we believe you have violated these Terms, risk our systems or other users, or for any business reason. Upon termination, your license ends and you must stop using the Service. Sections intended to survive (e.g., 3–5, 7–16) will survive.</p>

      <h2>14) Changes to the Service or Terms</h2>
      <p>We may modify the Service or these Terms at any time. We will post updates with a revised “Last updated” date, and material changes will be reasonably noticed. Your continued use after changes constitutes acceptance.</p>

      <h2>15) Export &amp; Sanctions Compliance</h2>
      <p>You must comply with all applicable export control and economic sanctions laws. You may not use the Service if you are located in, ordinarily resident in, or a national of any country or region subject to comprehensive sanctions, or are a denied or restricted party.</p>
      
      <h2>16) Governing Law; Dispute Resolution</h2>
      <p><strong>Governing Law.</strong> These Terms and any dispute, claim, or controversy between you and GammaRips arising out of or relating to them or your use of the Services (each, a “Dispute”) are governed by the laws of the State of Florida, without regard to its conflict-of-laws rules. To the extent applicable, the Federal Arbitration Act (“FAA”) governs the interpretation and enforcement of the arbitration agreement below.</p>
      <p><strong>Informal Resolution First.</strong> Before filing a claim, you agree to email us at legal@gammarips.com with “Dispute Notice” in the subject line and a brief description of your Dispute. If we cannot resolve it within 30 days, either party may proceed as set out below.</p>
      <p><strong>Binding Arbitration (No Jury; No Class Actions).</strong> Except for the exceptions in “Small Claims & Injunctions” below, any Dispute will be resolved exclusively by binding arbitration administered by the American Arbitration Association (AAA):</p>
      <ul>
        <li><strong>Rules.</strong>
          <ul>
            <li>If you are an individual using the Services for personal use, the AAA Consumer Arbitration Rules apply.</li>
            <li>If you are a business or using the Services on behalf of a business, the AAA Commercial Arbitration Rules apply.</li>
          </ul>
        </li>
        <li><strong>Venue &amp; Seat.</strong> The arbitration seat and hearing location will be Jacksonville, Florida (Duval County), or by video/teleconference if the arbitrator permits.</li>
        <li><strong>Arbitrator &amp; Procedure.</strong> One neutral arbitrator; English language; the arbitrator may award individual relief available in court.</li>
        <li><strong>Fees.</strong> AAA fees are governed by the applicable AAA Rules. For individual consumers, GammaRips will reimburse filing fees above $200 upon request after you participate in the informal resolution step.</li>
        <li><strong>Attorneys’ Fees.</strong> Each party bears its own fees and costs, except the arbitrator may award them where authorized by applicable law.</li>
        <li><strong>Class/Representative Waiver.</strong> Arbitration will proceed on an individual basis only. Class, collective, or representative actions are not permitted, and the arbitrator may not consolidate claims of different persons.</li>
      </ul>
      <p><strong>Small Claims &amp; Injunctions.</strong> Either party may bring an individual action in small claims court in St. Johns County, Florida (or your county of residence within the U.S.) for eligible claims, or seek temporary or preliminary injunctive relief in any court of competent jurisdiction to protect intellectual property or unauthorized access/misuse of the Services.</p>
      <p><strong>Court Venue for Non-Arbitrable Claims.</strong> If a Dispute is found not to be arbitrable, the exclusive jurisdiction and venue will be the state or federal courts located in St. Johns County, Florida, and you consent to their personal jurisdiction.</p>
      <p><strong>Severability &amp; Survival.</strong> If the class/representative waiver is found unenforceable as to a particular claim, that claim must proceed in court, not arbitration. The arbitration agreement otherwise remains in force. This Section survives termination of the Terms and your use of the Services.</p>
      <p><strong>Opt-Out.</strong> You may opt out of arbitration within 30 days of first accepting these Terms by emailing admin@gammarips.com with your full name, the email tied to your account, and a clear statement that you wish to opt out of the arbitration agreement. Opting out does not affect other provisions of these Terms.</p>

      <h2>17) Miscellaneous</h2>
      <ul>
        <li><strong>Entire Agreement.</strong> These Terms are the entire agreement between you and us regarding the Service.</li>
        <li><strong>Severability.</strong> If a provision is unenforceable, the remainder remains in effect.</li>
        <li><strong>Assignment.</strong> You may not assign these Terms; we may assign them as part of a reorganization, merger, acquisition, or asset sale.</li>
        <li><strong>No waiver.</strong> Failure to enforce any provision is not a waiver.</li>
      </ul>

      <h2>18) Contact</h2>
      <p>Questions about these Terms? Email <a href="mailto:admin@gammarips.com">admin@gammarips.com</a>.</p>
    </article>
  );
}
