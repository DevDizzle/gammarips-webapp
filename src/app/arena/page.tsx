import { getLatestArenaDebate } from "@/lib/firebase-admin";
import { ArenaClientPage } from "./arena-client";
import { PublicHeader } from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Arena — 7 AI Models Debate Today's Best Trade | GammaRips",
  description: "Every morning, 7 AI agents powered by Claude, GPT, Grok, Gemini, DeepSeek, Llama, and Mistral analyze the same institutional flow data and argue over the best trade. War Room members watch the fight.",
};

export default async function ArenaPage() {
  const debate = await getLatestArenaDebate();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader />
      <ArenaClientPage debate={debate} />
      <Footer />
    </div>
  );
}
