# PROMPT: Site-Wide Copywriting Overhaul

## Context
We audited every page on gammarips.com against 7 proven copywriting rules for digital products. The core problem: we describe what GammaRips IS everywhere instead of what the buyer GETS. This prompt rewrites all marketing copy site-wide in one atomic pass so the voice is consistent.

**The One Promise (every page ladders to this):** "Know what smart money did last night — before the market opens."

**Voice:** Sharp, specific, trader-to-trader. Lead with outcome, follow with mechanism. No corporate language.

---

## File 1: `src/components/landing/hero.tsx`

Replace the entire return content:

```tsx
export function Hero() {
  return (
    <section className="py-8 md:py-12 text-center container px-4">
      <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 tracking-tight">
        Wake Up Knowing What Smart Money Did Last Night
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
        Every morning by 6 AM, you get the trades institutions placed overnight — scored, analyzed, with specific contracts to consider. While 99% of traders check the news, you already know where the money moved.
      </p>
      <p className="text-sm text-muted-foreground">
        5,230+ tickers scanned · Signals scored 1-10 · Delivered before market open
      </p>
    </section>
  );
}
```

---

## File 2: `src/app/page.tsx`

### A. Replace the `steps` array:

```tsx
const steps = [
  { icon: <Scan className="h-6 w-6 text-primary" />, title: 'See Everything', desc: 'Institutional moves across 5,230+ tickers — not just the popular 50 everyone watches' },
  { icon: <Brain className="h-6 w-6 text-primary" />, title: 'Know What Matters', desc: 'Each signal scored 1-10 so you focus on high-conviction setups, not noise' },
  { icon: <Sparkles className="h-6 w-6 text-primary" />, title: 'Get the Trade', desc: 'Specific contracts, strikes, and the AI thesis explaining why institutions are positioned' },
  { icon: <Send className="h-6 w-6 text-primary" />, title: 'Act First', desc: 'In your hands before 9:30 AM — while everyone else is still reading headlines' },
];
```

### B. Replace the Value Props section:

Find the section with `<h2>` "What Smart Money Did Last Night" and replace the entire `{/* Value Props */}` section:

```tsx
{/* Value Props */}
<section className="text-center space-y-4">
  <h2 className="text-3xl font-bold font-headline">Stop Trading Blind</h2>
  <p className="text-muted-foreground max-w-2xl mx-auto">
    Most retail traders find out about institutional moves after the stock already popped. You'll see the positions at 6 AM — hours before the move. Every signal timestamped, every call tracked publicly. No cherry-picking, no hindsight.
  </p>
  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
    <Button asChild size="lg">
      <Link href="/pricing">
        Get The Overnight Edge <ArrowRight className="ml-2 h-5 w-5" />
      </Link>
    </Button>
    <Button asChild variant="outline" size="lg">
      <Link href="/how-it-works">See How It Works</Link>
    </Button>
  </div>
</section>
```

### C. Replace the Pricing Summary cards text:

```tsx
{/* Pricing Summary */}
<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card className="bg-card/50 text-center">
    <CardContent className="p-6">
      <p className="text-2xl font-bold font-headline">Free</p>
      <p className="text-sm text-muted-foreground mt-2">See which tickers had unusual activity overnight. Enough to know where to look.</p>
    </CardContent>
  </Card>
  <Card className="bg-card/50 text-center border-primary/30">
    <CardContent className="p-6">
      <p className="text-sm text-primary font-semibold">THE OVERNIGHT EDGE</p>
      <p className="text-2xl font-bold font-headline">$49/mo</p>
      <p className="text-sm text-muted-foreground mt-2">The full trade plan every morning: AI thesis, specific contracts, key levels.</p>
    </CardContent>
  </Card>
  <Card className="bg-card/50 text-center">
    <CardContent className="p-6">
      <p className="text-sm text-muted-foreground font-semibold">THE WAR ROOM</p>
      <p className="text-2xl font-bold font-headline">$149/mo</p>
      <p className="text-sm text-muted-foreground mt-2">Everything in Edge plus real-time WhatsApp alerts and direct access to the analyst.</p>
    </CardContent>
  </Card>
</section>
```

### D. Replace the metadata description:

```tsx
export const metadata: Metadata = {
  title: "GammaRips | The Overnight Edge — Know What Smart Money Did Last Night",
  description: "Every morning before the market opens, see what institutional money did overnight. 5,230+ tickers scanned. Signals scored 1-10. Specific contracts recommended.",
  alternates: {
    canonical: '/',
  },
};
```

---

## File 3: `src/components/landing/faq.tsx`

Replace the entire `faqs` array:

```tsx
export const faqs = [
  {
    question: "What do I actually get every morning?",
    answer: "By 6 AM EST, you get a scored list of every ticker where institutions placed unusual options bets overnight. Free users see the ticker, score, direction, and move size. Paid users ($49/mo) get the full AI trade thesis, specific contract recommendations with strike and expiry, key support/resistance levels, and technical + news analysis."
  },
  {
    question: "How do you decide which signals are worth paying attention to?",
    answer: "Each signal is scored 1-10 based on four things: how much money institutions put in (positioning size), how many strike prices had unusual activity (strike breadth), how much volume there was vs existing positions (vol/OI ratio), and whether the money was directionally concentrated in calls or puts (flow imbalance). Scores of 6+ get the full AI enrichment."
  },
  {
    question: "Can I try it without paying?",
    answer: "Yes. Free accounts see daily signal previews — ticker, score, direction, percent move, and positioning size — plus daily market themes and the full reports archive. You can watch the signals for as long as you want before deciding if the full analysis is worth $49/mo."
  },
  {
    question: "What's the difference between free and the $49 plan?",
    answer: "Free shows you WHERE institutions moved. The $49 Overnight Edge plan tells you WHY they moved and WHAT to do about it — the AI-written trade thesis, specific contract recommendations (strike + expiry), key price levels where the trade works or breaks down, and detailed technical and news analysis."
  },
  {
    question: "Is the War Room worth 3x the price?",
    answer: "The War Room ($149/mo) is for active traders who want real-time flow alerts during market hours via WhatsApp — not just the overnight scan. You also get direct access to ask GammaMolt questions and priority access to the highest-conviction setups before they're published to Edge subscribers."
  },
  {
    question: "What time do I need to be up?",
    answer: "Signals are ready by 6 AM EST. You don't need to be up at 4 AM when the scanner runs — everything is waiting for you when you open gammarips.com with your morning coffee. Most traders check between 7-9 AM and have their trade plan set before the 9:30 open."
  },
  {
    question: "Are you telling me what to trade?",
    answer: "No. We surface what institutional money did overnight and generate AI analysis to help you understand it. Every signal is timestamped and tracked publicly so you can judge our accuracy — but all trading decisions are yours. Past performance doesn't guarantee future results."
  },
  {
    question: "Wait — an AI runs this?",
    answer: "The daily pipeline is operated by GammaMolt, an autonomous AI agent built on Claude (Anthropic). GammaMolt runs the scanning, scoring, enrichment, reporting, and content. The system was built by Evan Parra, an ML engineer and data architect. Every signal is automated and publicly tracked — no human cherry-picking the good calls."
  },
];
```

---

## File 4: `src/app/pricing/page.tsx`

### A. Replace the header:

```tsx
<header className="text-center mb-16">
  <p className="text-sm font-semibold uppercase tracking-wider text-primary">Pricing</p>
  <h1 className="mt-2 text-4xl sm:text-5xl font-bold font-headline tracking-tight">
    Pick How Deep You Want to Go
  </h1>
  <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
    Free gets you the radar. $49 gets you the playbook. $149 gets you the war room with real-time alerts to your phone.
  </p>
</header>
```

### B. Replace the `features` array:

```tsx
const features = [
  { name: 'Daily signal previews (ticker, score, direction, move)', free: true, edge: true, war: true },
  { name: 'Top movers + market themes', free: true, edge: true, war: true },
  { name: 'Full reports archive', free: true, edge: true, war: true },
  { name: 'AI trade thesis explaining why institutions are positioned', free: false, edge: true, war: true },
  { name: 'Specific contract recommendations (strike + expiry)', free: false, edge: true, war: true },
  { name: 'Key levels where the trade works or breaks down', free: false, edge: true, war: true },
  { name: 'Full technical picture (RSI, MACD, MAs) in plain English', free: false, edge: true, war: true },
  { name: 'The catalyst: earnings, FDA, macro — what\'s driving the bet', free: false, edge: true, war: true },
  { name: 'Real-time WhatsApp alerts when institutional flow spikes intraday', free: false, edge: false, war: true },
  { name: 'First to see highest-conviction setups before they\'re published', free: false, edge: false, war: true },
  { name: 'Ask GammaMolt anything — direct access in the War Room', free: false, edge: false, war: true },
];
```

### C. Replace the tier subtitles in the CardHeader sections:

Free tier:
```tsx
<p className="text-sm text-muted-foreground">See where institutions moved. Decide if you want the full picture.</p>
```

Overnight Edge tier:
```tsx
<p className="text-sm text-muted-foreground">The full trade plan every morning before the bell</p>
```

War Room tier:
```tsx
<p className="text-sm text-muted-foreground">Real-time alerts + direct analyst access</p>
```

### D. Replace metadata:

```tsx
export const metadata: Metadata = {
  title: 'Pricing | The Overnight Edge by GammaRips',
  description: 'Free daily signal previews. $49/mo for the full trade plan with AI thesis and contract recommendations. $149/mo for real-time WhatsApp alerts and direct analyst access.',
  alternates: { canonical: '/pricing' },
};
```

---

## File 5: `src/app/about/page.tsx`

### A. Replace the page header `<p>` subtitle:

```tsx
<p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
  While you sleep, institutions place their bets. By 6 AM, you know exactly what they did — and how to trade it.
</p>
```

### B. Replace the `differentiators` array:

```tsx
const differentiators = [
  "You're not competing for the same 50 tickers as everyone on fintwit — you're seeing flow across the entire market",
  "Every call we make is public and tracked. Check our scorecard — we can't hide from bad picks",
  "You get a trade plan, not a spreadsheet. The AI tells you why institutions are positioned and what contract to consider",
  "GammaMolt runs the pipeline 24/7 — scanning, scoring, enriching — so you get fresh signals every morning without fail",
  <>Built by Evan Parra, ML engineer and data architect who also consults at <Link href="https://evanparra.ai" target="_blank" className="underline hover:text-primary">evanparra.ai</Link></>,
  "Start free. See the signals. Decide if the full analysis is worth $49/mo after you've watched it work",
];
```

### C. Rename the differentiators section heading:

Change:
```
What Makes Us Different
```
To:
```
Why Traders Switch to Us
```

### D. Fix GammaMolt's title:

Change:
```
Chief Agent Architect
```
To:
```
Chief Intelligence Officer
```

### E. Fix Evan's title in the org schema:

Change:
```
"jobTitle": "Founder & Chairman"
```
To:
```
"jobTitle": "Founder & CEO"
```

### F. Replace metadata description:

```tsx
description: 'While you sleep, institutions place their bets. By 6 AM, you know what they did. Meet the team behind The Overnight Edge — a founder-engineer and an AI that tracks every signal.',
```

---

## File 6: `src/app/how-it-works/page.tsx`

### A. Replace the header subtitle:

```tsx
<p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
  Here's exactly what lands on your screen before the market opens — and how we find it.
</p>
```

### B. Add a "Your Morning" section BEFORE the "What is UOA" section (insert after the first `<Separator />`):

```tsx
{/* Your Morning */}
<section className="space-y-4">
  <h2 className="text-3xl font-bold font-headline">Your Morning With The Overnight Edge</h2>
  <div className="p-6 rounded-lg border bg-primary/5 border-primary/20 text-muted-foreground space-y-4">
    <p>
      It's 6:15 AM. You open gammarips.com with your coffee.
    </p>
    <p>
      Three tickers are highlighted — all scored 8+ overnight. One has $14M in new call positioning across 58 strike prices. The AI thesis says it's an agentic AI infrastructure play with earnings in two weeks. Specific contracts are listed. Key support and resistance levels are marked.
    </p>
    <p>
      By 9:25 AM, you know exactly which setups you're watching at the open. Most traders are still scrolling X for tips. You already have the institutional playbook.
    </p>
    <p className="text-primary font-semibold">
      That's The Overnight Edge.
    </p>
  </div>
</section>

<Separator className="my-12 sm:my-16" />
```

### C. Replace the CTA at the bottom:

```tsx
<div className="text-center">
  <h2 className="text-2xl font-bold font-headline mb-4">Ready to See Tomorrow Morning's Flow?</h2>
  <div className="flex flex-col sm:flex-row gap-4 justify-center">
    <Button asChild size="lg">
      <Link href="/pricing">View Pricing <ArrowRight className="ml-2 h-5 w-5" /></Link>
    </Button>
    <Button asChild variant="outline" size="lg">
      <Link href="/scorecard">Check Our Track Record</Link>
    </Button>
  </div>
</div>
```

---

## File 7: `src/app/signals/page.tsx`

Replace the header section:

```tsx
<div className="mb-8">
  <h1 className="text-3xl font-bold font-headline mb-2">What Smart Money Did Last Night</h1>
  <p className="text-muted-foreground">
    Every signal below was detected from institutional options flow overnight. Scored 1-10 on conviction. Scan date: {scanDate}.
  </p>
</div>
```

---

## File 8: `src/app/signals/[ticker]/signal-client.tsx`

### A. Replace the subtitle under the ticker name:

Change:
```tsx
<p className="text-lg text-muted-foreground">Overnight Institutional Flow Signal</p>
```
To:
```tsx
<p className="text-lg text-muted-foreground">Institutions moved here last night. Here's what they did.</p>
```

### B. Replace the Contract Setup paywall text:

Change:
```tsx
<p className="text-sm text-muted-foreground mb-4">Get the exact contract, strike price, and risk/reward analysis.</p>
```
To:
```tsx
<p className="text-sm text-muted-foreground mb-4">See the exact contract institutions are playing — strike, expiry, and whether the risk/reward is worth it.</p>
```

### C. Replace the Key Levels paywall text:

Change:
```tsx
<p className="text-sm text-muted-foreground mb-4">See key support & resistance levels derived from volatility.</p>
```
To:
```tsx
<p className="text-sm text-muted-foreground mb-4">Know exactly where this trade works and where it breaks down.</p>
```

### D. Replace the Full Analysis paywall button:

Change:
```tsx
<Link href="/#pricing">Unlock Full Analysis</Link>
```
To:
```tsx
<Link href="/pricing">See the Full Trade Plan</Link>
```

### E. Also change the other two paywall buttons from `/#pricing` to `/pricing`:

```tsx
<Link href="/pricing">Upgrade to Edge</Link>
```
(Both instances — Contract Setup and Key Levels)

---

## File 9: `src/app/reports/page.tsx`

Replace the header section:

```tsx
<div className="mb-8">
  <h1 className="text-3xl md:text-4xl font-bold font-headline mb-4">The Morning Briefing</h1>
  <p className="text-muted-foreground text-lg max-w-2xl">
    Every trading day, we publish what institutional money did overnight. Pick a date. See what happened.
  </p>
</div>
```

Replace metadata:
```tsx
export const metadata: Metadata = {
  title: "The Morning Briefing | Daily Overnight Edge Reports | GammaRips",
  description: "Every trading day, we publish what institutional money did overnight. Browse daily reports with scored signals, market themes, and AI analysis.",
};
```

---

## File 10: `src/app/scorecard/page.tsx`

### A. Replace the "Win Tracking Begins" card text:

```tsx
<h2 className="text-2xl font-bold font-headline">Win Tracking Begins February 2026</h2>
<p className="text-muted-foreground max-w-2xl mx-auto">
  We started tracking signals in February 2026. As trades resolve, the numbers show up here automatically. Every signal is timestamped when published — we can't edit history.
</p>
<p className="text-muted-foreground">
  Check back for verified results. In the meantime, browse our daily signals and reports.
</p>
```

---

## File 11: `src/components/email-capture.tsx`

Replace the heading and body text (inside the `variant !== 'default' ? null :` block):

```tsx
<h3 className="mb-2 text-xl font-bold text-white">
  Tomorrow Morning, Know What Smart Money Did Tonight
</h3>
<p className="mb-6 max-w-md text-sm text-zinc-400">
  Free daily email. Top signals scored and summarized before the bell. Takes 2 minutes to read.
</p>
```

---

## File 12: `src/components/layout/footer.tsx`

Replace the tagline under the logo:

Change:
```tsx
<p className="text-sm text-muted-foreground mt-2">Institutional Options Flow Intelligence</p>
```
To:
```tsx
<p className="text-sm text-muted-foreground mt-2">Know what smart money did last night</p>
```

---

## Do NOT Change
- File structure, routing, or component architecture
- Any TypeScript types, interfaces, or data fetching logic
- Privacy policy or terms of service
- Auth flow components (user-nav, auth-dialog)
- The actual data rendering logic in signals-table.tsx or other data components
- Any `className` styling unless specifically noted above
- The FAQ Accordion component structure — only replace the `faqs` array content

## Verify After
1. Every page renders without errors
2. No broken links (especially `/#pricing` → `/pricing` changes)
3. Homepage hero says "Wake Up Knowing What Smart Money Did Last Night"
4. Pricing says "Pick How Deep You Want to Go"
5. GammaMolt title is "Chief Intelligence Officer" on About page
6. Evan's title is "Founder & CEO" (not Chairman) on About page
7. FAQ questions sound like a real person asking (e.g., "What do I actually get every morning?")
8. Footer tagline matches the promise
9. All paywall copy describes what the buyer gets, not what the feature is
10. No instances of "institutional options flow intelligence platform" remain in marketing copy
