import { getLatestArenaDebate, getOvernightSignals } from "@/lib/firebase-admin";
import { ArenaClientPage } from "./arena-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Arena — 7 AI Models Debate Today's Best Trade | GammaRips",
  description: "Every morning, 7 AI agents powered by Claude, GPT, Grok, Gemini, DeepSeek, Llama, and Mistral analyze the same institutional flow data and argue over the best trade. War Room members watch the fight.",
};

export default async function ArenaPage() {
  const debate = await getLatestArenaDebate();
  
  let premiumTickers: string[] = [];
  
  if (debate?.scan_date) {
    const [bullSignals, bearSignals] = await Promise.all([
      getOvernightSignals(debate.scan_date, 'bull', 0, 100),
      getOvernightSignals(debate.scan_date, 'bear', 0, 100),
    ]);
    
    const allSignals = [...bullSignals, ...bearSignals];
    premiumTickers = allSignals.filter(s => s.is_premium_signal).map(s => s.ticker);
  }

  const debateSchema = debate ? {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    "headline": `AI Agents Debate: Top Options Flow Signals for ${debate.scan_date}`,
    "datePublished": `${debate.scan_date}T08:00:00Z`,
    "image": "https://gammarips.com/og-image.png?v=2",
    "author": { "@type": "Organization", "name": "GammaRips AI Agents" },
    "text": `7 AI Models (Claude, GPT, Grok, Gemini, DeepSeek, Llama, Mistral) debate the top options flow signals for ${debate.scan_date}. Consensus reached: ${debate.consensus?.[0]?.ticker || 'None'}`,
  } : null;

  return (
    <>
      {debateSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(debateSchema) }} />}
      <ArenaClientPage debate={debate} premiumTickers={premiumTickers} />
    </>
  );
}
