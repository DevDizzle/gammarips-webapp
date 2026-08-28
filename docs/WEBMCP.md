# WebMCP — planned agent tool surface for gammarips.com

Status: DECIDED, NOT BUILT. Owner call 2026-08-28: we will expose WebMCP tools
on the site when the standard matures. This document is the plan of record.
Do not start the build before the trigger below fires.

## What WebMCP is

WebMCP (Web Model Context Protocol) lets a web page expose structured tools to
AI agents that run in the browser. The agent calls a declared function instead
of scraping the page. Google and Microsoft co-authored the proposal. It is a
W3C Community Group draft.

Two APIs:

- Declarative: add `toolname` / `tooldescription` attributes to an existing
  HTML `<form>`.
- Imperative: register a tool in JavaScript with
  `navigator.modelContext.registerTool()` (name, JSON schema, callback).

Spec: https://github.com/webmachinelearning/webmcp (W3C Web Machine Learning
Community Group). Chrome ships it as an early preview behind a flag / origin
trial (first seen around Chrome 146-149, 2026).

## How it relates to what we already have

- The MCP server (`mcp.gammarips.com/mcp`) serves harness agents (Claude Code,
  Codex, Cursor). WebMCP does not replace it.
- The ARD file (`public/.well-known/ai-catalog.json`) handles discovery. It
  points registries at the MCP server card. Keep its pinned version in sync
  with `SERVER_VERSION` in `gammarips-mcp/src/server.py`.
- WebMCP adds the third leg: in-browser agents (Chrome Gemini, Edge Copilot)
  that act on gammarips.com itself.

## Tools we plan to expose (candidates, in priority order)

1. `start_trial` — the pricing-page subscribe form, declarative. The browser
   agent walks its human to Stripe checkout. Payment stays human-confirmed.
2. `create_api_key` — the account-page key generation flow, imperative
   (requires a signed-in session). The key shows once.
3. `get_connect_command` — returns the exact `claude mcp add` /
   client-specific connect command for the MCP server.
4. `search_signals` — the free signals archive pages, declarative search.

## Constraints (non-negotiable)

- The forbidden-claims list in `CLAUDE.md` applies to every tool name and
  `tooldescription` string. Tool descriptions are copy.
- No pick, no "signals to follow", no return language, anywhere in the tool
  surface. Data-not-advice framing applies.
- Critical actions (payment, account changes) keep human confirmation. WebMCP
  itself expects this for checkout-class actions.
- Tool descriptions go through the `gammarips-copywriter` agent like all copy.

## Build trigger

Build when one of these happens:

- Chrome ships WebMCP on by default (past origin trial), or
- a real prospect or subscriber asks for it, or
- the owner says go.

Check the spec repo and Chrome release notes at that time. The API surface may
change before standardization. Re-verify `navigator.modelContext` names against
the current draft before writing code.
