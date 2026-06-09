// api/tvl-history.js
// Vercel Serverless — DeFiLlama TVL history proxy with 10-min cache

let cache = { data: null, timestamp: 0 }
const CACHE_TTL = 10 * 60 * 1000 // 10 menit

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const now = Date.now()

  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return res.status(200).json({ ...cache.data, cached: true })
  }

  try {
    const response = await fetch(
      'https://api.llama.fi/v2/historicalChainTvl/ethereum',
      { headers: { 'Accept': 'application/json' } }
    )

    if (!response.ok) throw new Error(`DeFiLlama error: ${response.status}`)

    const data = await response.json()

    const result = { tvl: data, cached: false, fetchedAt: now }
    cache = { data: result, timestamp: now }
    return res.status(200).json(result)

  } catch (err) {
    if (cache.data) {
      return res.status(200).json({ ...cache.data, cached: true, stale: true })
    }
    return res.status(500).json({ error: err.message })
  }
}