// api/price-history.js
// Vercel Serverless — CoinGecko price history proxy with 5-min cache

let cache = {} // Key: `${coin}-${days}`, Value: { data, timestamp }
const CACHE_TTL = 5 * 60 * 1000 // 5 menit

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')

  const now = Date.now()
  const { days = '1', coin = 'ethereum' } = req.query
  const cacheKey = `${coin}-${String(days)}`

  // Return dari cache kalau masih fresh
  if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_TTL) {
    return res.status(200).json({ ...cache[cacheKey].data, cached: true })
  }

  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=${days}` + (parseFloat(days) > 90 ? '&interval=daily' : '')

    const priceRes = await fetch(url, { headers: { 'Accept': 'application/json' } })

    if (!priceRes.ok) throw new Error(`CoinGecko error: ${priceRes.status}`)

    const priceData = await priceRes.json()

    // OHLC data untuk candlestick
    const ohlcDays = parseFloat(days) < 1 ? '1' : String(Math.round(parseFloat(days)))
    const ohlcRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/ohlc?vs_currency=usd&days=${ohlcDays}`,
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

    if (ohlcData.length > 0) {
      cache[cacheKey] = { data: result, timestamp: now }
    }
    return res.status(200).json(result)

  } catch (err) {
    if (cache[cacheKey]) {
      return res.status(200).json({ ...cache[cacheKey].data, cached: true, stale: true })
    }
    return res.status(500).json({ error: err.message })
  }
}