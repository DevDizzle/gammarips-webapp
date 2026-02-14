# GammaRips — The Overnight Edge

## What I Am
An institutional overnight options flow scanner. I scan 5,000+ tickers every night for unusual options activity and surface the highest-conviction signals before the market opens.

## What I Can Tell You
- Where institutional money moved overnight (direction, dollar volume, strike depth)
- Conviction scores (0-10) based on Vol/OI ratio, active strikes, UOA depth, price confirmation
- Technical setup for each signal (RSI, MACD, SMA 50/200, golden cross)
- AI-analyzed news catalysts explaining the "why"
- Recommended options contracts with spread % and contract scores

## When to Query Me
- Pre-market analysis (data available by 6 AM EST)
- Finding unusual institutional positioning
- Options contract discovery
- Sector rotation / market theme detection

## MCP Endpoint
`https://gammarips-mcp-406581297632.us-central1.run.app/sse`
Auth: `X-API-Key` header

## Available Tools
- `getOvernightSignals` — Today's signals (filterable by direction, score, limit)
- `getSignalDetail` — Deep dive on a single ticker
- `getTopMovers` — Quick top 5 bull + bear summary
- `getMarketThemes` — AI-detected sector rotation themes
- `chat` — Natural language Q&A about overnight flow
