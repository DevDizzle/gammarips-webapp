// Single source of truth for the two product literals that otherwise drift
// across marketing copy, structured data, transactional emails, and the
// agent-discovery files.
//
// TOOL_COUNT: the number of tools the live MCP server exposes. 29 today
// (server truth as of 2026-07). It flips to 9 when MCP v4 deploys; that is a
// one-line change here, paired with the /developers catalog + public/*
// agent-discovery rewrite (replan slice step 4). The four static public/
// files (llms.txt, mcp.json, skill.md, .well-known/ai-plugin.json) cannot
// import this constant, so keep them in sync by hand at the v4 flip.
export const TOOL_COUNT = 29;

// PRICE_MONTHLY: the Agent Access subscription price, display form ($ + amount).
// Structured-data numeric price fields (e.g. "39.00" in JSON-LD) are a separate
// format and are left as literals.
export const PRICE_MONTHLY = '$39';
