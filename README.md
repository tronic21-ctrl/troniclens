# TronicLens 

> **On-chain intelligence for stakers who refuse to fly blind**

TronicLens is a DeFi Staking Intelligence Cockpit built for **ETHOnline 2026**. It provides real-time whale activity detection, live price feeds, smart alerts, decentralized AI insights, and verifiable data archiving for ETH stakers on Sepolia.

---

## Live Demo

> **Status:** BETA Live — Sepolia PoC — Mainnet coming soon

| Resource | Link |
|----------|------|
| **Live App** | [troniclens.vercel.app](https://troniclens.vercel.app) |
| GitHub | [tronic21-ctrl/troniclens](https://github.com/tronic21-ctrl/troniclens) |
| Subgraph | [tronic-staking v0.0.3](https://api.studio.thegraph.com/query/1749265/tronic-staking/version/latest) |
| StorageScan | [0G Galileo Testnet](https://storagescan-galileo.0g.ai) |
| StakingContract | [0x89907e8F...06926](https://eth-sepolia.blockscout.com/address/0x89907e8F6CB6468b2c8fe2d3814249881eF06926) |

---

## Screenshots

### Overview — Real-time Staking Intelligence
![Overview](public/screenshots/overview.png)

### AI Insights — 0G Compute TEE Verified
![AI Insights](public/screenshots/ai-insights.png)

### Governance — On-chain Proposal Lifecycle
![Governance](public/screenshots/governance.png)

---

## Aviation Analogy — The Cockpit Stack

TronicLens is built like a cockpit — every instrument serves a purpose:

| Instrument | Tech | Purpose |
|-----------|------|---------|
| Radar — Live Activity | **The Graph** | Index & query on-chain staking events |
| Altimeter — Price Feed | **Chainlink** | Real-time ETH/USD price from Sepolia oracle |
| Alert System | **Chainlink + The Graph** | Smart alerts for whale movements + ETH price |
| Black Box — Archive | **0G Storage** | Permanent decentralized snapshot of whale activity |
| AI Co-Pilot | **0G Compute** | Qwen2.5 AI analysis — TEE verified |
| Cockpit — Dashboard | **React + Vite** | Clean, real-time UI for stakers |

---

## Features

### Overview
- Real-time stat cards: Total Staked, Active Stakers, Whale Wallets, Avg Stake Size
- Chainlink ETH/USD price feed (live from Sepolia)
- ETH price chart with line, candlestick, and TVL overlay (CoinGecko + DeFiLlama)
- Whale Activity Feed powered by The Graph

### Staking Activity
- **Whale Alert Feed** — transactions ≥ threshold ETH, powered by The Graph
- **All Transactions** — complete staking history, wallet addresses clickable → Blockscout

### Staking Stats
- Protocol Metrics panel — terminal-style data grid (TVL, Active Stakers, Whale Wallets, Avg Stake, ETH Price, Retail Stakers)
- Total Value Locked (TVL) with USD conversion via Chainlink
- Staker distribution: Whale vs Retail breakdown with animated progress bars
- ETH price via Chainlink feed

### Protocol Health
- Real-time status of all integrations:
  - StakingContract (Sepolia, verified)
  - GovernanceContract (Sepolia, timelock 120s)
  - StakingGovernance bridge (Sepolia, verified)
  - ReentrancyGuard (OpenZeppelin v5.6.1)
  - The Graph Subgraph (tronic-staking v0.0.3, 100% synced)
  - Chainlink Feed (ETH/USD, 8 decimals, Live)
  - 0G Storage (last snapshot with clickable root hash → StorageScan)

### AI Insights
- Protocol Health Score (0–100) via Qwen2.5 on 0G Compute
- Market Sentiment analysis (Bullish / Neutral / Bearish)
- AI results stored on-chain via 0G Storage — TEE verified
- Full analysis history with clickable root hashes → StorageScan

### Smart Alerts
- **ETH Price Alert** — live ETH/USD from Chainlink feed with timestamp
- **Whale Activity Alerts** — transactions ≥ configurable threshold from The Graph
- **0G AI Commentary** — per-alert AI insight via 0G Compute (Qwen2.5-omni-7b)
- Alert Summary panel: Total Alerts, Whale Alerts, ETH Price, Threshold
- Left-border accent per alert card — color-coded by type (price/stake/unstake)
- No auto-refresh — stable UI so AI commentary is readable without interruption
- Powered by Vercel serverless proxy (`api/ai-commentary.js`) for secure 0G Compute calls

### Governance *(New in v1.3)*
- **On-chain Governance** — create proposals, vote (Yes/No/Abstain), execute via timelock
- **Eligibility Check** — auto-detect voting power based on stake amount
- **Real-time Countdown** — live timer for voting period and timelock delay
- **Wallet Connect** — Reown AppKit integration (MetaMask, Rabby, WalletConnect, etc.)
- **Proposal History** — full proposal list with status badge (Active/Succeeded/Defeated/Executed)
- Minimum stake: 0.001 ETH · Voting period: 5 min · Timelock: 120s (testnet optimized)

### Staking *(New in v1.4)*
- **Stake ETH** — deposit ETH directly into StakingContract via UI
- **Unstake & Claim Rewards** — withdraw principal + accrued rewards in one transaction
- **Real-time position tracking** — Your Stake, Accrued Reward, Stake Duration, Min. Stake
- **Contract Reserve Monitor** — live contract balance + sustainability estimator
- **Governance eligibility banner** — auto-detect if user is eligible to vote
- **Connect Wallet prompt** — clean onboarding for new wallets
- Minimum stake: 0.001 ETH · Reward rate: 500 wei/second · Sepolia Testnet

### Settings
- **Theme Toggle** — switch dark/light mode, persists via localStorage
- **Auto Refresh** toggle — live data from The Graph
- **Refresh Interval** selector — 15s / 30s / 60s
- **Whale Threshold** filter — 0.05 / 0.1 / 0.5 ETH
- **Compact Mode** — denser layout, real-time without reload
- **Manual Refresh** — force fetch from The Graph instantly
- **Reset to Default** — restore all settings with confirm step
- All settings persist via `localStorage`, sync globally via React Context

---

## What's New

### v1.6 — June 2026
- **Dual Theme System** — dark/light toggle via Settings > Appearance, persists to localStorage
- **useThemeColors() hook** — reactive color system, all components switch theme instantly
- **DARK_COLORS + LIGHT_COLORS palettes** — complete dual palette in colors.js with accent color adjustments for light mode
- **White logo fix** — filter: invert() applied to all white logos (0G, The Graph, Chainlink, ETHGlobal) in light mode
- **CandlestickChart ResizeObserver** — more reliable chart initialization, no longer stuck on first render
- **Chart stale data fix** — clear state before fetching on timeframe switch
- **Sidebar live indicator redesign** — removed top/bottom borders, cleaner typography
- **Badge consistency** — all badges use borderRadius: 50px (pill style)
- **Version bump** — v1.6.0

### v1.5 — June 2026
- **ETH/USD Price Chart fullscreen mode** — expand chart to fullscreen, mobile-friendly with landscape support
- **Candlestick toggle di fullscreen** — line/candle switch tersedia di fullscreen mode
- **Rate limit handling** — countdown timer + auto-retry saat CoinGecko rate limit tercapai (`globalRetryTimer` tidak reset saat ganti timeframe)
- **Skeleton loading** — Overview dan Staking Stats punya skeleton animation saat loading pertama
- **COINGECKO badge** — pill badge konsisten menjelaskan sumber data chart
- **Dev Mode removed** — Simulate Whale button dihapus dari Staking Activity
- **WhaleTable redesign** — darker background feel tabel transaksi, tidak ada shimmer accent line
- **Staker Distribution** — header section dengan darker background konsisten
- **Version bump** — v1.5.0

### v1.4 — June 2026
- **Staking page** — full stake/unstake UI directly from dashboard (no need for Remix/Blockscout)
- **ETH Price Chart** — line chart, candlestick, and TVL overlay via CoinGecko + DeFiLlama
- **Protocol Metrics redesign** — terminal-style data grid replacing individual stat cards
- **Smart Alerts redesign** — Alert Summary panel, left-border accent cards, shark icon for whale alerts
- **Sidebar scroll fix** — all nav items accessible on small screens
- **LIVE · SEPOLIA badge** — merged into single pill
- **Subgraph v0.0.3** — redeployed and re-synced on The Graph Studio
- **AI Insights refresh** — updated to Qwen2.5-omni-7b, new snapshot (txSeq: 124758)
- **Custom scrollbar** — subtle cyan scrollbar on sidebar
- **Contract Reserve Monitor** — live contract balance + sustainability estimator
- **Governance eligibility integration** — cross-page eligibility banners
- **Onboarding popup** — 7-step stepper modal for new users

### v1.3 — June 2026
- Governance page — full on-chain proposal lifecycle (create → vote → execute)
- StakingGovernance bridge contract deployed and verified on Sepolia
- Reown AppKit wallet connect — custom branded button in topbar
- Ambient background animations per page (PageBackground component)
- Shimmer card animations consistent across all pages
- 0G Compute endpoint + API key updated
- AI commentary fully restored in Smart Alerts

### v1.2 — May 2026
- Fixed Simulate Whale button (correct stake() selector)
- Total Staked now shows current TVL (not historical)
- Health Score & Market Sentiment color indicators
- Clickable contract address → Blockscout
- Animated live pulse dots across all pages
- Flat badge design (reduced AI-generated feel)
- Mobile alert layout improvements
- 0G Storage upload fixed in ai-insights.mjs

### v1.1 — May 2026
- Smart Alerts page — ETH price + whale alerts with 0G AI commentary
- Vercel serverless proxy for 0G Compute CORS bypass

---

## Tech Stack

```
Frontend:       React + Vite + Framer Motion
State:          React Context (SettingsContext + useThemeColors hook)
Smart Contract: Solidity ^0.8.0 + OpenZeppelin v5.6.1
Indexing:       The Graph (subgraph: tronic-staking v0.0.3)
Price Feed:     Chainlink ETH/USD (Sepolia)
Price Chart:    CoinGecko API + DeFiLlama API (via Vercel serverless proxy)
Storage:        0G Storage (Galileo Testnet)
AI Compute:     0G Compute — Qwen2.5-omni-7b (TEE verified)
AI Proxy:       Vercel Serverless Function (api/ai-commentary.js)
RPC:            Alchemy (Sepolia)
Testing:        Foundry (107/107 tests pass, 98% coverage)
Deployment:     Vercel
Network:        Ethereum Sepolia Testnet
```

---

## Project Structure

```
troniclens/
├── api/
│   ├── ai-commentary.js       # Vercel serverless proxy — 0G Compute CORS bypass
│   ├── price-history.js       # Vercel serverless proxy — CoinGecko price + OHLC
│   └── tvl-history.js         # Vercel serverless proxy — DeFiLlama TVL history
├── public/
│   ├── favicon.svg
│   ├── logos/                 # Brand logos (ETHGlobal, Chainlink, 0G, The Graph, etc.)
│   └── og-snapshots.json      # 0G Storage snapshot history
├── src/
│   ├── abi/
│   │   ├── StakingContract.json
│   │   ├── GovernanceContract.json
│   │   └── StakingGovernance.json
│   ├── components/
│   │   ├── Sidebar.jsx        # Collapsible navigation with live indicator
│   │   └── ETHPriceChart.jsx  # ETH price chart — line/candlestick/TVL overlay
│   ├── context/
│   │   └── SettingsContext.jsx
│   ├── hooks/
│   │   └── useWhaleActivity.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Alerts.jsx
│   │   ├── Governance.jsx
│   │   └── StakeAction.jsx
│   └── utils/
│       └── colors.js          # DARK_COLORS + LIGHT_COLORS dual theme palettes
│       └── mockData.js
├── upload-snapshot.mjs
├── ai-insights.mjs
├── .env
└── vite.config.js
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- Alchemy API key (Sepolia)
- 0G Compute API key

### Install

```bash
git clone https://github.com/tronic21-ctrl/troniclens.git
cd troniclens
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_ALCHEMY_KEY=your_alchemy_api_key
ZG_COMPUTE_API_KEY=your_0g_compute_api_key   # For AI scripts + Vercel serverless
PRIVATE_KEY=your_wallet_private_key          # Only for upload scripts
```

> **Note:** `ZG_COMPUTE_API_KEY` must also be added to Vercel Environment Variables for the Smart Alerts AI proxy to work in production.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

---

## 0G Storage Snapshots

TronicLens archives whale activity snapshots to **0G Storage** for permanent, verifiable records.

### Upload a Snapshot

```bash
node upload-snapshot.mjs
```

### Generate AI Insights

```bash
node ai-insights.mjs
```

This will:
1. Fetch latest staking data from The Graph
2. Send to Qwen2.5-omni-7b via 0G Compute (TEE verified)
3. Store AI analysis result on 0G Storage
4. Dashboard displays Health Score, Sentiment, and full history

---

## Smart Contracts (Sepolia)

| Contract | Address | Status |
|----------|---------|--------|
| StakingContract | `0x89907e8F6CB6468b2c8fe2d3814249881eF06926` | [✅ Verified](https://eth-sepolia.blockscout.com/address/0x89907e8F6CB6468b2c8fe2d3814249881eF06926) |
| GovernanceContract | `0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8` | [✅ Verified](https://eth-sepolia.blockscout.com/address/0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8) |
| StakingGovernance | `0xa830b86ce9D994A3c5b95F124c9a008e74b75080` | [✅ Verified](https://eth-sepolia.blockscout.com/address/0xa830b86ce9D994A3c5b95F124c9a008e74b75080) |

**StakingContract features:**
- ETH native staking (no ERC-20)
- Linear reward calculation (rewardRatePerSecond)
- ReentrancyGuard protection (OpenZeppelin)
- NatSpec documentation
- Minimum stake period enforcement
- 107/107 Foundry tests passing (98% line coverage)

---

## 🏆 ETHOnline 2026

**Target Prizes:**

| Sponsor | Prize | Integration |
|---------|-------|-------------|
| **0G Network** | $15,000 | 0G Storage snapshots + 0G Compute AI Insights (TEE verified) + Smart Alerts AI proxy |
| **The Graph** | $15,000 | Native subgraph (tronic-staking v0.0.3, 100% synced) — used across all pages |
| **Chainlink** | TBD | Live ETH/USD price feed on Sepolia — Overview, Staking Stats, Smart Alerts |

**Project by:** Riko Tronic ([@tronic21-ctrl](https://github.com/tronic21-ctrl))  
*Economics Graduate · Web3 Developer · Indonesia*

---

## ⚠️ Known Limitations

- **Single staker testnet data** — all data sourced from the developer's own wallet on Sepolia. Mainnet deployment planned post-hackathon.
- **AI Insights manual refresh** — data is updated manually via `node ai-insights.mjs`, not yet auto-scheduled. Planned: cron job in v2.
- **0G Compute balance** — 0G Compute Testnet requires OG tokens. Top up via faucet if balance runs out.
- **Governance testnet only** — voting period (5 min) and timelock (120s) are optimized for testnet demo. Mainnet config will differ.
- **Flat reward rate** — StakingContract v1 uses a flat rate (not proportional to stake amount). v2 will implement proportional rewards + proxy pattern for upgradability.
- **Manual rate management** — `rewardRatePerSecond` must be adjusted manually by the owner if TVL changes significantly. Auto-adjustment is planned for v2.

---

## 📄 License

MIT
