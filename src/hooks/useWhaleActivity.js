// useWhaleActivity.js
import { useState, useEffect, useRef } from 'react'

const GRAPH_ENDPOINT = 'https://api.studio.thegraph.com/query/1749265/tronic-staking/version/latest'

const WHALE_QUERY = `
  {
    stakeds(first: 20, orderBy: blockNumber, orderDirection: desc) {
      id
      user
      amount
      blockNumber
      blockTimestamp
    }
    unstakeds(first: 20, orderBy: blockNumber, orderDirection: desc) {
      id
      user
      amount
      reward
      blockNumber
      blockTimestamp
    }
  }
`

export function useWhaleActivity({
  refreshInterval = 30000, // ms — null = auto-refresh OFF
  whaleThreshold = 0.1,    // ETH
} = {}) {
  const [activities, setActivities] = useState([])
  const [allActivities, setAllActivities] = useState([])
  const [stats, setStats] = useState(null)
  const [chainlinkPrice, setChainlinkPrice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const currentBlockRef = useRef(10850000)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // 1. Fetch Chainlink price
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

        // 2. Fetch latest block number
        let latestBlock = 10850000
        try {
          const blockRes = await fetch(
            `https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0', id: 2,
                method: 'eth_blockNumber',
                params: [],
              }),
            }
          )
          const blockData = await blockRes.json()
          if (blockData.result) {
            latestBlock = parseInt(blockData.result, 16)
          }
        } catch {
          console.warn('Block number fetch failed')
        }

        // 3. Fetch dari The Graph
        const graphRes = await fetch(GRAPH_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: WHALE_QUERY }),
        })
        const graphData = await graphRes.json()
        if (graphData.errors) throw new Error(graphData.errors[0].message)

        const { stakeds, unstakeds } = graphData.data

        // 4. Gabung & sort
        const combined = [
          ...stakeds.map(tx => ({
            id: tx.id,
            wallet: tx.user,
            address: tx.user,
            action: 'STAKE',
            amountEth: parseFloat(tx.amount) / 1e18,
            amount: (parseFloat(tx.amount) / 1e18).toFixed(4),
            amountUSD: ethPrice
              ? (parseFloat(tx.amount) / 1e18 * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : '0.00',
            blockNumber: parseInt(tx.blockNumber),
            timestamp: parseInt(tx.blockTimestamp),
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
            timestamp: parseInt(tx.blockTimestamp),
          })),
        ].sort((a, b) => b.blockNumber - a.blockNumber)

        // 5. Filter whale pakai threshold dari settings
        const whaleOnly = combined.filter(tx => tx.amountEth >= whaleThreshold)

        // 6. Hitung stats — whaleCount juga pakai threshold dari settings
        // Current TVL — stake dikurangi unstake
        const totalStakedEth = stakeds.reduce((sum, tx) => sum + parseFloat(tx.amount) / 1e18, 0)
        const totalUnstakedEth = unstakeds.reduce((sum, tx) => sum + parseFloat(tx.amount) / 1e18, 0)
        const currentTVL = Math.max(0, totalStakedEth - totalUnstakedEth)

        // Active stakers — wallet yang punya net stake > 0
        const stakerNet = {}
        stakeds.forEach(tx => {
          stakerNet[tx.user] = (stakerNet[tx.user] || 0) + parseFloat(tx.amount) / 1e18
        })
        unstakeds.forEach(tx => {
          stakerNet[tx.user] = (stakerNet[tx.user] || 0) - parseFloat(tx.amount) / 1e18
        })
        const activeStakerSet = new Set(Object.keys(stakerNet).filter(addr => stakerNet[addr] > 0))
        const uniqueStakers = new Set([...stakeds.map(tx => tx.user), ...unstakeds.map(tx => tx.user)])
        const whaleWallets = new Set(whaleOnly.map(tx => tx.wallet))
        const avgStake = activeStakerSet.size > 0 ? currentTVL / activeStakerSet.size : 0

        const realStats = {
          totalStaked: currentTVL.toFixed(4),
          totalStakedUSD: ethPrice
            ? (currentTVL * ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '0.00',
          activeStakers: activeStakerSet.size,
          whaleCount: whaleWallets.size,
          avgStakeSize: avgStake.toFixed(2),
          ethPrice: ethPrice ? ethPrice.toFixed(2) : null,
          retailStakers: Math.max(0, uniqueStakers.size - whaleWallets.size),
        }

        const chainlinkObj = ethPrice ? {
          price: ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          pair: 'ETH / USD',
          updatedAt: new Date().toLocaleString('en-GB', {
          day: '2-digit', month: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
          timeZone: 'UTC',
          timeZoneName: 'short',
        }),
        } : null

        setActivities(whaleOnly)
        setAllActivities(combined)
        setStats(realStats)
        setChainlinkPrice(chainlinkObj)
        setError(null)
        currentBlockRef.current = latestBlock

      } catch (err) {
        setError('Failed to fetch from The Graph: ' + err.message)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    // Fetch pertama kali
    fetchData()

    // Listen manual refresh event dari Settings
    const handleManualRefresh = () => fetchData()
    window.addEventListener('troniclens:refresh', handleManualRefresh)

    // Auto-refresh — kalau null berarti OFF
    let interval = null
    if (refreshInterval !== null) {
      interval = setInterval(fetchData, refreshInterval)
    }

    return () => {
      window.removeEventListener('troniclens:refresh', handleManualRefresh)
      if (interval) clearInterval(interval)
    }
  }, [refreshInterval, whaleThreshold]) // re-run kalau settings berubah

  const formatTime = (timestamp) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = Math.max(0, now - timestamp)
    const minutes = Math.floor(diff / 60)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return `${Math.floor(days / 7)}w ago`
  }

  const formatAddress = (address) => {
    if (!address) return '0x????...????'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return {
    activities,
    allActivities,
    stats,
    chainlinkPrice,
    loading,
    error,
    formatTime,
    formatAddress,
    WHALE_THRESHOLD: whaleThreshold, // expose nilai aktif ke UI
  }
}
