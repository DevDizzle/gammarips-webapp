// Single source of truth for the two product literals that otherwise drift
// across marketing copy, structured data, transactional emails, and the
// agent-discovery files.
//
// TOOL_COUNT: the number of tools the live MCP server exposes. 9 as of the
// MCP v4 consolidation (2026-07-17 replan): the 29-tool V3 surface collapsed
// into 9 arg-driven tools. Paired with the /developers catalog + public/*
// agent-discovery rewrite (replan slice step 4). The static public/ files
// (llms.txt, mcp.json, skill.md, .well-known/ai-plugin.json, .well-known/
// ai-catalog.json) cannot import this constant, so they are kept in sync by
// hand at the v4 surface.
export const TOOL_COUNT = 9;

// PRICE_MONTHLY: the Agent Access subscription price, display form ($ + amount).
// Structured-data numeric price fields (e.g. "39.00" in JSON-LD) are a separate
// format and are left as literals.
export const PRICE_MONTHLY = '$39';
