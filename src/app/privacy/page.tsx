export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for GammaRips and GammaRips Pro.',
  alternates: { canonical: 'https://gammarips.com/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: October 1, 2026</p>

      <div className="prose prose-invert max-w-none space-y-6">
        <p>
          This policy covers gammarips.com and the GammaRips MCP server at mcp.gammarips.com. It
          says what personal data we collect, why we collect it, who receives it, how long we keep
          it, and what you can do about it. We do not sell personal data.
        </p>

        <h2>1. What We Collect</h2>
        <ul>
          <li>
            <strong>Account data.</strong> Your email address, your display name if your sign-in
            provider supplies one, your account ID, and the date you created the account. If you
            sign in with Google, we receive your email and name from Google. If you sign in with an
            email and password, Firebase Authentication stores the password. We never see it.
          </li>
          <li>
            <strong>Billing data.</strong> Stripe collects your card and billing details. We never
            receive or store card numbers. We store your Stripe customer ID, your subscription ID,
            and your subscription status.
          </li>
          <li>
            <strong>API keys.</strong> We store only a SHA-256 hash of each key, plus its first 12
            characters so you can tell your keys apart. We show the full key once, when you create
            it.
          </li>
          <li>
            <strong>OAuth sign-ins and machine clients.</strong> When you connect an AI client with
            OAuth, we store the client&apos;s name, its redirect addresses, your consent decision,
            and a hashed refresh token tied to your account. Access tokens are not stored. When you
            create a machine client, we store its name, a hash of its secret, and when it was
            created and last used.
          </li>
          <li>
            <strong>MCP request data.</strong> For each request to the MCP server, our hosting
            provider logs the IP address, user agent, referring page, requested path, response
            status, response time, and a timestamp. For each tool call, we also record the tool
            name, your account ID, the first 12 characters of your API key or your OAuth client ID,
            your plan tier, whether the call was allowed, and a timestamp. These usage records do
            not store the arguments of the call.
          </li>
          <li>
            <strong>Site analytics.</strong> Google Analytics records pages you visit, the referring
            site, approximate location, device and browser type, and events such as sign-in and
            starting checkout. A Google Ads tag measures whether a visit that came from an ad led
            to a sign-up. We keep your Google Analytics client and session IDs in your
            browser&apos;s local storage and pass them to Stripe checkout, so a purchase can be
            matched to the visit that started it.
          </li>
          <li>
            <strong>Email and messages.</strong> Your email address if you join the newsletter,
            plus the text and reply address of any feedback or cancellation reason you send us.
          </li>
        </ul>
        <p>
          We do not collect government ID numbers, health data, or precise location. Do not put
          personal data in tool arguments or feedback messages unless you want us to have it.
        </p>

        <h2>2. AI Clients (ChatGPT, Claude, and Other MCP Clients)</h2>
        <p>
          When you connect ChatGPT, Claude, Cursor, or another MCP client to GammaRips, the client
          sends us the name of the tool it calls and the arguments for that call, such as a ticker
          symbol or a date. We use the arguments to answer that call. We never receive your chat
          transcript, your other prompts, or the rest of the conversation. The client receives the
          tool result and handles it under its own privacy policy.
        </p>

        <h2>3. Why We Use It</h2>
        <ul>
          <li>To run your account and sign you in, on the site and in AI clients.</li>
          <li>To process subscriptions and payments.</li>
          <li>To check which tools your plan includes and to enforce rate limits.</li>
          <li>To keep the service secure and to find and stop abuse.</li>
          <li>To send emails about your account and subscription, such as a welcome email or a notice that a trial ends.</li>
          <li>To send the newsletter, only if you sign up for it.</li>
          <li>To measure how people use the site and the MCP server, and which ads lead to sign-ups.</li>
          <li>To answer your support requests and feedback.</li>
          <li>To meet legal obligations.</li>
        </ul>

        <h2>4. Who Receives It</h2>
        <p>We share personal data only with service providers that process it for us, or when the law requires it:</p>
        <ul>
          <li><strong>Google Cloud and Firebase:</strong> hosting, sign-in, database, and logs.</li>
          <li><strong>Stripe:</strong> payments and subscription billing.</li>
          <li><strong>Mailgun:</strong> email delivery.</li>
          <li><strong>Google Analytics and Google Ads:</strong> site analytics and ad measurement.</li>
          <li><strong>Government or legal authorities:</strong> only when the law requires it.</li>
        </ul>
        <p>
          Market-data providers receive only market symbols and dates from the MCP server. They
          never receive your identity.
        </p>

        <h2>5. How Long We Keep It</h2>
        <ul>
          <li><strong>Account and billing records:</strong> while your account exists. We delete them when you ask us to delete your account, except records the law requires us to keep.</li>
          <li><strong>MCP request logs</strong> (IP address, user agent, path, timestamp): 30 days, then deleted automatically.</li>
          <li><strong>MCP tool-call usage records:</strong> while we operate the service, to measure usage and enforce plans. We delete the records tied to your account when you ask us to delete your account.</li>
          <li><strong>OAuth records:</strong> a consent request expires after 10 minutes and an authorization code after 5 minutes. A refresh token expires 30 days after its last use. A client registration that no one uses for 90 days expires. Each record is deleted automatically, normally within a day after it expires.</li>
          <li><strong>Access tokens:</strong> valid for 1 hour and never stored.</li>
          <li><strong>API keys and machine clients:</strong> until you revoke them or delete your account.</li>
          <li><strong>Newsletter list:</strong> until you unsubscribe. After that we keep your address marked as unsubscribed, so we do not email you again.</li>
          <li><strong>Feedback and cancellation reasons:</strong> while your account exists, or until you ask us to delete them.</li>
          <li><strong>Site analytics:</strong> Google keeps this data under the retention setting of our Google Analytics property.</li>
          <li><strong>Stripe and Mailgun</strong> keep their own records under their own policies.</li>
        </ul>

        <h2>6. Your Controls</h2>
        <ul>
          <li><strong>Revoke an API key or a machine client</strong> on your account page. A revoked key stops working within a few minutes. A revoked machine client cannot get new tokens, and a token it already holds expires within 1 hour.</li>
          <li><strong>Disconnect an AI client</strong> in that client&apos;s settings. To revoke every OAuth sign-in on our side, email us.</li>
          <li><strong>Cancel your subscription</strong> through the Stripe customer portal on your account page.</li>
          <li><strong>Unsubscribe from the newsletter</strong> with the link in any newsletter email.</li>
          <li><strong>Block analytics cookies</strong> in your browser settings, or with Google&apos;s Analytics opt-out browser add-on.</li>
          <li><strong>Ask for a copy of your data, a correction, or deletion</strong> by emailing <a href="mailto:evan@gammarips.com" className="text-green-400">evan@gammarips.com</a>.</li>
        </ul>

        <h2>7. Cookies and Local Storage</h2>
        <p>
          Firebase Authentication keeps you signed in with your browser&apos;s storage. Google
          Analytics and the Google Ads tag set cookies to count visits and measure ad conversions.
          We store your Google Analytics client and session IDs in local storage, as described in
          section 1.
        </p>

        <h2>8. Security</h2>
        <p>
          All connections use HTTPS. Sign-in runs on Firebase Authentication. Stripe processes
          payments under PCI DSS. We store API keys, machine-client secrets, and refresh tokens only
          as hashes.
        </p>

        <h2>9. Changes</h2>
        <p>We may update this policy. We post every change on this page with a new date.</p>

        <h2>10. Contact</h2>
        <p>Questions? Email us at <a href="mailto:evan@gammarips.com" className="text-green-400">evan@gammarips.com</a></p>
      </div>
    </div>
  );
}
