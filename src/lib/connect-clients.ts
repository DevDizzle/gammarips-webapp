// Per-client connect facts for the homepage connect tabs.
//
// Single source for "how does <client> reach the GammaRips MCP, free and pro".
// Every line here was checked against the client's official docs on
// 2026-08-15 (engine repo: docs/GTM-CLIENT-CONNECT-MATRIX.md, with sources).
// Re-check before you change a step. Never invent a step. When a client cannot
// send our key, say so plainly: the honest line converts better than a blur.
import { MCP_ENDPOINT } from '@/lib/constants';

export type ClientId =
  | 'claude-code'
  | 'codex'
  | 'cursor'
  | 'gemini-cli'
  | 'claude'
  | 'chatgpt'
  | 'grok';

// full: the client sends the Authorization header, the paid loop runs today.
// beta: the client can send it only through a feature in limited rollout.
// not-yet: the client cannot send our key; the paid tools need OAuth on our side.
// unverified: the vendor docs do not say; we have not confirmed a header field.
export type ProStatus = 'full' | 'beta' | 'not-yet' | 'unverified';

export type ConnectStep = { text: string; code?: string };

export type ConnectClient = {
  id: ClientId;
  label: string;
  kind: 'cli' | 'chat';
  free: { intro: string; steps: ConnectStep[] };
  pro: { status: ProStatus; intro: string; steps: ConnectStep[] };
};

const KEY = 'YOUR_API_KEY';

export const CONNECT_CLIENTS: ConnectClient[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    kind: 'cli',
    free: {
      intro: 'One command. No card, no key, no signup.',
      steps: [
        {
          text: 'Add the server, then ask Claude for a morning brief.',
          code: `claude mcp add --transport http gammarips ${MCP_ENDPOINT}`,
        },
      ],
    },
    pro: {
      status: 'full',
      intro: 'Full paid loop. Add the same server with your key.',
      steps: [
        {
          text: 'Mint your key on the account page after the trial starts. Paste it with no spaces and no newline.',
          code: `claude mcp add --transport http gammarips ${MCP_ENDPOINT} \\\n  --header "Authorization: Bearer ${KEY}"`,
        },
        {
          text: 'Or clone the harness: its .mcp.json reads GAMMARIPS_MCP_KEY from your shell.',
        },
      ],
    },
  },
  {
    id: 'codex',
    label: 'Codex',
    kind: 'cli',
    free: {
      intro: 'One block in ~/.codex/config.toml.',
      steps: [
        {
          text: 'Add the server. Codex connects with no credential when none is set.',
          code: `[mcp_servers.gammarips]\nurl = "${MCP_ENDPOINT}"`,
        },
      ],
    },
    pro: {
      status: 'full',
      intro: 'Full paid loop. Codex reads the key from an environment variable.',
      steps: [
        {
          text: 'Export GAMMARIPS_MCP_KEY in your shell, then point Codex at it.',
          code: `[mcp_servers.gammarips]\nurl = "${MCP_ENDPOINT}"\nbearer_token_env_var = "GAMMARIPS_MCP_KEY"`,
        },
      ],
    },
  },
  {
    id: 'cursor',
    label: 'Cursor',
    kind: 'cli',
    free: {
      intro: 'One entry in .cursor/mcp.json (project) or ~/.cursor/mcp.json (global).',
      steps: [
        {
          text: 'Add the server. No headers means the free tier.',
          code: `{\n  "mcpServers": {\n    "gammarips": { "url": "${MCP_ENDPOINT}" }\n  }\n}`,
        },
      ],
    },
    pro: {
      status: 'full',
      intro: 'Full paid loop. Cursor sends headers and reads the key from your shell.',
      steps: [
        {
          text: 'Export GAMMARIPS_MCP_KEY, then add the header.',
          code: `{\n  "mcpServers": {\n    "gammarips": {\n      "url": "${MCP_ENDPOINT}",\n      "headers": { "Authorization": "Bearer \${env:GAMMARIPS_MCP_KEY}" }\n    }\n  }\n}`,
        },
      ],
    },
  },
  {
    id: 'gemini-cli',
    label: 'Gemini CLI',
    kind: 'cli',
    free: {
      intro: 'One command. No card, no key, no signup.',
      steps: [
        {
          text: 'Add the server, then ask Gemini for a morning brief. Add -s user to make it global.',
          code: `gemini mcp add --transport http gammarips ${MCP_ENDPOINT}`,
        },
      ],
    },
    pro: {
      status: 'full',
      intro: 'Full paid loop. Add the same server with your key.',
      steps: [
        {
          text: 'Mint your key on the account page after the trial starts. Paste it with no spaces and no newline.',
          code: `gemini mcp add --transport http -H "Authorization: Bearer ${KEY}" \\\n  gammarips ${MCP_ENDPOINT}`,
        },
      ],
    },
  },
  {
    id: 'claude',
    label: 'Claude',
    kind: 'chat',
    free: {
      intro: 'claude.ai and Claude Desktop. About ten seconds.',
      steps: [
        { text: 'Open Customize, then Connectors, then Add custom connector.' },
        { text: `Paste ${MCP_ENDPOINT} and add it.` },
        { text: 'Ask Claude for a morning brief. Free plans get one custom connector.' },
      ],
    },
    pro: {
      status: 'beta',
      intro: 'Pro needs a header field that Anthropic is rolling out slowly.',
      steps: [
        {
          text: 'If the Add custom connector dialog shows a Request headers section, add a header named authorization with the value Bearer YOUR_API_KEY (one space, no newline).',
        },
        { text: 'If it does not show it yet, use Claude Code for the paid loop today.' },
      ],
    },
  },
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    kind: 'chat',
    free: {
      intro: 'Plus, Pro, Business, Enterprise and Education plans, on the web.',
      steps: [
        { text: 'Settings, then Security and login, then turn Developer mode on.' },
        { text: `Open Plugins, press +, and enter a name and the URL ${MCP_ENDPOINT}. Set Authentication to No Authentication.` },
        { text: 'Ask ChatGPT for a morning brief.' },
      ],
    },
    pro: {
      status: 'not-yet',
      intro: 'ChatGPT cannot send our key. The paid tools need OAuth on our side.',
      steps: [
        { text: 'OAuth sign-in for ChatGPT is next on our roadmap. Until then the paid loop runs in Claude Code, Codex, Cursor, or Gemini CLI.' },
      ],
    },
  },
  {
    id: 'grok',
    label: 'Grok',
    kind: 'chat',
    free: {
      intro: 'grok.com connectors. The server must be public, and ours is.',
      steps: [
        { text: 'Open grok.com/connectors, press New Connector, then Custom.' },
        { text: `Paste ${MCP_ENDPOINT} and finish. Ask Grok for a morning brief.` },
      ],
    },
    pro: {
      status: 'unverified',
      intro: 'Grok reads the free tier today.',
      steps: [
        { text: 'The grok.com connector dialog does not document a key or header field, so we have not confirmed that it can send one. The Grok Build CLI (paid) supports --header. Until we confirm the web dialog, Grok gets the free tier.' },
      ],
    },
  },
];

export const PRO_STATUS_LABEL: Record<ProStatus, string> = {
  full: 'Full paid loop today',
  beta: 'Pro in limited rollout',
  'not-yet': 'Free tier today',
  unverified: 'Free tier today',
};
