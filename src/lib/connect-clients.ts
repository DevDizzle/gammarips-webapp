// Per-client connect facts for the homepage connect tabs.
//
// Single source for "how does <client> reach the GammaRips MCP, free and pro".
// Every line here was checked against the client's official docs on
// 2026-08-15 (engine repo: docs/GTM-CLIENT-CONNECT-MATRIX.md, with sources).
// Re-check before you change a step. Never invent a step. When a client cannot
// send our key, say so plainly: the honest line converts better than a blur.
import { MCP_ENDPOINT, MCP_PRO_ENDPOINT } from '@/lib/constants';

export type ClientId =
  | 'claude-code'
  | 'codex'
  | 'cursor'
  | 'gemini-cli'
  | 'claude'
  | 'chatgpt'
  | 'grok';

// full:  the client sends the Authorization header, all paid tools work today.
// oauth: the client cannot (or need not) send a header, so it signs in instead.
//        Our OAuth 2.1 server went live 2026-08-19 and /pro is the credentialed
//        endpoint. Verified end to end against production with a real MCP
//        client, INCLUDING Claude Code's client-metadata document. What is NOT
//        yet verified is each chat vendor's own connector dialog, so an 'oauth'
//        tab describes OUR side and never invents the client's UI steps.
//        Do not promote a client to 'full' on a header field we have not sent.
export type ProStatus = 'full' | 'oauth';

export type ConnectStep = { text: string; code?: string };

export type ConnectClient = {
  id: ClientId;
  label: string;
  kind: 'cli' | 'chat';
  free: { intro: string; steps: ConnectStep[] };
  pro: { status: ProStatus; intro: string; steps: ConnectStep[] };
};

const KEY = 'YOUR_API_KEY';

// The sign-in path. The steps that matter are OURS (add the /pro URL, approve
// the consent screen) and are identical everywhere, so the closing step is
// shared. The dialog steps are per client and come from each vendor's own
// docs, the same source the free-tier steps have always used.
//
// Our side is measured, not assumed: scripts/oauth/client-profiles.ts runs the
// full flow once per client shape against production (2026-08-22: 9/10, the
// only failure being the known 127.0.0.1 App Hosting residual, which no
// shipped chat client uses). Re-run it before changing anything here.
const signedIn: ConnectStep = {
  text:
    'Approve access with the account that carries your subscription. ' +
    'The paid tools appear, and the token refreshes itself from then on. Nothing to paste, and no key to leak.',
};

const oauthPro = (intro: string, steps: ConnectStep[]): ConnectClient['pro'] => ({
  status: 'oauth',
  intro,
  steps: [...steps, signedIn],
});

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
      intro: 'All paid tools, and the harness loop. Add the same server with your key.',
      steps: [
        {
          text: 'Mint your key on the account page after the trial starts. Paste it with no spaces and no newline.',
          code: `claude mcp add --transport http gammarips ${MCP_ENDPOINT} \\\n  --header "Authorization: Bearer ${KEY}"`,
        },
        {
          text: 'Or skip the key and sign in. Add the /pro endpoint, then run /mcp inside Claude Code and authenticate.',
          code: `claude mcp add --transport http gammarips ${MCP_PRO_ENDPOINT}`,
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
      intro: 'All paid tools. Codex reads the key from an environment variable.',
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
      intro: 'All paid tools. Cursor sends headers and reads the key from your shell.',
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
      intro: 'All paid tools. Add the same server with your key.',
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
      intro: 'claude.ai and Claude Desktop.',
      steps: [
        { text: 'Open Customize, then Connectors, then Add custom connector.' },
        { text: `Paste ${MCP_ENDPOINT} and add it.` },
        { text: 'Ask Claude for a morning brief. Free plans get one custom connector.' },
      ],
    },
    pro: oauthPro('No key to paste. Add the pro endpoint as a connector and sign in.', [
      { text: 'Open Customize, then Connectors, then Add custom connector.' },
      { text: 'Paste the pro URL and add it. Free plans get one custom connector, so use this in place of the free one.', code: MCP_PRO_ENDPOINT },
      { text: 'Claude reads the sign-in challenge and sends you to gammarips.com.' },
    ]),
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
    pro: oauthPro('No key to paste, which matters because ChatGPT cannot send one. Sign in instead.', [
      { text: 'Settings, then Security and login, then turn Developer mode on.' },
      { text: 'Open Plugins, press +, and enter a name and the pro URL.', code: MCP_PRO_ENDPOINT },
      { text: 'Set Authentication to OAuth. ChatGPT registers itself with us, so there is no client ID or secret to fill in.' },
    ]),
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
    pro: oauthPro('No key to paste. Add the pro endpoint and complete the sign-in.', [
      { text: 'Open grok.com/connectors, press New Connector, then Custom.' },
      { text: 'Paste the pro URL and finish.', code: MCP_PRO_ENDPOINT },
      { text: 'Grok does not document its auth field, so if the dialog never offers a sign-in, tell us and keep the free URL meanwhile. Our side is verified.' },
    ]),
  },
];

export const PRO_STATUS_LABEL: Record<ProStatus, string> = {
  full: 'All paid tools, with your key',
  oauth: 'All paid tools, sign in instead',
};
