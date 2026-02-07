import { Metadata } from "next";
import Link from "next/link";
import { DeveloperPageClient } from "./developer-page-client";

export const metadata: Metadata = {
  title: "GammaRips MCP API | AI Options Signals for Agents & Developers",
  description: "Connect your AI agent to GammaRips MCP. Get high-conviction options signals, performance tracking, and market analysis. $19/mo.",
  keywords: ["MCP", "options trading", "AI signals", "trading API", "options analysis", "gamma exposure", "agent API", "LLM tools"],
  openGraph: {
    title: "GammaRips MCP | AI Options Signals API",
    description: "High-conviction options signals for AI agents. +114% avg gain. Connect via MCP.",
    url: "https://gammarips.com/developers",
    siteName: "GammaRips",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GammaRips MCP | AI Options Signals API",
    description: "High-conviction options signals for AI agents. +114% avg gain.",
    creator: "@GammaRips",
  },
  alternates: {
    canonical: "https://gammarips.com/developers",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DevelopersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebAPI",
    "name": "GammaRips MCP API",
    "description": "Model Context Protocol (MCP) API for retrieving high-conviction options trading signals, technical analysis, and market sentiment for AI agents.",
    "url": "https://gammarips.com/developers",
    "documentation": "https://gammarips.com/skill.md",
    "termsOfService": "https://gammarips.com/terms",
    "provider": {
      "@type": "Organization",
      "name": "GammaRips",
      "url": "https://gammarips.com",
      "logo": "https://gammarips.com/icon.png"
    },
    "offers": {
      "@type": "Offer",
      "price": "19.00",
      "priceCurrency": "USD",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/OnlineOnly"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DeveloperPageClient />
    </>
  );
}