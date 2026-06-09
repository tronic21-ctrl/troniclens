// src/pages/Alerts.jsx
// TronicLens — Smart Alerts
// Data: The Graph + Chainlink | AI Commentary: 0G Compute (Qwen2.5-7b)

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWhaleActivity } from '../hooks/useWhaleActivity'
import { useSettings } from '../context/SettingsContext'
import { COLORS } from '../utils/colors'

// ─── Helpers ──────────────────────────────────────────────────────

function timeAgo(blockNumber, currentBlock) {
  const blockDiff = Math.max(0, currentBlock - blockNumber)
  const seconds = blockDiff * 12
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function shortAddr(address) {
  if (!address) return '0x????...????'
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// ─── 0G AI Commentary ─────────────────────────────────────────────

async function fetchAICommentary(alert, ethPrice) {
  const prompt = alert.type === 'price'
  ? `You are a DeFi analyst for TronicLens. Current ETH price from Chainlink oracle is $${alert.amountUSD}. In 2-3 sentences, provide brief market context and what this price level means for stakers. Be concise and actionable.`
  : `You are a DeFi analyst for TronicLens, an on-chain staking intelligence tool.

  Alert detected:
  - Type: ${alert.type}
  - Action: ${alert.action}
  - Amount: ${alert.amountEth.toFixed(4)} ETH ($${alert.amountUSD})
  - Wallet: ${alert.address}
  - ETH Price: $${ethPrice || 'unknown'}

  In 2-3 sentences, provide a brief, insightful commentary on what this alert might indicate for stakers monitoring this protocol. Be concise and actionable.`

  try {
    const res = await fetch('/api/ai-commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const data = await res.json()
    return data?.choices?.[0]?.message?.content || null
  } catch {
    return null
  }
}

// ─── Alert Card ───────────────────────────────────────────────────

function AlertCard({ alert, ethPrice, index }) {
  const [aiComment, setAiComment] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const fetchedRef = useRef(false)

  const isStake = alert.action === 'STAKE'
  const isWhale = alert.type === 'whale'
  const isPrice = alert.type === 'price'

  const accentColor = isPrice
    ? '#627eea'
    : isStake ? COLORS.green : COLORS.red

  const accentBg = isPrice
    ? '#627eea20'
    : isStake ? COLORS.greenDim : COLORS.redDim

  const icon = isStake ? '🐋' : '🔴'

  const handleAskAI = async () => {
    if (fetchedRef.current) {
      setExpanded(e => !e)
      return
    }
    setExpanded(true)
    setAiLoading(true)
    fetchedRef.current = true
    const comment = await fetchAICommentary(alert, ethPrice)
    setAiComment(comment || 'AI commentary unavailable — 0G Compute may be busy.')
    setAiLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      style={{
        backgroundColor: '#060d1a',
        border: `1px solid ${COLORS.cardBorder}`,
        borderLeft: `3px solid ${accentColor}`,
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ padding: '16px 20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: accentBg,
              border: `1px solid ${accentColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isPrice ? (
                <img src="/logos/eth-diamond-(color-filled).svg" alt="ETH" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              ) : (
                <svg width="24" height="20" viewBox="0 0 205 95" fill="none">
                  <path d="M 30 45 Q 80 20 150 35 Q 185 42 200 52 Q 185 62 150 68 Q 80 80 30 55 Z" fill={accentColor}/>
                  <path d="M 30 50 L 0 30 L 14 50 Z" fill={isStake ? '#0d9668' : '#e11d48'}/>
                  <path d="M 30 50 L 0 70 L 14 50 Z" fill={isStake ? '#0d9668' : '#e11d48'}/>
                  <path d="M 95 28 L 108 4 L 125 30 Z" fill={isStake ? '#0d9668' : '#e11d48'}/>
                  <path d="M 130 62 L 138 82 L 158 66 Z" fill={isStake ? '#0d9668' : '#e11d48'}/>
                  <circle cx="175" cy="49" r="5" fill={isStake ? '#34d399' : '#fb7185'}/>
                  <circle cx="176" cy="48" r="2" fill={isStake ? '#059669' : '#be123c'}/>
                </svg>
              )}
            </span>
            <div>
              <p style={{ 
                color: COLORS.text, fontSize: '14px', fontWeight: 700, marginBottom: '2px',
              }}>
                {isPrice
                  ? <span style={{ color: COLORS.textMuted, fontWeight: 600 }}>ETH / USD</span>
                  : `${alert.action} · ${alert.amountEth.toFixed(4)} ETH`
                }
              </p>
              {isPrice && (
                <p style={{ color: COLORS.cyan, fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                  ${alert.amountUSD}
                </p>
              )}
              <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>
                {isPrice ? 'Chainlink · ETH/USD'
                  : (
                    <span
                      style={{ color: COLORS.cyan, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}
                      onClick={() => window.open(`https://eth-sepolia.blockscout.com/address/${alert.address}`, '_blank')}
                    >
                      {shortAddr(alert.address)}
                    </span>
                  )
                }
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              color: accentColor,
              background: `linear-gradient(135deg, ${accentColor}1a, ${accentColor}05)`,
              border: `1px solid ${accentColor}35`,
              padding: '3px 12px', borderRadius: '50px',
              letterSpacing: '0.08em',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              boxShadow: `0 0 10px ${accentColor}10`,
            }}>
              {isPrice ? 'PRICE' : alert.action}
            </span>
            <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>
              {alert.timeAgo}
            </span>
          </div>
        </div>

        {/* Amount USD row (for whale alerts) */}
        {!isPrice && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: COLORS.bg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: '8px',
            padding: '8px 12px',
            marginBottom: '12px',
          }}>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>USD Value</span>
            <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>${alert.amountUSD}</span>
          </div>
        )}

        {/* Ask AI button */}
          <button
            onClick={handleAskAI}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: expanded ? `${COLORS.purple}25` : `${COLORS.purple}12`,
              border: `1px solid ${COLORS.purple}50`,
              borderRadius: '6px',
              padding: '7px 14px',
              color: COLORS.purple,
              fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background-color 0.2s, border-color 0.2s',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <img
              src="/logos/0G-Logo-White.svg"
              alt="0G"
              style={{
                width: '13px', height: '13px', objectFit: 'contain',
                filter: 'brightness(0) saturate(100%) invert(58%) sepia(60%) saturate(400%) hue-rotate(200deg) brightness(110%)',
              }}
            />
            <span>{expanded ? 'Hide AI Insight' : 'Ask 0G AI'}</span>
          </button>

        {/* AI Commentary */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                marginTop: '12px',
                backgroundColor: COLORS.purpleDim,
                border: `1px solid ${COLORS.purple}30`,
                borderRadius: '10px',
                padding: '14px',
              }}>
                {aiLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      style={{ width: '14px', height: '14px', border: `2px solid ${COLORS.purple}`, borderTopColor: 'transparent', borderRadius: '50%' }}
                    />
                    <span style={{ color: COLORS.purple, fontSize: '13px' }}>Querying 0G Compute...</span>
                  </div>
                ) : (
                  <>
                    <p style={{ color: COLORS.textDim, fontSize: '13px', lineHeight: 1.7, marginBottom: '8px' }}>
                      {aiComment}
                    </p>
                    <p style={{ color: COLORS.textMuted, fontSize: '11px' }}>
                      ✦ Powered by <span style={{ color: COLORS.purple }}>0G Compute</span> · Qwen2.5-7b-instruct
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Alerts Content ───────────────────────────────────────────────

export default function AlertsContent() {
  const { settings } = useSettings()

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const {
    activities,
    stats,
    chainlinkPrice,
    loading,
    error,
    formatTime,
    WHALE_THRESHOLD,
  } = useWhaleActivity({
    refreshInterval: null, // Alerts tidak auto-refresh
    whaleThreshold: settings.whaleThreshold,
  })

  // Build alert list dari whale activities + chainlink price
  const alerts = []

  // Whale alerts dari The Graph
  activities.forEach(tx => {
    alerts.push({
      id: tx.id,
      type: 'whale',
      action: tx.action,
      address: tx.address,
      amountEth: tx.amountEth,
      amountUSD: tx.amountUSD,
      blockNumber: tx.blockNumber,
      timeAgo: formatTime(tx.timestamp),
    })
  })

  // Price alert dari Chainlink (always show if available)
  if (chainlinkPrice) {
    alerts.unshift({
      id: 'chainlink-price',
      type: 'price',
      action: 'PRICE',
      address: null,
      amountEth: 0,
      amountUSD: chainlinkPrice.price,
      blockNumber: 0,
      timeAgo: isMobile 
        ? chainlinkPrice.updatedAt.split(',')[1]?.trim().replace(' UTC', '') + ' UTC'
        : chainlinkPrice.updatedAt,
    })
  }

  const ethPrice = stats?.ethPrice

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: settings.compactMode ? '16px' : '32px' }}
      >
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: COLORS.amber,
          textTransform: 'uppercase',
          border: `1px solid ${COLORS.amber}35`,
          padding: '3px 12px',
          borderRadius: '50px',
          background: `linear-gradient(135deg, ${COLORS.amber}1a, ${COLORS.amber}05)`,
          boxShadow: `0 0 12px ${COLORS.amber}10`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          marginBottom: settings.compactMode ? '6px' : '10px',
        }}>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: COLORS.amber,
              boxShadow: `0 0 8px ${COLORS.amber}`,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          Live Monitoring
        </span>
        <h1 style={{
          fontSize: settings.compactMode ? '22px' : '28px', fontWeight: 800,
          color: COLORS.text,
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.02em',
          marginBottom: '6px',
        }}>
          Smart Alerts
        </h1>
        <p style={{ color: COLORS.textMuted, fontSize: settings.compactMode ? '12px' : '14px' }}>
          Whale movements ≥ {WHALE_THRESHOLD} ETH · ETH/USD via Chainlink · AI insight via 0G Compute
        </p>
      </motion.div>

      {/* Summary bar */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: '#060d1a',
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div style={{
            padding: '10px 16px',
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: '#040a14',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: COLORS.textDim, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Alert Summary
            </span>
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: COLORS.amber, boxShadow: `0 0 6px ${COLORS.amber}`, display: 'inline-block' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)' }}>
            {[
              { label: 'Total Alerts',  value: alerts.length,                                    color: COLORS.amber },
              { label: 'Whale Alerts',  value: activities.length,                                color: COLORS.amber },
              { label: 'ETH Price',     value: chainlinkPrice ? `$${chainlinkPrice.price}` : '—', color: COLORS.cyan },
              { label: 'Threshold',     value: `≥ ${WHALE_THRESHOLD} ETH`,                       color: COLORS.text },
            ].map((item, i) => {
              const totalCols = isMobile ? 2 : 4
              const isLastCol = (i % totalCols) === totalCols - 1
              const isLastRow = isMobile ? i >= 2 : true
              return (
                <div key={i} style={{
                  padding: '12px 16px',
                  borderRight: !isLastCol ? `1px solid ${COLORS.cardBorder}` : 'none',
                  borderBottom: !isLastRow ? `1px solid ${COLORS.cardBorder}` : 'none',
                }}>
                  <p style={{ color: COLORS.textDim, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>
                    {item.label}
                  </p>
                  <p style={{ color: item.color, fontSize: isMobile ? '14px' : '16px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                    {item.value}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Alert list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              style={{ height: '90px', backgroundColor: COLORS.card, borderRadius: '14px' }}
            />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: COLORS.red }}>⚠️ {error}</div>
      ) : alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '60px 20px', color: COLORS.textMuted }}
        >
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔔</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: COLORS.textDim, marginBottom: '8px' }}>No alerts detected</p>
          <p style={{ fontSize: '13px' }}>Whale threshold: ≥ {WHALE_THRESHOLD} ETH · Adjust in Settings</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} ethPrice={ethPrice} index={i} />
          ))}
        </div>
      )}

      {/* Footer */}
      {!loading && !error && alerts.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{ color: COLORS.textMuted, fontSize: '12px', textAlign: 'center', marginTop: '32px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <img src="/logos/The Graph - Logomark - Light.svg" alt="The Graph" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>The Graph</span>
            <span style={{ color: COLORS.textMuted }}>·</span>
            <img src="/logos/Chainlink-Symbol-White.svg" alt="Chainlink" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Chainlink</span>
            <span style={{ color: COLORS.textMuted }}>·</span>
            <img src="/logos/0G-Logo-White.svg" alt="0G" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>0G Compute (Qwen2.5-7b)</span>
          </div>
        </motion.p>
      )}
    </div>
  )
}