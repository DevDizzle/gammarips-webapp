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

  return (
    <ArenaClientPage debate={debate} premiumTickers={premiumTickers} />
  );
}
