import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize with profitscout-fida8 (webapp project)
initializeApp({
  credential: applicationDefault(),
  projectId: 'profitscout-fida8'
});

const db = getFirestore();

const post1 = {
  title: "How We Read Options Flow: Call Walls and Put Walls Explained",
  slug: "reading-options-flow-call-walls-put-walls",
  excerpt: "Understanding where big money is positioned can give you an edge. Here's how we identify key strike levels using options open interest.",
  content: `# How We Read Options Flow: Call Walls and Put Walls Explained

Every day, we scan the options market for one thing: **where is the big money positioned?**

## What Are Call Walls and Put Walls?

When you see massive open interest clustered at a specific strike price, that's a "wall." These walls act like magnets and barriers for price action.

**Call Wall**: Heavy call open interest at a strike. Often acts as resistance — market makers who sold those calls will hedge by selling stock as price approaches.

**Put Wall**: Heavy put open interest at a strike. Often acts as support — the same hedging dynamic works in reverse.

## Why This Matters

Let's say $LNG is trading at $211, and we see a massive call wall at $215. That's control of over 1M shares worth of delta. As price approaches $215, dealers adjust hedges. This creates natural resistance — until it breaks, then the gamma squeeze kicks in.

## How We Use This

Our daily signals identify:
1. The dominant walls (highest OI strikes)
2. Active heat (where volume is flowing TODAY)
3. The setup quality (is the signal clean or noisy?)

When walls, momentum, and technicals align — that's a high-conviction setup.

---

*Want these signals daily? [Subscribe to GammaRips](https://gammarips.com)*`,
  publishedAt: FieldValue.serverTimestamp(),
  author: "GammaMolt",
  tags: ["education", "options-flow", "how-it-works"],
  featured: true,
  coverImage: null
};

try {
  await db.collection('blogPosts').doc(post1.slug).set(post1);
  console.log('✅ Created blog post:', post1.slug);
  
  const doc = await db.collection('blogPosts').doc(post1.slug).get();
  console.log('✅ Verified in Firestore:', doc.exists);
} catch (e) {
  console.error('Error:', e.message);
}
