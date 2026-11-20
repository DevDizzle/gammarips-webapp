# GammaRips MCP — Autonomous Agent Setup Instructions (`install.md`)

> **Instructions for the AI Agent reading this file:**
> Your user wants you to connect the **GammaRips MCP Server** so you can query the nightly Combo A US options dataset (`get_pool`), 10-minute intraday liquidity snapshots (`get_liquidity`), 3-day MFE/MAE outcome surfaces (`query_outcomes`), contract price replay (`replay_contract`), volatility regime context (`get_regime_context`), daily macro reports (`get_daily_report`), and methodology playbooks (`get_playbook`).
>
> **Do not ask the user to run complex terminal commands if you have tool access to configure this yourself.** Follow the steps below for your specific runtime environment, verify the connection, and run the initial check.

---

## 1. Choose the Endpoint & Credential

- **If the user gave you an API key starting with `gr_live_`**:
  - **Endpoint**: `https://mcp.gammarips.com/mcp`
  - **Transport**: Streamable HTTP (`http`)
  - **Header**: `Authorization: Bearer <USER_GR_LIVE_KEY>`
- **If the user is on a Pro subscription without an API key (OAuth 2.1 sign-in)**:
  - **Endpoint**: `https://mcp.gammarips.com/pro`
  - **Transport**: Streamable HTTP (`http`) — triggers browser OAuth 2.1 sign-in on `gammarips.com`.
- **If the user is testing the Free 3-contract preview (no account, no key)**:
  - **Endpoint**: `https://mcp.gammarips.com/mcp`
  - **Transport**: Streamable HTTP (`http`) — no headers required.

---

## 2. Automatic Configuration by Client

### A. Claude Code (`claude` CLI)
If you have bash/terminal tool access, run one of these commands directly:

- **With a `gr_live_` API key**:
  ```bash
  claude mcp remove gammarips 2>/dev/null || true
  claude mcp add --transport http gammarips https://mcp.gammarips.com/mcp --header "Authorization: Bearer <USER_GR_LIVE_KEY>"
  ```
- **With OAuth 2.1 (Pro account sign-in, no key needed)**:
  ```bash
  claude mcp remove gammarips 2>/dev/null || true
  claude mcp add --transport http gammarips https://mcp.gammarips.com/pro
  ```
- **Free 3-contract preview**:
  ```bash
  claude mcp add --transport http gammarips https://mcp.gammarips.com/mcp
  ```

### B. Cursor (`~/.cursor/mcp.json` or `.cursor/mcp.json`)
Merge the `"gammarips"` server entry into `~/.cursor/mcp.json` (or `.cursor/mcp.json` in the workspace root):

- **With a `gr_live_` API key**:
  ```json
  {
    "mcpServers": {
      "gammarips": {
        "url": "https://mcp.gammarips.com/mcp",
        "headers": {
          "Authorization": "Bearer <USER_GR_LIVE_KEY>"
        }
      }
    }
  }
  ```
- **With OAuth 2.1 (no key)**:
  ```json
  {
    "mcpServers": {
      "gammarips": {
        "url": "https://mcp.gammarips.com/pro"
      }
    }
  }
  ```

### C. OpenAI Codex CLI (`~/.codex/config.toml`)
Append the server block to `~/.codex/config.toml`:

- **With OAuth 2.1**:
  ```toml
  [mcp_servers.gammarips]
  url = "https://mcp.gammarips.com/pro"
  ```
  Then run `codex mcp login gammarips`.
- **With a `gr_live_` API key**:
  Export `GAMMARIPS_MCP_KEY="<USER_GR_LIVE_KEY>"` in `~/.bashrc` or `~/.zshrc` and add:
  ```toml
  [mcp_servers.gammarips]
  url = "https://mcp.gammarips.com/mcp"
  bearer_token_env_var = "GAMMARIPS_MCP_KEY"
  ```

### D. Gemini CLI / Antigravity (`~/.gemini/settings.json` or `~/.gemini/config/mcp_config.json`)
Merge the `"gammarips"` server entry:
```json
{
  "mcpServers": {
    "gammarips": {
      "httpUrl": "https://mcp.gammarips.com/mcp",
      "url": "https://mcp.gammarips.com/mcp",
      "headers": {
        "Authorization": "Bearer <USER_GR_LIVE_KEY>"
      }
    }
  }
}
```

### E. Claude Desktop / Claude.ai Web / ChatGPT (No Terminal Needed)
If you are running inside Claude Web, Claude Desktop, or ChatGPT without local file access, guide the user in 3 clicks:
1. Open **Settings / Customize → Connectors → Add custom connector**.
2. Paste `https://mcp.gammarips.com/pro` as the Server URL.
3. Click **Sign in** and approve access with their GammaRips account.

---

## 3. First Verification Query (Run After Connecting)

Once the MCP server is connected:
1. Call `get_market_calendar_status(view="freshness")` and `get_regime_context()` to check market status and VIX/VIX3M term structure.
2. Call `get_pool(view="enriched")` (or `get_pool(view="preview")` on the free tier) to pull the latest Combo A options candidates (`Mid >= $1.00`, `OI >= 500`, `Delta 0.22–0.48`, `DTE 10–45`, enriched with `rv_iv_ratio`, technicals, and grounded catalysts).
3. Summarize the top 3 contracts by `rv_iv_ratio` (`>= 0.85`), check `get_liquidity` for 10-minute intraday open interest and volume if the market is open, and use `query_outcomes(view="harvest")` to show historical 3-day MFE/MAE excursion probabilities.
