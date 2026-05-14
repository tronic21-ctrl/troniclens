// mockData.js
// Mock data untuk TronicLens — akan diganti dengan data real dari The Graph

export const mockWhaleActivity = [
  {
    id: '0x1a2b...3c4d',
    address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
    action: 'STAKE',
    amount: '150.5',
    amountUSD: '348,909.75',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 menit lalu
    txHash: '0xabc123def456',
  },
  {
    id: '0x2b3c...4d5e',
    address: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    action: 'UNSTAKE',
    amount: '320.0',
    amountUSD: '741,440.00',
    timestamp: Date.now() - 1000 * 60 * 12, // 12 menit lalu
    txHash: '0xdef456abc789',
  },
  {
    id: '0x3c4d...5e6f',
    address: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
    action: 'STAKE',
    amount: '500.0',
    amountUSD: '1,158,500.00',
    timestamp: Date.now() - 1000 * 60 * 28, // 28 menit lalu
    txHash: '0x789abc123def',
  },
  {
    id: '0x4d5e...6f7a',
    address: '0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e',
    action: 'STAKE',
    amount: '88.25',
    amountUSD: '204,450.25',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 menit lalu
    txHash: '0x123def456abc',
  },
  {
    id: '0x5e6f...7a8b',
    address: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    action: 'UNSTAKE',
    amount: '210.75',
    amountUSD: '488,407.75',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 jam lalu
    txHash: '0x456abc789def',
  },
]

export const mockStats = {
  totalStaked: '12,450.75',
  totalStakedUSD: '28,860,487.25',
  activeStakers: 142,
  whaleCount: 18, // staker dengan > 100 ETH
  avgStakeSize: '87.68',
  ethPrice: '2,318.47',
}

export const mockChainlinkPrice = {
  pair: 'ETH / USD',
  price: '2,318.47',
  updatedAt: new Date().toLocaleString(),
  decimals: 8,
}

// Threshold untuk dikategorikan sebagai whale (dalam ETH)
export const WHALE_THRESHOLD = 100