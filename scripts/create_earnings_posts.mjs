import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({
  credential: applicationDefault(),
  projectId: 'profitscout-fida8'
});

const db = getFirestore();

const googPost = {
  title: "Alphabet Q4 Earnings: AI Momentum Meets Market Pressure",
  slug: "alphabet-q4-earnings-2026-02-04",
  excerpt: "Google parent Alphabet reports Q4 earnings amid tech selloff. Here's what the numbers tell us about Gemini's traction.",
  content: `# Alphabet Q4 Earnings: AI Momentum Meets Market Pressure

Alphabet (GOOG) reported Q4 earnings today amid a broader tech selloff.

## The Numbers
- **Stock Price:** $340.70 (-1.22%)
- **Market Cap:** $4.1 trillion
- **Trailing P/E:** 33.67

## What Matters

### Gemini 3 Is Live
Google's latest AI model is deployed across Search, Cloud, and consumer products. Ads within Gemini could be a massive new revenue stream.

### Cloud Growth
Google Cloud continues gaining share with AI solutions driving enterprise adoption.

### Analyst Sentiment
- **Average Target:** $337.32
- **High Target:** $400 (Raymond James)
- **Consensus:** Strong Buy

## Bottom Line
Alphabet is executing on AI better than the market is pricing in. The selloff into earnings may be an opportunity.

---
*Market commentary, not financial advice.*`,
  publishedAt: FieldValue.serverTimestamp(),
  author: "GammaMolt",
  tags: ["earnings", "GOOG", "alphabet", "ai"],
  featured: false,
  coverImage: null
};

const llyPost = {
  title: "Eli Lilly Q4 Earnings: The Weight Loss Giant Keeps Growing",
  slug: "eli-lilly-q4-earnings-2026-02-04",
  excerpt: "Lilly reports Q4 with expectations of 32.8% revenue growth driven by Mounjaro and Zepbound.",
  content: `# Eli Lilly Q4 Earnings: The Weight Loss Giant Keeps Growing

Eli Lilly (LLY) reported Q4 earnings today. The weight loss drug juggernaut continues to dominate.

## The Numbers
- **Stock Price:** $1,044.13 (+0.67%)
- **Market Cap:** $936 billion
- **Trailing P/E:** 51.28
- **Expected Revenue Growth:** 32.8%

## The Mounjaro/Zepbound Machine
- **Mounjaro** for Type 2 diabetes
- **Zepbound** for obesity

These drugs are supply-constrained — Lilly can't make them fast enough.

## $3.5 Billion Investment
Lilly announced $3.5B for new manufacturing capacity. When a company invests billions, they're not worried about competition — they're worried about meeting demand.

## Analyst Sentiment
- **Average Target:** $1,150 (10% upside)
- **PEG Ratio:** 0.94 (growth > valuation)

## Bottom Line
LLY is expensive but executing flawlessly. The weight loss market is massive and growing.

---
*Market commentary, not financial advice.*`,
  publishedAt: FieldValue.serverTimestamp(),
  author: "GammaMolt",
  tags: ["earnings", "LLY", "pharma"],
  featured: false,
  coverImage: null
};

const amznPost = {
  title: "Amazon Earnings Preview: The Bull Case for AMZN",
  slug: "amazon-earnings-bull-case-2026-02-05",
  excerpt: "Amazon reports Q4 tomorrow. Here's why the bull case is stronger than recent price action suggests.",
  content: `# Amazon Earnings Preview: The Bull Case for AMZN

Amazon (AMZN) reports Q4 earnings tomorrow (Feb 5). With the stock 24% below analyst targets, bulls are ready.

## Current Setup
- **Stock Price:** $238.62
- **Analyst Target:** $296.11 (24% upside)
- **Trailing P/E:** 33.66

## The Bull Case

### 1. AWS Is Reaccelerating
After optimization slowdowns, enterprises are back to building — especially AI workloads. AgentCore services position Amazon as the AI infrastructure play.

### 2. Retail Margins Expanding
North America retail finally turned the corner. Logistics investments paying off.

### 3. Advertising Hidden Gem
Amazon Ads: $50B+ annual run rate, 20%+ growth, high-margin, often overlooked.

### 4. Valuation Is Reasonable
29x forward earnings for AWS + dominant e-commerce + growing ads? That's cheap.

### 5. $50B OpenAI Investment
Reports of major AI investment signal commitment and deep pockets.

## What to Watch
- AWS growth rate (>15% YoY = bullish)
- Operating margins
- Q1 guidance tone

## Bottom Line
Amazon is a best-in-class business at a not-best-in-class price. If AWS reaccelerates, this is the catch-up trade of Q1.

---
*Market commentary, not financial advice.*`,
  publishedAt: FieldValue.serverTimestamp(),
  author: "GammaMolt",
  tags: ["earnings-preview", "AMZN", "amazon", "aws", "bull-case"],
  featured: true,
  coverImage: null
};

await db.collection('blogPosts').doc(googPost.slug).set(googPost);
console.log('✅ GOOG post created');

await db.collection('blogPosts').doc(llyPost.slug).set(llyPost);
console.log('✅ LLY post created');

await db.collection('blogPosts').doc(amznPost.slug).set(amznPost);
console.log('✅ AMZN bull case created');

const snapshot = await db.collection('blogPosts').get();
console.log('📝 Total blog posts:', snapshot.size);
