// api/price-history.js
// Vercel Serverless — CoinGecko price history proxy with 5-min cache

let cache = {} // Key: days, Value: { data, timestamp }
const CACHE_TTL = 5 * 60 * 1000 // 5 menit

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const now = Date.now()
  const { days = '1', interval } = req.query
  const cacheKey = String(days)

  // Return dari cache kalau masih fresh
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return res.status(200).json({ ...cache[cacheKey].data, cached: true })
  }

  try {
    // Exclude interval parameter for hourly/minutely data as CoinGecko only supports interval=daily
    const url = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}` + (parseFloat(days) > 90 ? '&interval=daily' : '')

    // Line chart data
    const priceRes = await fetch(
      url,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!priceRes.ok) throw new Error(`CoinGecko error: ${priceRes.status}`)

    const priceData = await priceRes.json()

    // OHLC data untuk candlestick
    const ohlcRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/ethereum/ohlc?vs_currency=usd&days=${days}`,
      { headers: { 'Accept': 'application/json' } }
    )

    const ohlcData = ohlcRes.ok ? await ohlcRes.json() : []

    const result = {
      prices: priceData.prices,
      volumes: priceData.total_volumes,
      ohlc: ohlcData,
      cached: false,
      fetchedAt: now,
    }

    cache[cacheKey] = { data: result, timestamp: now }
    return res.status(200).json(result)

  } catch (err) {
    // Kalau error tapi ada cache lama, return cache lama daripada error
    if (cache[cacheKey]) {
      return res.status(200).json({ ...cache[cacheKey].data, cached: true, stale: true })
    }
    return res.status(500).json({ error: err.message })
  }
}