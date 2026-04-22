'use client';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
    // No global auth gate. Each page and component that depends on user state
    // handles its own loading UX. This keeps SSR HTML crawlable — critical for
    // SEO and for AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) that do
    // not execute JavaScript.
    return <>{children}</>;
}
