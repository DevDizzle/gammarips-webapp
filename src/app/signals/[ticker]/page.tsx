import { getSignalByTicker, getLatestOvernightSummary } from "@/lib/firebase-admin";
import SignalClientPage from "./signal-client";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ ticker: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ticker } = await params;
  return {
    title: `${ticker.toUpperCase()} Signal | The Overnight Edge`,
    description: `Institutional options flow analysis for ${ticker.toUpperCase()}.`,
    alternates: { canonical: `https://gammarips.com/signals/${ticker}` },
  };
}

export default async function SignalPage({ params }: PageProps) {
  const { ticker } = await params;
  
  // Get latest scan date
  const summary = await getLatestOvernightSummary();
  if (!summary) {
    return notFound();
  }
  
  const signal = await getSignalByTicker(summary.scan_date, ticker.toUpperCase());
  
  if (!signal) {
    return notFound();
  }

  return <SignalClientPage signal={signal} />;
}
