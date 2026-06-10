// ETHPriceChart.jsx
// TronicLens — ETH/USD Price Chart with Candlestick, Volume, TVL

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts'
import { createChart, CandlestickSeries } from 'lightweight-charts'

// Simple in-memory cache untuk dev
const devCache = {}
let globalRetryTimer = { retryAt: 0 }

// ── Constants ────────────────────────────────────────────────────
const C = {
  bg: '#060d1a', card: '#080f20', border: '#0e2040',
  cyan: '#38bdf8', green: '#10b981', red: '#ef4444',
  text: '#e2e8f0', muted: '#4a5568', dim: '#64748b',
  purple: '#818cf8', amber: '#f59e0b',
}

const TIME_RANGES = [
  { label: '1H', days: '0.04' },
  { label: '1D', days: '1' },
  { label: '1W', days: '7' },
  { label: '1M', days: '30' },
  { label: '1Y', days: '365' },
]

const TABS = ['Price', 'Volume', 'TVL']

// ── Helpers ───────────────────────────────────────────────────────
function fmt$(v) {
  if (!v && v !== 0) return '—'
  if (v >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return '$' + (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return '$' + v.toFixed(2)
}

// AFTER:
function fmtTime(ts, days) {
  const d = new Date(ts)
  const n = parseFloat(days)
  if (n <= 0.04) return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (n <= 1)    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (n <= 7)    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  if (n <= 30)   return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// ── Custom Tooltip ────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, tab, range }) {
  if (!active || !payload?.length) return null

  let formattedLabel = label
  if (typeof label === 'number') {
    const d = new Date(label)
    const days = TIME_RANGES.find(x => x.label === range)?.days || '1'
    const n = parseFloat(days)

    if (n <= 0.04) {
      formattedLabel = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } else if (n <= 1) {
      formattedLabel = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (n <= 7) {
      formattedLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } else if (n <= 30) {
      formattedLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    } else {
      formattedLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  return (
    <div style={{
      background: '#0d1829', border: '1px solid #1a2f4e',
      borderRadius: '8px', padding: '10px 14px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
    }}>
      <p style={{ color: C.dim, fontSize: '11px', marginBottom: '4px' }}>{formattedLabel}</p>
      {tab === 'Volume' ? (
        <p style={{ color: C.purple, fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
          {fmt$(payload[0]?.value)}
        </p>
      ) : tab === 'TVL' ? (
        <>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color, fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>
              {p.name}: {fmt$(p.value)}
            </p>
          ))}
        </>
      ) : (
        <p style={{ color: C.cyan, fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
          {fmt$(payload[0]?.value)}
        </p>
      )}
    </div>
  )
}

// ── Candlestick Chart (lightweight-charts) ────────────────────────
function CandlestickChart({ ohlcData, isPositive, fullscreen = false }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !ohlcData?.length) return

    // Cleanup existing chart dulu
    if (chartRef.current) {
      try { chartRef.current.remove() } catch(e) {}
      chartRef.current = null
      seriesRef.current = null
    }

    // Delay sedikit supaya DOM settle
    const timer = setTimeout(() => {
      if (!containerRef.current) return

      const parentH = containerRef.current?.parentElement?.clientHeight
      let calculatedHeight = 220
      if (fullscreen) {
        if (parentH && parentH > 0) {
          calculatedHeight = parentH
        } else {
          const isMobilePortrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth
          calculatedHeight = isMobilePortrait ? (window.innerWidth - 100) : (window.innerHeight - 120)
        }
      }

      const chart = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: calculatedHeight,
        layout: { background: { color: 'transparent' }, textColor: C.dim },
        grid: { vertLines: { color: '#0e2040' }, horzLines: { color: '#0e2040' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: '#0e2040' },
        timeScale: { borderColor: '#0e2040', timeVisible: true },
      })

      const series = chart.addSeries(CandlestickSeries, {
        upColor: C.green, downColor: C.red,
        borderUpColor: C.green, borderDownColor: C.red,
        wickUpColor: C.green, wickDownColor: C.red,
      })

      // Format OHLC data for lightweight-charts
      const formatted = ohlcData
        .map(([ts, o, h, l, c]) => ({
          time: Math.floor(ts / 1000),
          open: o, high: h, low: l, close: c,
        }))
        .sort((a, b) => a.time - b.time)

      series.setData(formatted)
      chart.timeScale().fitContent()

      chartRef.current = chart
      seriesRef.current = series

      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          try {
            const parentH = containerRef.current?.parentElement?.clientHeight
            let h = 220
            if (fullscreen) {
              if (parentH && parentH > 0) {
                h = parentH
              } else {
                const isMobilePortrait = window.innerWidth < 768 && window.innerHeight > window.innerWidth
                h = isMobilePortrait ? (window.innerWidth - 100) : (window.innerHeight - 120)
              }
            }
            chartRef.current.resize(containerRef.current.clientWidth, h)
          } catch(e) {}
        }
      }
      window.addEventListener('resize', handleResize)

      // Simpan handleResize untuk cleanup
      containerRef._handleResize = handleResize
    }, 50)

    return () => {
      clearTimeout(timer)
      if (containerRef._handleResize) {
        window.removeEventListener('resize', containerRef._handleResize)
      }
      if (chartRef.current) {
        try { chartRef.current.remove() } catch(e) {}
        chartRef.current = null
      }
    }
  }, [ohlcData])

  return <div ref={containerRef} style={{ width: '100%', height: fullscreen ? '100%' : '220px' }} />
}

// ── Main Component ────────────────────────────────────────────────
export default function ETHPriceChart({ chainlinkPrice, tronicTVL }) {
  const [range, setRange] = useState('1D')
  const [tab, setTab] = useState('Price')
  const [chartType, setChartType] = useState('line') // 'line' | 'candle'
  const [priceData, setPriceData] = useState([])
  const [volumeData, setVolumeData] = useState([])
  const [ohlcData, setOhlcData] = useState([])
  const [tvlData, setTvlData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryIn, setRetryIn] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [priceChange, setPriceChange] = useState({ value: 0, pct: 0, positive: true })

  // Fetch price + volume + ohlc
  const fetchPriceData = useCallback(async (r) => {
    setLoading(true)
    setError(null)
    try {
      const days = TIME_RANGES.find(x => x.label === r)?.days || '1'
      const isDev = import.meta.env.DEV

      if (isDev) {
        const cacheKey = `price-${days}`
        if (devCache[cacheKey]) {
          const cached = devCache[cacheKey]
          setPriceData(cached.prices)
          setVolumeData(cached.volumes)
          setOhlcData(cached.ohlc)
          setPriceChange(cached.priceChange)
          setLoading(false)
          return
        }

        const [priceRes, ohlcRes] = await Promise.all([
          fetch(`https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}`),
          fetch(`https://api.coingecko.com/api/v3/coins/ethereum/ohlc?vs_currency=usd&days=${days === '0.04' ? '1' : days}`),
        ])

        if (!priceRes.ok) {
          const retryAfter = parseInt(priceRes.headers.get('Retry-After') || '60')
          const err = new Error('Rate limit reached')
          err.retryAfter = retryAfter
          throw err
        }

        const priceJson = await priceRes.json()
        const ohlcJson = ohlcRes.ok ? await ohlcRes.json() : []
        const filteredOhlc = days === '0.04'
        ? ohlcJson.filter(([ts]) => ts >= Date.now() - 60 * 60 * 1000)
        : ohlcJson

        const prices = priceJson.prices.map(([ts, p]) => ({
          time: fmtTime(ts, days), price: parseFloat(p.toFixed(2)), timestamp: ts,
        }))
        const volumes = priceJson.total_volumes.map(([ts, v]) => ({
          time: fmtTime(ts, days), volume: parseFloat(v.toFixed(0)), timestamp: ts,
        }))
        const first = prices[0]?.price
        const last = prices[prices.length - 1]?.price
        const change = last - first
        const pc = {
          value: Math.abs(change).toFixed(2),
          pct: Math.abs((change / first) * 100).toFixed(2),
          positive: change >= 0,
        }

        devCache[cacheKey] = { prices, volumes, ohlc: filteredOhlc, priceChange: pc }
        setPriceData(prices)
        setVolumeData(volumes)
        setOhlcData(filteredOhlc)
        setPriceChange(pc)
      } else {
        // Production: use Vercel proxy
        const res = await fetch(`/api/price-history?days=${days}`)
        const data = await res.json()

        const prices = data.prices.map(([ts, p]) => ({
          time: fmtTime(ts, days), price: parseFloat(p.toFixed(2)), timestamp: ts,
        }))
        const volumes = (data.volumes || []).map(([ts, v]) => ({
          time: fmtTime(ts, days), volume: parseFloat(v.toFixed(0)), timestamp: ts,
        }))

        setPriceData(prices)
        setVolumeData(volumes)
        setOhlcData(data.ohlc || [])

        const first = prices[0]?.price
        const last = prices[prices.length - 1]?.price
        const change = last - first
        setPriceChange({
          value: Math.abs(change).toFixed(2),
          pct: Math.abs((change / first) * 100).toFixed(2),
          positive: change >= 0,
        })
      }
    } catch (err) {
      setError(err.message)
      const retryAfter = err.retryAfter || 60
      // Hanya set timer baru kalau belum ada timer yang jalan
      if (globalRetryTimer.retryAt <= Date.now()) {
        globalRetryTimer.retryAt = Date.now() + retryAfter * 1000
        setRetryIn(retryAfter)
      } else {
        // Sisa waktu dari timer yang sudah jalan
        const remaining = Math.ceil((globalRetryTimer.retryAt - Date.now()) / 1000)
        setRetryIn(remaining)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch TVL
  const fetchTVL = useCallback(async () => {
    try {
      const isDev = import.meta.env.DEV
      const days = TIME_RANGES.find(x => x.label === range)?.days || '1'
      const daysNum = parseFloat(days)
      const cutoff = Date.now() - daysNum * 24 * 60 * 60 * 1000

      const url = isDev
        ? 'https://api.llama.fi/v2/historicalChainTvl/ethereum'
        : '/api/tvl-history'

      const res = await fetch(url)
      const data = await res.json()
      const raw = isDev ? data : (data.tvl || [])

      const filtered = raw
        .filter(({ date }) => date * 1000 >= cutoff)
        .map(({ date, tvl }) => ({
          time: fmtTime(date * 1000, days),
          globalTVL: parseFloat((tvl / 1e9).toFixed(2)),
          tronicTVL: tronicTVL ? parseFloat(tronicTVL) : 0,
          timestamp: date * 1000,
        }))

      setTvlData(filtered)
    } catch (err) {
      console.error('TVL fetch error:', err)
    }
  }, [range, tronicTVL])

  useEffect(() => {
    if (retryIn <= 0) return
    const timer = setInterval(() => {
      setRetryIn(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          fetchPriceData(range)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [retryIn])

  useEffect(() => { fetchPriceData(range) }, [range, fetchPriceData])
  useEffect(() => { if (tab === 'TVL') fetchTVL() }, [tab, fetchTVL])

  // Scroll block for fullscreen mode
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isFullscreen])

  const currentPrice = priceData[priceData.length - 1]?.price
    || (chainlinkPrice?.price ? parseFloat(String(chainlinkPrice.price).replace(/,/g, '')) : null)
  const isPositive = priceChange.positive
  const lineColor = isPositive ? C.green : C.red

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        backgroundColor: C.bg, border: `1px solid ${C.border}`,
        borderRadius: '12px', overflow: 'hidden', marginBottom: '24px',
      }}
    >
      <style>{`
        @media (max-width: 768px) and (orientation: portrait) {
          .fullscreen-chart-overlay {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            right: auto !important;
            bottom: auto !important;
            width: 100dvh !important;
            height: 100dvw !important;
            transform: translate(-50%, -50%) rotate(90deg) !important;
            transform-origin: center !important;
          }
        }
      `}</style>
      {/* ── HEADER ── */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: `1px solid ${C.border}`,
        backgroundColor: '#040a14',
      }}>
        {/* Row 1: Token + Price + Change */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <img
                  src="/logos/eth-diamond-(color-filled).svg"
                  alt="ETH"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
              <span style={{ color: C.text, fontSize: '14px', fontWeight: 700 }}>ETH / USD</span>
              <span style={{
                fontSize: '10px', fontWeight: 600, color: C.cyan,
                border: `1px solid ${C.cyan}35`, background: `linear-gradient(135deg, ${C.cyan}1a, ${C.cyan}05)`,
                padding: '2px 10px', borderRadius: '50px',
                letterSpacing: '0.05em',
              }}>COINGECKO</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ color: C.text, fontSize: '26px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                {currentPrice ? fmt$(currentPrice) : '—'}
              </span>
              {!loading && tab === 'Price' && (
                <span style={{ fontSize: '13px', fontWeight: 600, color: isPositive ? C.green : C.red }}>
                  {isPositive ? '+' : '-'}${priceChange.value} ({isPositive ? '+' : '-'}{priceChange.pct}%)
                </span>
              )}
            </div>
          </div>

          {/* Chart type toggle (line/candle) — only for Price tab */}
          <div style={{ display: 'flex', gap: '6px', alignSelf: 'center' }}>
            {tab === 'Price' && (
              <>
              {[
                { type: 'line', icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  </svg>
                )},
                { type: 'candle', icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="4" y="7" width="4" height="10" rx="1"/>
                    <line x1="6" y1="4" x2="6" y2="7"/><line x1="6" y1="17" x2="6" y2="20"/>
                    <rect x="16" y="5" width="4" height="8" rx="1"/>
                    <line x1="18" y1="2" x2="18" y2="5"/><line x1="18" y1="13" x2="18" y2="20"/>
                  </svg>
                )},
              ].map(({ type, icon }) => (
                <button key={type} onClick={() => setChartType(type)} style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px',
                  border: chartType === type ? `1px solid ${C.cyan}50` : `1px solid ${C.border}`,
                  background: chartType === type ? `${C.cyan}15` : 'none',
                  color: chartType === type ? C.cyan : C.dim,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {icon}
                </button>
              ))}
            </>
            )}
            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(true)}
              style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '6px',
                border: `1px solid ${C.border}`,
                background: 'none', color: C.dim, cursor: 'pointer',
              }}
              title="Fullscreen"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Row 2: Tabs + Time ranges */}

        {/* Row 2: Tabs + Time ranges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', background: '#060d1a', borderRadius: '8px', padding: '3px' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '4px 12px', borderRadius: '6px',
                border: 'none',
                background: tab === t ? '#0e2040' : 'none',
                color: tab === t ? C.text : C.dim,
                fontSize: '12px', fontWeight: tab === t ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>

          {/* Time ranges */}
          <div style={{ display: 'flex', gap: '2px' }}>
            {TIME_RANGES.map(({ label }) => {
              const disabledForTVL = tab === 'TVL' && label === '1H'
              return (
                <button key={label}
                  onClick={() => !disabledForTVL && setRange(label)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px',
                    border: range === label && !disabledForTVL ? `1px solid ${C.cyan}50` : '1px solid transparent',
                    background: range === label && !disabledForTVL ? `${C.cyan}15` : 'none',
                    color: disabledForTVL ? '#1e3a5f' : range === label ? C.cyan : C.dim,
                    fontSize: '12px', fontWeight: 600,
                    cursor: disabledForTVL ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s',
                    opacity: disabledForTVL ? 0.4 : 1,
                  }}
                >{label}</button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CHART AREA ── */}
       <div style={{ padding: '8px 0 0', height: '240px', position: 'relative' }}>
        <AnimatePresence mode="wait">
        <motion.div
          key={`${tab}-${range}-${chartType}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ width: '100%', height: '100%' }}
        >
        {loading && tab !== 'TVL' ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: C.dim, fontSize: '13px' }}>Loading chart...</motion.span>
          </div>
          ) : error && tab !== 'TVL' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="1.5" strokeLinecap="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p style={{ color: C.dim, fontSize: '13px', textAlign: 'center' }}>
                CoinGecko rate limit reached
              </p>
              {retryIn > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: C.amber }}
                  />
                  <span style={{ color: C.amber, fontSize: '12px', fontFamily: 'monospace', fontWeight: 600 }}>
                    Retrying in {retryIn}s...
                  </span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => fetchPriceData(range)}
                  style={{
                    padding: '6px 16px', background: `${C.cyan}15`,
                    border: `1px solid ${C.cyan}40`, borderRadius: '8px',
                    color: C.cyan, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Retry now
                </motion.button>
              )}
            </div>
        ) : tab === 'Price' && chartType === 'candle' ? (
          <div style={{ padding: '0 8px' }}>
            <CandlestickChart ohlcData={ohlcData} isPositive={isPositive} />
          </div>
        ) : tab === 'Price' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0e2040" vertical={false} />
              <XAxis dataKey="timestamp" tickFormatter={ts => fmtTime(ts, TIME_RANGES.find(x => x.label === range)?.days || '1')} tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickCount={6} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => '$' + v.toLocaleString()} width={72} />
              <Tooltip content={<ChartTooltip tab="Price" range={range} />} cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="price" stroke={lineColor} strokeWidth={2} fill="url(#priceGrad)" dot={false} activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : tab === 'Volume' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volumeData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#0e2040" vertical={false} />
              <XAxis dataKey="timestamp" tickFormatter={ts => fmtTime(ts, TIME_RANGES.find(x => x.label === range)?.days || '1')} tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickCount={6} />
              <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => fmt$(v)} width={72} />
              <Tooltip content={<ChartTooltip tab="Volume" range={range} />} cursor={{ fill: `${C.purple}10` }} />
              <Bar dataKey="volume" fill={C.purple} fillOpacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : tab === 'TVL' ? (
          tvlData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: C.dim, fontSize: '13px' }}>Loading TVL...</motion.span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tvlData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="globalTVLGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.cyan} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tronicTVLGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#0e2040" vertical={false} />
                <XAxis dataKey="timestamp" tickFormatter={ts => fmtTime(ts, TIME_RANGES.find(x => x.label === range)?.days || '1')} tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickCount={6} />
                <YAxis tick={{ fill: C.dim, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v + 'B'} width={56} />
                <Tooltip content={<ChartTooltip tab="TVL" range={range} />} cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="globalTVL" name="ETH Ecosystem" stroke={C.cyan} strokeWidth={2} fill="url(#globalTVLGrad)" dot={false} />
                <Area type="monotone" dataKey="tronicTVL" name="TronicLens" stroke={C.green} strokeWidth={2} fill="url(#tronicTVLGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : null}
        </motion.div>
        </AnimatePresence>
      </div>

      {/* ── LEGEND (TVL only) ── */}
      {tab === 'TVL' && tvlData.length > 0 && (
        <div style={{ padding: '4px 20px 8px', display: 'flex', gap: '16px' }}>
          {[{ color: C.cyan, label: 'ETH Ecosystem TVL (Billions)' }, { color: C.green, label: 'TronicLens TVL (ETH)' }].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '2px', background: color, borderRadius: '1px' }} />
              <span style={{ color: C.dim, fontSize: '10px' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{ padding: '6px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
        <span style={{ color: C.dim, fontSize: '10px' }}>
          {tab === 'TVL'
            ? 'ETH Ecosystem TVL via DeFiLlama · TronicLens TVL via The Graph'
            : 'Historical data via CoinGecko · Live price via Chainlink'}
        </span>
        {chainlinkPrice?.updatedAt && (
          <span style={{ color: C.dim, fontSize: '10px' }}>Updated {chainlinkPrice.updatedAt}</span>
        )}
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fullscreen-chart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              backgroundColor: C.bg,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Fullscreen header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${C.border}`,
              backgroundColor: '#040a14',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src="/logos/eth-diamond-(color-filled).svg"
                  alt="ETH"
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                />
                <span style={{ color: C.text, fontSize: '15px', fontWeight: 700 }}>ETH / USD</span>
                <span style={{
                  fontSize: '10px', fontWeight: 600, color: C.cyan,
                  border: `1px solid ${C.cyan}35`, background: `linear-gradient(135deg, ${C.cyan}1a, ${C.cyan}05)`,
                  padding: '2px 10px', borderRadius: '50px', letterSpacing: '0.05em',
                }}>COINGECKO</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: C.text, fontSize: '20px', fontWeight: 800, fontFamily: 'monospace' }}>
                  {currentPrice ? fmt$(currentPrice) : '—'}
                </span>
                {tab === 'Price' && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { type: 'line', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg> },
                      { type: 'candle', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="4" y="7" width="4" height="10" rx="1"/><line x1="6" y1="4" x2="6" y2="7"/><line x1="6" y1="17" x2="6" y2="20"/><rect x="16" y="5" width="4" height="8" rx="1"/><line x1="18" y1="2" x2="18" y2="5"/><line x1="18" y1="13" x2="18" y2="20"/></svg> },
                    ].map(({ type, icon }) => (
                      <button key={type} onClick={() => setChartType(type)} style={{
                        width: '32px', height: '32px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '6px',
                        border: chartType === type ? `1px solid ${C.cyan}50` : `1px solid ${C.border}`,
                        background: chartType === type ? `${C.cyan}15` : 'none',
                        color: chartType === type ? C.cyan : C.dim,
                        cursor: 'pointer',
                      }}>
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setIsFullscreen(false)}
                  style={{
                    width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '6px', border: `1px solid ${C.border}`,
                    background: 'none', color: C.dim, cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/>
                    <line x1="10" y1="14" x2="21" y2="3"/><line x1="3" y1="21" x2="14" y2="10"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Fullscreen tabs + ranges */}
            <div style={{
              padding: '10px 16px',
              borderBottom: `1px solid ${C.border}`,
              backgroundColor: '#040a14',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
            }}>
              <div style={{ display: 'flex', gap: '2px', background: '#060d1a', borderRadius: '8px', padding: '3px' }}>
                {TABS.map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    padding: '4px 14px', borderRadius: '6px', border: 'none',
                    background: tab === t ? '#0e2040' : 'none',
                    color: tab === t ? C.text : C.dim,
                    fontSize: '13px', fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
                  }}>{t}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {TIME_RANGES.map(({ label }) => {
                  const disabledForTVL = tab === 'TVL' && label === '1H'
                  return (
                    <button key={label} onClick={() => !disabledForTVL && setRange(label)} style={{
                      padding: '5px 12px', borderRadius: '6px',
                      border: range === label && !disabledForTVL ? `1px solid ${C.cyan}50` : '1px solid transparent',
                      background: range === label && !disabledForTVL ? `${C.cyan}15` : 'none',
                      color: disabledForTVL ? '#1e3a5f' : range === label ? C.cyan : C.dim,
                      fontSize: '13px', fontWeight: 600, cursor: disabledForTVL ? 'not-allowed' : 'pointer',
                      opacity: disabledForTVL ? 0.4 : 1,
                    }}>{label}</button>
                  )
                })}
              </div>
            </div>

            {/* Fullscreen chart */}
             <div style={{ flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ color: C.dim, fontSize: '13px' }}>Loading chart...</motion.span>
                </div>
              ) : error ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px' }}>
                  <span style={{ color: C.dim, fontSize: '13px' }}>CoinGecko rate limit reached</span>
                  {retryIn > 0 && (
                    <span style={{ color: C.amber, fontSize: '12px', fontFamily: 'monospace' }}>Retrying in {retryIn}s...</span>
                  )}
                </div>
              ) : tab === 'Price' && chartType === 'candle' ? (
                <div style={{ padding: '0 8px', flex: 1, minHeight: 0 }}>
                  <CandlestickChart ohlcData={ohlcData} isPositive={isPositive} fullscreen={true} />
                </div>
              ) : tab === 'Price' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={lineColor} stopOpacity={0.25}/>
                        <stop offset="100%" stopColor={lineColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0e2040" vertical={false}/>
                    <XAxis dataKey="timestamp" tickFormatter={ts => fmtTime(ts, TIME_RANGES.find(x => x.label === range)?.days || '1')} tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickCount={8}/>
                    <YAxis domain={['auto','auto']} tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => '$'+v.toLocaleString()} width={76}/>
                    <Tooltip content={<ChartTooltip tab="Price" range={range}/>} cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: '4 4' }}/>
                    <Area type="monotone" dataKey="price" stroke={lineColor} strokeWidth={2} fill="url(#fsGrad)" dot={false} activeDot={{ r: 5, fill: lineColor, strokeWidth: 0 }}/>
                  </AreaChart>
                </ResponsiveContainer>
              ) : tab === 'Volume' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0e2040" vertical={false}/>
                    <XAxis dataKey="timestamp" tickFormatter={ts => fmtTime(ts, TIME_RANGES.find(x => x.label === range)?.days || '1')} tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickCount={8}/>
                    <YAxis tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => fmt$(v)} width={76}/>
                    <Tooltip content={<ChartTooltip tab="Volume" range={range}/>} cursor={{ fill: `${C.purple}10` }}/>
                    <Bar dataKey="volume" fill={C.purple} fillOpacity={0.8} radius={[2,2,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tvlData} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fsTVL1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.cyan} stopOpacity={0.2}/><stop offset="100%" stopColor={C.cyan} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="fsTVL2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.green} stopOpacity={0.3}/><stop offset="100%" stopColor={C.green} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#0e2040" vertical={false}/>
                    <XAxis dataKey="timestamp" tickFormatter={ts => fmtTime(ts, TIME_RANGES.find(x => x.label === range)?.days || '1')} tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" tickCount={8}/>
                    <YAxis tick={{ fill: C.dim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v+'B'} width={56}/>
                    <Tooltip content={<ChartTooltip tab="TVL" range={range}/>} cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: '4 4' }}/>
                    <Area type="monotone" dataKey="globalTVL" name="ETH Ecosystem" stroke={C.cyan} strokeWidth={2} fill="url(#fsTVL1)" dot={false}/>
                    <Area type="monotone" dataKey="tronicTVL" name="TronicLens" stroke={C.green} strokeWidth={2} fill="url(#fsTVL2)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Fullscreen footer */}
            <div style={{ padding: '8px 16px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: C.dim, fontSize: '10px' }}>
                {tab === 'TVL' ? 'ETH Ecosystem TVL via DeFiLlama · TronicLens TVL via The Graph' : 'Historical data via CoinGecko · Live price via Chainlink'}
              </span>
              <span style={{ color: C.dim, fontSize: '10px' }}>Rotate device for best experience</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
