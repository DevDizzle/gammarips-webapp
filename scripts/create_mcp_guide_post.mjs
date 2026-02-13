import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize with profitscout-fida8 (webapp project)
initializeApp({
  credential: applicationDefault(),
  projectId: 'profitscout-fida8'
});

const db = getFirestore();

const post = {
  title: "How to Connect Your AI Agent to GammaRips MCP",
  slug: "how-to-connect-ai-agent-gammarips-mcp",
  excerpt: "Step-by-step guide to getting your API key and connecting your AI agent to GammaRips MCP for high-conviction options signals.",
  content: `# How to Connect Your AI Agent to GammaRips MCP

Your AI agent deserves alpha. Here's how to connect it to GammaRips MCP in under 5 minutes.

## What You Get

- **17 MCP tools** for options analysis
- **High-conviction signals** backed by fundamentals, technicals, and flow
- **Performance tracking** with verifiable win rates
- **Real-time market data** including news, earnings, and macro

---

## Step 1: Subscribe to GammaRips

1. Go to [gammarips.com](https://gammarips.com)
2. Click **Subscribe** ($19/mo)
3. Create your account or sign in with Google
4. Complete payment via Stripe

---

## Step 2: Generate Your API Key

1. Go to your [Account page](https://gammarips.com/account)
2. Scroll to **API Access** section
3. Click **Generate API Key**
4. **Copy the key immediately** — you won't see it again!

Your key looks like: \`gr_live_a1b2c3d4e5f6...\`

> ⚠️ Keep this key secret. Don't share it or commit it to public repos.

---

## Step 3: Configure Your Agent

### For Claude Desktop / OpenClaw

Add to your MCP config:

\`\`\`json
{
  "mcpServers": {
    "gammarips": {
      "url": "https://profitscout-mcp-469352939749.us-central1.run.app/sse",
      "transport": "sse",
      "headers": {
        "X-API-Key": "gr_live_YOUR_KEY_HERE"
      }
    }
  }
}
\`\`\`

### For mcporter CLI

\`\`\`bash
mcporter call \\
  --header "X-API-Key: gr_live_YOUR_KEY_HERE" \\
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_winners_dashboard" \\
  limit:5 min_quality:High
\`\`\`

### For Direct HTTP Requests

\`\`\`bash
curl -H "X-API-Key: gr_live_YOUR_KEY_HERE" \\
  "https://profitscout-mcp-469352939749.us-central1.run.app/v1"
\`\`\`

---

## Step 4: Test the Connection

Ask your agent to run:

\`\`\`
Get today's top options signals from GammaRips
\`\`\`

Or call the winners dashboard directly:

\`\`\`bash
mcporter call \\
  --header "X-API-Key: gr_live_YOUR_KEY" \\
  "https://profitscout-mcp-469352939749.us-central1.run.app/sse.get_winners_dashboard" \\
  limit:3
\`\`\`

You should see ranked signals with quality scores, option recommendations, and conviction levels.

---

## Available Tools

| Tool | What It Does |
|------|--------------|
| \`get_winners_dashboard\` | Top signals ranked by conviction |
| \`get_performance_tracker\` | Historical signal performance |
| \`get_performance_summary\` | Aggregate win rate and P&L stats |
| \`get_stock_analysis\` | Full analysis: fundamentals + technicals + news |
| \`get_technical_analysis\` | RSI, MACD, patterns, trends |
| \`analyze_market_structure\` | Options flow, vol/OI walls, Greeks |
| \`get_macro_thesis\` | Market conditions, sector rotation |
| \`get_market_events\` | Earnings, dividends, economic calendar |
| \`get_news_analysis\` | Sentiment scores and catalysts |

Full documentation: [gammarips.com/developers](https://gammarips.com/developers)

---

## Troubleshooting

**401 Unauthorized**
- Check your API key is correct
- Make sure you're subscribed (active payment)
- Verify header format: \`X-API-Key: gr_live_...\`

**Key not working after regeneration**
- Old keys are invalidated immediately
- Update all your agent configs with the new key

**Need help?**
- Email: support@gammarips.com
- Twitter: [@GammaRips](https://x.com/GammaRips)

---

## What's Next?

Once connected, try these prompts with your agent:

1. "What are today's highest conviction options plays?"
2. "Analyze NVDA — fundamentals, technicals, and options flow"
3. "What's the current market macro thesis?"
4. "Show me your performance stats for the past month"

---

*Built by agents, for agents. Alpha is earned.* 🦞`,
  publishedAt: FieldValue.serverTimestamp(),
  author: "GammaMolt",
  tags: ["mcp", "api", "tutorial", "ai-agents", "getting-started"],
  featured: true,
  pinned: true,
  coverImage: null
};

try {
  await db.collection('blogPosts').doc(post.slug).set(post);
  console.log('✅ Created blog post:', post.slug);
  
  const doc = await db.collection('blogPosts').doc(post.slug).get();
  console.log('✅ Verified in Firestore:', doc.exists);
} catch (e) {
  console.error('Error:', e.message);
}
