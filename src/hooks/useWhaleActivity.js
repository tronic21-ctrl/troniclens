// useWhaleActivity.js
import { useState, useEffect } from 'react'

const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/1749265/tronic-staking/v0.0.2'
const WHALE_THRESHOLD = 0.1

const WHALE_QUERY = `
  {
    stakeds(first: 20, orderBy: blockNumber, orderDirection: desc) {
      id
      user
      amount
      blockNumber
    }
    unstakeds(first: 20, orderBy: blockNumber, orderDirection: desc) {
      id
      user
      amount
      reward
      blockNumber
    }
  }
`

export function useWhaleActivity() {
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState(null)
  const [chainlinkPrice, setChainlinkPrice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Fetch Chainlink dulu supaya ethPrice tersedia
        let ethPrice = null
        try {
          const alchemyRes = await fetch(
            `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method: 'eth_call',
                params: [{
                  to: '0x694AA1769357215DE4FAC081bf1f309aDC325306',
                  data: '0x50d25bcd',
                }, 'latest'],
              }),
            }
          )
          const alchemyData = await alchemyRes.json()
          if (alchemyData.result) {
            ethPrice = parseInt(alchemyData.result, 16) / 1e8
          }
        } catch {
          console.warn('Chainlink fetch failed')
        }

        // 2. Fetch dari The Graph
        const graphRes = await fetch(GRAPH_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: WHALE_QUERY }),
        })
        const graphData = await graphRes.json()
        if (graphData.errors) throw new Error(graphData.errors[0].message)

        const { stakeds, unstakeds } = graphData.data

        // 3. Gabung & sort
        const combined = [
          ...stakeds.map(tx => ({
            id: tx.id,
            wallet: tx.user,
            address: tx.user,                              // fix: Dashboard pakai tx.address
            action: 'STAKE',
            amountEth: parseFloat(tx.amount) / 1e18,
            amount: (parseFloat(tx.amount) / 1e18).toFixed(4), // fix: Dashboard pakai tx.amount
            amountUSD: ethPrice
              ? (parseFloat(tx.amount) / 1e18 * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00',                                    // fix: Dashboard pakai tx.amountUSD
            blockNumber: parseInt(tx.blockNumber),
            timestamp: parseInt(tx.blockNumber),           // fix: formatTime pakai tx.timestamp
          })),
          ...unstakeds.map(tx => ({
            id: tx.id,
            wallet: tx.user,
            address: tx.user,
            action: 'UNSTAKE',
            amountEth: parseFloat(tx.amount) / 1e18,
            amount: (parseFloat(tx.amount) / 1e18).toFixed(4),
            amountUSD: ethPrice
              ? (parseFloat(tx.amount) / 1e18 * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00',
            blockNumber: parseInt(tx.blockNumber),
            timestamp: parseInt(tx.blockNumber),
          })),
        ].sort((a, b) => b.blockNumber - a.blockNumber)

        // 4. Filter whale
        const whaleOnly = combined.filter(tx => tx.amountEth >= WHALE_THRESHOLD)

        // 5. Hitung stats
        const totalStakedEth = stakeds.reduce((sum, tx) => sum + parseFloat(tx.amount) / 1e18, 0)
        const uniqueStakers = new Set([...stakeds.map(tx => tx.user), ...unstakeds.map(tx => tx.user)])
        const whaleWallets = new Set(whaleOnly.map(tx => tx.wallet))
        const avgStake = uniqueStakers.size > 0 ? totalStakedEth / uniqueStakers.size : 0

        const realStats = {
          totalStaked: totalStakedEth.toFixed(4),
          totalStakedUSD: ethPrice
            ? (totalStakedEth * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '0.00',
          activeStakers: uniqueStakers.size,
          whaleCount: whaleWallets.size,
          avgStakeSize: avgStake.toFixed(2),
          ethPrice: ethPrice ? ethPrice.toFixed(2) : null,
          retailStakers: Math.max(0, uniqueStakers.size - whaleWallets.size),
        }

        const chainlinkObj = ethPrice ? {
          price: ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          pair: 'ETH / USD',
          updatedAt: new Date().toLocaleString('id-ID', {
            day: '2-digit', month: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
        } : null

        setActivities(whaleOnly.length > 0 ? whaleOnly : combined)
        setStats(realStats)
        setChainlinkPrice(chainlinkObj)
        setError(null)

      } catch (err) {
        setError('Failed to fetch from The Graph: ' + err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (blockNumber) => {
  // Sepolia ~12 detik per block, current block sekitar 10.85 juta
  const CURRENT_SEPOLIA_BLOCK = 10850000
  const blockDiff = Math.max(0, CURRENT_SEPOLIA_BLOCK - blockNumber)
  const seconds = blockDiff * 12
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

  const formatAddress = (address) => {
    if (!address) return '0x????...????'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return {
    activities,
    stats,
    chainlinkPrice,
    loading,
    error,
    formatTime,
    formatAddress,
    WHALE_THRESHOLD,
  }
}