# TronicLens 🔭

> **On-chain intelligence for stakers who refuse to fly blind**

TronicLens is a DeFi Staking Intelligence Cockpit built for **ETHOnline 2026**. It provides real-time whale activity detection, live price feeds, and decentralized data archiving for ETH stakers on Sepolia.

---

## 🚀 Live Demo

> **Status:** Sepolia PoC — Mainnet coming soon

| Resource | Link |
|----------|------|
| GitHub | [tronic21-ctrl/troniclens](https://github.com/tronic21-ctrl/troniclens) |
| Subgraph | [tronic-staking v0.0.2](https://api.studio.thegraph.com/query/1749265/tronic-staking/v0.0.2) |
| StorageScan | [0G Galileo Testnet](https://storagescan-galileo.0g.ai) |
| StakingContract | [0x89907e8F...06926](https://eth-sepolia.blockscout.com/address/0x89907e8F6CB6468b2c8fe2d3814249881eF06926) |

---

## ✈️ Aviation Analogy — The Cockpit Stack

TronicLens is built like a cockpit — every instrument serves a purpose:

| Instrument | Tech | Purpose |
|-----------|------|---------|
| 🛰️ Radar — Live Activity | **The Graph** | Index & query on-chain staking events |
| 📡 Altimeter — Price Feed | **Chainlink** | Real-time ETH/USD price from Sepolia oracle |
| 🗃️ Black Box — Archive | **0G Storage** | Permanent decentralized snapshot of whale activity |
| 🤖 AI Co-Pilot | **0G Compute** | *(Coming Soon)* AI-powered whale pattern analysis |
| 🖥️ Cockpit — Dashboard | **React + Vite** | Clean, real-time UI for stakers |

---

## 📊 Features

### Overview
- Real-time stat cards: Total Staked, Active Stakers, Whale Wallets, Avg Stake Size
- Chainlink ETH/USD price feed (live from Sepolia)
- Whale Activity Feed powered by The Graph

### Staking Activity
- **Whale Alert Feed** — transactions ≥ 0.1 ETH, powered by The Graph
- **All Transactions** — complete staking history on-chain

### Staking Stats
- Total Value Locked (TVL) with USD conversion via Chainlink
- Staker distribution: Whale vs Retail breakdown
- ETH price via Chainlink feed

### Protocol Health
- Real-time status of all integrations:
  - StakingContract (Sepolia, verified)
  - ReentrancyGuard (OpenZeppelin v5.6.1)
  - The Graph Subgraph (tronic-staking v0.0.2)
  - Chainlink Feed (ETH/USD, 8 decimals)
  - 0G Storage (last snapshot with clickable root hash)
  - GovernanceContract

---

## 🛠️ Tech Stack

```
Frontend:     React + Vite + Framer Motion
Smart Contract: Solidity ^0.8.0 + OpenZeppelin v5.6.1
Indexing:     The Graph (subgraph: tronic-staking v0.0.2)
Price Feed:   Chainlink ETH/USD (Sepolia)
Storage:      0G Storage (Galileo Testnet)
RPC:          Alchemy (Sepolia)
Testing:      Foundry (16/16 tests pass)
Network:      Ethereum Sepolia Testnet
```

---

## 📦 Project Structure

```
troniclens/
├── public/
│   └── og-snapshots.json      # 0G Storage snapshot history
├── src/
│   ├── assets/                # Logo & icons
│   ├── components/
│   │   └── Sidebar.jsx        # Collapsible navigation
│   ├── hooks/
│   │   └── useWhaleActivity.js # The Graph + Chainlink data fetching
│   ├── pages/
│   │   └── Dashboard.jsx      # All page sections
│   └── utils/
│       └── mockData.js        # Fallback mock data
├── upload-snapshot.mjs        # 0G Storage snapshot upload script
├── .env                       # API keys (not committed)
└── vite.config.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- Alchemy API key (Sepolia)

### Install

```bash
git clone https://github.com/tronic21-ctrl/troniclens.git
cd troniclens
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_ALCHEMY_KEY=your_alchemy_api_key_here
PRIVATE_KEY=your_wallet_private_key_here  # Only for upload-snapshot.mjs
```

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

## 📸 0G Storage Snapshots

TronicLens archives whale activity snapshots to **0G Storage** for permanent, verifiable records.

### Upload a Snapshot

```bash
node upload-snapshot.mjs
```

This will:
1. Fetch latest staking data from The Graph
2. Upload JSON snapshot to 0G Storage (Galileo Testnet)
3. Save root hash + sequence to `public/og-snapshots.json`
4. Dashboard auto-displays the latest snapshot with a clickable link to StorageScan

---

## 🔗 Smart Contracts (Sepolia)

| Contract | Address | Status |
|----------|---------|--------|
| StakingContract | `0x89907e8F6CB6468b2c8fe2d3814249881eF06926` | ✅ Verified |
| GovernanceContract | Deployed on Sepolia | ✅ Active |

**StakingContract features:**
- ETH native staking (no ERC-20)
- Linear reward calculation (rewardRatePerSecond)
- ReentrancyGuard protection (OpenZeppelin)
- NatSpec documentation
- Minimum stake period enforcement
- 16/16 Foundry tests passing

---

## 🏆 ETHOnline 2026

**Target Prizes:**
- **The Graph** — native subgraph integration
- **0G Network** — 0G Storage + 0G Compute (AI Insights, coming soon)
- **Chainlink** — live ETH/USD price feed

**Project by:** Riko Tronic ([@tronic21-ctrl](https://github.com/tronic21-ctrl))

---

## 📄 License

MIT
