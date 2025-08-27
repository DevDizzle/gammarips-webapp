import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | ProfitScout',
  description: 'Learn about the methodology and mission of ProfitScout.',
};

export default function AboutPage() {
  return (
    <article>
      <h1>About Us</h1>
      <p className="lead">
        Welcome to ProfitScout. We are dedicated to simplifying investment decisions by providing clear, data-driven insights powered by artificial intelligence. Our mission is to empower investors of all levels with the tools and information they need to navigate the stock market with confidence.
      </p>

      <h2>Our Methodology</h2>
      <p>
        ProfitScout leverages state-of-the-art AI and large language models to analyze vast amounts of financial data. Our process is designed to be comprehensive and unbiased, focusing on the fundamental principles of E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness).
      </p>
      <p>
        Our AI synthesizes information from a wide array of sources, including:
      </p>
      <ul>
        <li><strong>Company Filings:</strong> We analyze SEC filings like 10-Ks and 10-Qs to understand a company's financial health, risks, and management discussion.</li>
        <li><strong>Earnings Call Transcripts:</strong> We assess management tone, outlook, and responses to analyst questions to gauge sentiment and future prospects.</li>
        <li><strong>Financial Statements:</strong> In-depth analysis of balance sheets, income statements, and cash flow statements to evaluate performance and stability.</li>
        <li><strong>Key Ratios and Metrics:</strong> We compute and compare valuation ratios, profitability metrics, and technical indicators to provide a holistic view.</li>
        <li><strong>News and Market Sentiment:</strong> Our models process recent news to identify catalysts, risks, and shifts in market sentiment.</li>
      </ul>
      <p>
        The result is a clear BUY, HOLD, or SELL signal, accompanied by a detailed, step-by-step chain of thought that explains the reasoning behind the recommendation. We believe in transparency, and our goal is to show you *how* our AI reached its conclusion, not just what it concluded.
      </p>

      <h2>Our Commitment to Trust</h2>
      <p>
        In the "Your Money or Your Life" (YMYL) category of financial information, trust is non-negotiable. We are committed to providing information that is as accurate and reliable as possible. However, it's crucial to remember that all AI-generated content is for informational purposes only and should not be considered financial advice. We strongly encourage you to conduct your own research and consult with a qualified financial advisor before making any investment decisions.
      </p>

      <h2>Contact Us</h2>
      <p>
        We are constantly working to improve ProfitScout and value your feedback. If you have any questions, suggestions, or concerns, please do not hesitate to reach out to us.
      </p>
      <p>
        You can contact us via email at: <a href="mailto:admin@profitscout.app">admin@profitscout.app</a>.
      </p>
    </article>
  );
}
