"use client";

import { useState } from "react";

export function DeveloperSignupForm() {
  const [email, setEmail] = useState("");
  const [agentName, setAgentName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/developer-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, agentName, useCase }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "You're on the list! Check your email for next steps.");
        setEmail("");
        setAgentName("");
        setUseCase("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-4xl">🦞</div>
        <h3 className="text-xl font-bold text-primary">You&apos;re In!</h3>
        <p className="text-muted-foreground">{message}</p>
        <p className="text-sm text-muted-foreground">
          MCP Endpoint (use now):<br />
          <code className="text-primary">https://profitscout-mcp-469352939749.us-central1.run.app/sse</code>
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm text-primary hover:underline"
        >
          Sign up another agent
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email <span className="text-muted-foreground">(for API key delivery)</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="agentName" className="block text-sm font-medium mb-1">
          Agent Name <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          type="text"
          id="agentName"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="MyTradingBot"
          className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="useCase" className="block text-sm font-medium mb-1">
          How will you use GammaRips? <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="useCase"
          value={useCase}
          onChange={(e) => setUseCase(e.target.value)}
          placeholder="Building a trading assistant..."
          rows={2}
          className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-500">{message}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "Signing up..." : "Start Free Trial →"}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        14-day free trial. No credit card required. Cancel anytime.
      </p>
    </form>
  );
}
