PROJECT NAME
TronicLens

TAGLINE
On-chain intelligence for stakers who refuse to fly blind.

DESCRIPTION
Most DeFi stakers operate blind — they stake ETH and hope for the best, with no visibility into whale movements, protocol health, or market sentiment. TronicLens changes that.
TronicLens is a DeFi Staking Intelligence Cockpit that gives stakers a real-time, data-driven view of everything happening on-chain. Built like an aviation cockpit — every instrument serves a purpose, every data point is actionable.
The dashboard provides real-time whale activity detection via The Graph, live ETH/USD price feeds via Chainlink, decentralized AI-powered protocol analysis via 0G Compute (Qwen2.5, TEE verified), permanent verifiable data archiving via 0G Storage, and smart alerts that combine all three data sources into a single actionable feed.
TronicLens is built by an economics graduate who understands that protocol design is fundamentally an economics problem — and that stakers deserve the same analytical tools that institutional traders take for granted.

HOW IT'S MADE
TronicLens is built with React + Vite on the frontend, with a custom Solidity staking contract (OpenZeppelin v5.6.1, ReentrancyGuard, NatSpec, 16/16 Foundry tests passing) deployed on Ethereum Sepolia.
The Graph — A custom subgraph (tronic-staking v0.0.2, 100% synced) indexes all staking events on-chain. Used across every page of the dashboard for real-time whale activity detection, transaction history, and TVL calculations.
Chainlink — Live ETH/USD price feed from Sepolia oracle, integrated directly into the dashboard for TVL-in-USD conversion, staking stats, and the Smart Alerts price trigger system.
0G Storage — Periodic whale activity snapshots are uploaded as JSON to 0G Storage (Galileo Testnet) via a Node.js script. Each snapshot produces a root hash that is stored and displayed in the dashboard with a clickable link to StorageScan — creating a permanent, verifiable audit trail.
0G Compute — AI protocol analysis is run via Qwen2.5-7b-instruct on 0G Compute (TEE verified). The AI generates a Protocol Health Score (0–100), Market Sentiment (Bullish/Neutral/Bearish), and per-alert commentary for Smart Alerts. Results are stored back to 0G Storage for full verifiability. A Vercel serverless function (api/ai-commentary.js) handles CORS and secure API key management in production.
The combination of 0G Storage + 0G Compute creates a unique loop: AI analyzes on-chain data, results are stored on-chain, and the dashboard surfaces everything in real-time — fully decentralized intelligence pipeline.

SPONSOR TRACKS (to be confirmed when prize details released)
SponsorIntegration0G Network0G Storage snapshots + 0G Compute AI Insights (TEE verified) + Smart Alerts AI proxyThe GraphNative subgraph tronic-staking v0.0.2, 100% synced, used across all 6 pagesChainlinkLive ETH/USD price feed, Sepolia oracle, integrated into Overview + Stats + Alerts

LINKS

Live: troniclens.vercel.app
GitHub: github.com/tronic21-ctrl/troniclens
Subgraph: tronic-staking v0.0.2
Builder: Riko Tronic — Economics Graduate · Web3 Developer · Indonesia