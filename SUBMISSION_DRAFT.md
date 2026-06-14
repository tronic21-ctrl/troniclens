PROJECT NAME
TronicLens

TAGLINE
On-chain intelligence for stakers who refuse to fly blind.

DESCRIPTION
Most DeFi stakers operate blind — they stake ETH and hope for the best, with no visibility into whale movements, protocol health, or market sentiment. TronicLens changes that.

TronicLens is a DeFi Staking Intelligence Cockpit that gives stakers a real-time, data-driven view of everything happening on-chain. Built like an aviation cockpit — every instrument serves a purpose, every data point is actionable.

The dashboard provides:
- Real-time whale activity detection via The Graph
- Live ETH/USD price feeds + historical price chart via Chainlink + CoinGecko
- On-chain governance with weighted voting via custom GovernanceContract
- Stake/unstake ETH directly from the dashboard UI
- Reward Calculator with live rate fetch from contract
- Protocol Health Timeline — visual history of AI health scores over time
- Smart Alerts with severity classification, 24h price change, and AI global analysis
- Decentralized AI-powered protocol analysis via 0G Compute (Qwen2.5-omni-7b, TEE verified)
- Permanent verifiable data archiving via 0G Storage
- Dark/light theme with full UI consistency across all pages

TronicLens is built by an economics graduate who understands that protocol design is fundamentally an economics problem — and that stakers deserve the same analytical tools that institutional traders take for granted.

VISION
TronicLens v1 is an intelligence layer. But the long-term vision is deeper: a fully decentralized protocol economics engine.

Most DeFi protocols today are technically sound but economically naive — flat reward rates, static parameters, and no self-regulating mechanism. TronicLens is being designed from the ground up with economic first principles:

- v2: Proportional rewards (reward ∝ stake amount) + proxy upgradeable contracts
- v3: TVL-based dynamic rate adjustment — as TVL grows, rate decreases automatically to protect protocol reserves; as TVL shrinks, rate increases to attract new stakers. Self-regulating without any central authority.
- v4: Lock period tiers (flexible / 30d / 90d) + governance-controlled parameters — all rate adjustments require community vote via GovernanceContract. No developer can unilaterally change the economics.

The result: a mini decentralized central bank — monetary policy set by algorithm, governed by community, executed by smart contract. No regulators. No intermediaries. Just math and incentives.

This is what DeFi was always supposed to be.

HOW IT'S MADE
TronicLens is built with React + Vite + Framer Motion on the frontend, with three custom Solidity contracts (OpenZeppelin v5.6.1, ReentrancyGuard, NatSpec, 107/107 Foundry tests passing, 98% line coverage) deployed and verified on Ethereum Sepolia.

The Graph — A custom subgraph (tronic-staking v0.0.3, 100% synced) indexes all Staked and Unstaked events on-chain. Used across every page of the dashboard for real-time whale activity detection, complete transaction history, TVL calculations, and staker distribution analytics.

Chainlink — Live ETH/USD price feed from Sepolia oracle (0x694AA1769357215DE4FAC081bf1f309aDC325306), integrated directly into the dashboard for TVL-in-USD conversion, staking stats, and the Smart Alerts price trigger system. Combined with CoinGecko historical data for the ETH price chart (line, candlestick, volume, TVL overlay).

0G Storage — Periodic whale activity snapshots are uploaded as JSON to 0G Storage (Galileo Testnet) via a Node.js script. Each snapshot produces a root hash stored and displayed in the dashboard with a clickable link to StorageScan — creating a permanent, verifiable audit trail.

0G Compute — AI protocol analysis is run via Qwen2.5-omni-7b on 0G Compute (TEE verified via dstack TDX). The AI generates a Protocol Health Score (0–100), Market Sentiment (Bullish/Neutral/Bearish), risk level, and per-alert commentary for Smart Alerts. An "Analyze All Alerts" feature sends all active alerts simultaneously to 0G Compute for a comprehensive protocol-wide analysis. Results are stored back to 0G Storage for full verifiability. A Vercel serverless function (api/ai-commentary.js) handles CORS and secure API key management in production.

The combination of 0G Storage + 0G Compute creates a unique loop: AI analyzes on-chain data → results stored on-chain → dashboard surfaces everything in real-time. Fully decentralized intelligence pipeline.

Smart Contracts — Three contracts deployed and Blockscout-verified on Sepolia:
- StakingContract: ETH native staking, flat reward rate (500 wei/s, live-fetched from contract), ReentrancyGuard, 107/107 tests. Rate intentionally conservative — protocol sustainable for 633,000+ years at current reserves.
- GovernanceContract: Weighted voting by stake amount, 120s timelock, double-vote protection, quorum enforcement
- StakingGovernance: Bridge contract linking staking position to governance eligibility via setBridgeContract()

Wallet Connect — Reown AppKit integration supporting MetaMask, Rabby, WalletConnect, and other major wallets.

Economics Design Note — The current flat reward rate (500 wei/s) is a deliberate v1 design choice: predictable, sustainable, and exploitable for long-term protocol health. The rate is live-fetched from the contract — if governance votes to change it, the dashboard updates automatically. This is the foundation for the TVL-based dynamic rate model planned for v2.

SPONSOR TRACKS

| Sponsor | Integration |
|---------|-------------|
| 0G Network | 0G Storage snapshots (txSeq: 124758, Galileo Testnet) + 0G Compute AI Insights (Qwen2.5-omni-7b, TEE verified, dstack TDX) + Smart Alerts per-alert AI commentary + Analyze All Alerts global analysis via Vercel serverless proxy |
| The Graph | Native subgraph tronic-staking v0.0.3, 100% synced — used across all 8 pages for whale detection, transaction history, TVL, staker distribution, and Protocol Health Timeline data |
| Chainlink | Live ETH/USD price feed, Sepolia oracle, 8 decimals — integrated into Overview, Staking Stats, Smart Alerts (price alert + 24h change), Staking page reward calculator, and Protocol Health cards |

LINKS

Live App: https://troniclens.vercel.app
GitHub: https://github.com/tronic21-ctrl/troniclens
Subgraph: https://api.studio.thegraph.com/query/1749265/tronic-staking/version/latest
StorageScan: https://storagescan-galileo.0g.ai
StakingContract: https://eth-sepolia.blockscout.com/address/0x89907e8F6CB6468b2c8fe2d3814249881eF06926
GovernanceContract: https://eth-sepolia.blockscout.com/address/0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8
StakingGovernance: https://eth-sepolia.blockscout.com/address/0xa830b86ce9D994A3c5b95F124c9a008e74b75080

Builder: Riko Tronic — Economics Graduate · Web3 Developer · Indonesia
GitHub: @tronic21-ctrl | X: @RikoTronic

KNOWN LIMITATIONS
- Single staker testnet data — all data sourced from the developer's own wallet on Sepolia. Mainnet deployment planned post-hackathon.
- AI Insights manual refresh — updated manually via node ai-insights.mjs. Cron job automation planned for v2.
- Flat reward rate — not proportional to stake size. All stakers earn the same absolute reward (500 wei/s) regardless of stake amount. Proportional + dynamic rate planned for v2.
- Governance testnet parameters — voting period (5 min) and timelock (120s) optimized for testnet demo. Mainnet config will differ.
- 0G Compute balance — requires OG testnet tokens. Top up via faucet if balance runs out.
