// Dashboard.jsx
// TronicLens — DeFi Staking Intelligence Cockpit
// All sections: Overview, Whale Activity, Staking Stats, Protocol Health, AI Insights, Alerts

import { motion, AnimatePresence } from 'framer-motion'
import { useWhaleActivity } from '../hooks/useWhaleActivity'

const COLORS = {
  bg: '#060d1a',
  card: '#0a1628',
  cardBorder: '#0e2040',
  cyan: '#38bdf8',
  cyanDim: '#38bdf820',
  cyanGlow: '#38bdf840',
  red: '#f43f5e',
  redDim: '#f43f5e20',
  green: '#10b981',
  greenDim: '#10b98120',
  amber: '#f59e0b',
  amberDim: '#f59e0b15',
  purple: '#818cf8',
  purpleDim: '#818cf820',
  text: '#e2e8f0',
  textMuted: '#64748b',
  textDim: '#94a3b8',
}

// ─── Shared Components ───────────────────────────────────────────

function PageHeader({ title, subtitle, badge, badgeColor = COLORS.cyan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: '32px' }}
    >
      {badge && (
        <span style={{
          display: 'inline-block',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
          color: badgeColor, textTransform: 'uppercase',
          border: `1px solid ${badgeColor}40`,
          padding: '3px 10px', borderRadius: '50px',
          backgroundColor: `${badgeColor}15`,
          marginBottom: '10px',
        }}>
          {badge}
        </span>
      )}
      <h1 style={{
        fontSize: '28px', fontWeight: 800,
        color: COLORS.text,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '-0.02em',
        marginBottom: '6px',
      }}>
        {title}
      </h1>
      <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>{subtitle}</p>
    </motion.div>
  )
}

function StatCard({ label, value, sub, accent = COLORS.cyan, delay = 0, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <p style={{ color: COLORS.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </p>
        {icon && <span style={{ fontSize: '18px', opacity: 0.6 }}>{icon}</span>}
      </div>
      <p style={{ color: COLORS.text, fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '4px' }}>
        {value}
      </p>
      {sub && <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>{sub}</p>}
    </motion.div>
  )
}

function ComingSoonSection({ title, subtitle, icon, color = COLORS.cyan, features = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}
    >
      {/* Icon glow */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '20px',
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '36px', marginBottom: '24px',
        boxShadow: `0 0 40px ${color}20`,
      }}>
        {icon}
      </div>

      <span style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
        color: COLORS.amber, textTransform: 'uppercase',
        border: '1px solid #f59e0b40', backgroundColor: '#f59e0b10',
        padding: '4px 12px', borderRadius: '50px', marginBottom: '16px',
        display: 'inline-block',
      }}>
        Coming Soon
      </span>

      <h2 style={{
        fontSize: '32px', fontWeight: 800, color: COLORS.text,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '-0.02em', marginBottom: '12px',
      }}>
        {title}
      </h2>
      <p style={{ color: COLORS.textMuted, fontSize: '15px', maxWidth: '480px', lineHeight: 1.7, marginBottom: '40px' }}>
        {subtitle}
      </p>

      {/* Feature list */}
      {features.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          maxWidth: '600px',
          width: '100%',
        }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{ fontSize: '16px' }}>{f.icon}</span>
              <span style={{ color: COLORS.textDim, fontSize: '13px' }}>{f.label}</span>
            </motion.div>
          ))}
        </div>
      )}

      <p style={{ color: COLORS.textMuted, fontSize: '12px', marginTop: '40px' }}>
        Planned for ETHOnline 2026 · Sep 4–16, 2026
      </p>
    </motion.div>
  )
}

// ─── Section: Overview ───────────────────────────────────────────

function OverviewContent() {
  const { activities, stats, chainlinkPrice, loading, error, formatTime, formatAddress, WHALE_THRESHOLD } = useWhaleActivity()

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
              color: COLORS.cyan, textTransform: 'uppercase',
              border: `1px solid ${COLORS.cyan}40`,
              padding: '3px 10px', borderRadius: '50px',
              backgroundColor: COLORS.cyanDim,
            }}>
              🔴 Live
            </span>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Refreshes every 30s</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
            <img
              src="/src/assets/troniclens-logo-transparent.svg"
              alt="TronicLens"
              style={{ width: '48px', height: '48px', filter: 'drop-shadow(0 0 8px #38bdf860)' }}
            />
            <h1 style={{
              fontSize: '30px', fontWeight: 800,
              background: `linear-gradient(135deg, ${COLORS.text}, ${COLORS.cyan})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.03em', margin: 0,
            }}>
              TronicLens
            </h1>
          </div>
          <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>
            On-chain intelligence for stakers who refuse to fly blind
          </p>
        </div>

        {/* Chainlink price */}
        {chainlinkPrice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '12px',
              padding: '14px 20px',
              textAlign: 'right',
            }}
          >
            <p style={{ color: COLORS.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              ⛓️ Chainlink · {chainlinkPrice.pair}
            </p>
            <p style={{ color: COLORS.cyan, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              ${chainlinkPrice.price}
            </p>
            <p style={{ color: COLORS.textMuted, fontSize: '11px', marginTop: '2px' }}>
              Updated {chainlinkPrice.updatedAt}
            </p>
          </motion.div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Total Staked" value={`${stats.totalStaked} ETH`} sub={`$${stats.totalStakedUSD}`} accent={COLORS.cyan} delay={0.1} icon="💎" />
          <StatCard label="Active Stakers" value={stats.activeStakers} sub="unique addresses" accent={COLORS.green} delay={0.15} icon="👥" />
          <StatCard label="Whale Wallets" value={stats.whaleCount} sub={`> ${WHALE_THRESHOLD} ETH threshold`} accent={COLORS.amber} delay={0.2} icon="🐋" />
          <StatCard label="Avg Stake Size" value={`${stats.avgStakeSize} ETH`} sub="per staker" accent={COLORS.cyan} delay={0.25} icon="📊" />
        </div>
      )}

      {/* Whale Activity Table */}
      <WhaleTable activities={activities} loading={loading} error={error} formatTime={formatTime} formatAddress={formatAddress} WHALE_THRESHOLD={WHALE_THRESHOLD} />
    </div>
  )
}

// ─── Section: Whale Activity ──────────────────────────────────────

function WhaleActivityContent() {
  const { activities, loading, error, formatTime, formatAddress, WHALE_THRESHOLD } = useWhaleActivity()

  return (
    <div>
      <PageHeader
        title="Whale Activity"
        subtitle={`Tracking wallets with ≥ ${WHALE_THRESHOLD} ETH staked · Powered by The Graph`}
        badge="🐋 Live Feed"
        badgeColor={COLORS.cyan}
      />
      <WhaleTable activities={activities} loading={loading} error={error} formatTime={formatTime} formatAddress={formatAddress} WHALE_THRESHOLD={WHALE_THRESHOLD} showAll />
    </div>
  )
}

// ─── Section: Staking Stats ───────────────────────────────────────

function StakingStatsContent() {
  const { stats, chainlinkPrice } = useWhaleActivity()

  return (
    <div>
      <PageHeader
        title="Staking Stats"
        subtitle="Protocol-level staking metrics and performance indicators"
        badge="📈 Analytics"
        badgeColor={COLORS.green}
      />

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Total Value Locked" value={`${stats.totalStaked} ETH`} sub={`$${stats.totalStakedUSD}`} accent={COLORS.cyan} delay={0.05} icon="🏦" />
          <StatCard label="Active Stakers" value={stats.activeStakers} sub="unique addresses" accent={COLORS.green} delay={0.1} icon="👥" />
          <StatCard label="Whale Wallets" value={stats.whaleCount} sub="> 100 ETH" accent={COLORS.amber} delay={0.15} icon="🐋" />
          <StatCard label="Avg Stake Size" value={`${stats.avgStakeSize} ETH`} sub="per wallet" accent={COLORS.purple} delay={0.2} icon="📊" />
          <StatCard label="ETH Price" value={`$${stats.ethPrice}`} sub="via Chainlink feed" accent={COLORS.cyan} delay={0.25} icon="⛓️" />
          <StatCard label="Retail Stakers" value={stats.activeStakers - stats.whaleCount} sub="< 100 ETH threshold" accent={COLORS.green} delay={0.3} icon="👤" />
        </div>
      )}

      {/* Whale vs Retail breakdown */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <h3 style={{ color: COLORS.text, fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>
            Staker Distribution
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Whale bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: COLORS.amber, fontSize: '13px' }}>🐋 Whale ({stats.whaleCount})</span>
                <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
                  {((stats.whaleCount / stats.activeStakers) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: COLORS.cardBorder, borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.whaleCount / stats.activeStakers) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{ height: '100%', backgroundColor: COLORS.amber, borderRadius: '4px' }}
                />
              </div>
            </div>
            {/* Retail bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: COLORS.cyan, fontSize: '13px' }}>👤 Retail ({stats.activeStakers - stats.whaleCount})</span>
                <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>
                  {(((stats.activeStakers - stats.whaleCount) / stats.activeStakers) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: COLORS.cardBorder, borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats.activeStakers - stats.whaleCount) / stats.activeStakers) * 100}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  style={{ height: '100%', backgroundColor: COLORS.cyan, borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Section: Protocol Health ──────────────────────────────────────

function ProtocolHealthContent() {
  const healthChecks = [
    { label: 'StakingContract', status: 'Healthy', detail: 'Sepolia · 0x89907e8F...06926', color: COLORS.green, icon: '✅' },
    { label: 'ReentrancyGuard', status: 'Active', detail: 'OpenZeppelin v5.6.1', color: COLORS.green, icon: '🔐' },
    { label: 'The Graph Subgraph', status: 'Synced', detail: 'tronic-staking · v0.0.2 · 100%', color: COLORS.green, icon: '🔵' },
    { label: 'Chainlink Feed', status: 'Live', detail: 'ETH/USD · Sepolia · 8 decimals', color: COLORS.green, icon: '⛓️' },
    { label: '0G Storage', status: 'Connected', detail: 'Galileo Testnet · ChainID 16602', color: COLORS.cyan, icon: '🗄️' },
    { label: 'GovernanceContract', status: 'Deployed', detail: 'Sepolia · timelock 120s', color: COLORS.green, icon: '🏛️' },
  ]

  return (
    <div>
      <PageHeader
        title="Protocol Health"
        subtitle="Real-time status of all TronicLens smart contracts and integrations"
        badge="🔗 On-chain"
        badgeColor={COLORS.green}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {healthChecks.map((check, i) => (
          <motion.div
            key={check.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '12px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '20px' }}>{check.icon}</span>
              <div>
                <p style={{ color: COLORS.text, fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                  {check.label}
                </p>
                <p style={{ color: COLORS.textMuted, fontSize: '12px', fontFamily: 'monospace' }}>
                  {check.detail}
                </p>
              </div>
            </div>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: check.color,
              border: `1px solid ${check.color}40`,
              backgroundColor: `${check.color}15`,
              padding: '4px 12px', borderRadius: '50px',
            }}>
              {check.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: AI Insights ──────────────────────────────────────────

function AIInsightsContent() {
  return (
    <ComingSoonSection
      title="AI Insights"
      icon="🤖"
      color={COLORS.purple}
      subtitle="0G Compute-powered AI inference will analyze whale patterns, predict staking trends, and surface actionable intelligence for retail stakers."
      features={[
        { icon: '🧠', label: 'Whale pattern recognition' },
        { icon: '📈', label: 'Staking trend prediction' },
        { icon: '⚡', label: '0G Compute inference' },
        { icon: '🎯', label: 'Risk scoring per wallet' },
        { icon: '📊', label: 'Protocol health scoring' },
        { icon: '🔔', label: 'Anomaly detection' },
      ]}
    />
  )
}

// ─── Section: Alerts ──────────────────────────────────────────────

function AlertsContent() {
  return (
    <ComingSoonSection
      title="Smart Alerts"
      icon="🔔"
      color={COLORS.amber}
      subtitle="Get notified instantly when whale wallets make significant moves. Set custom thresholds and receive on-chain alerts powered by Chainlink Automation."
      features={[
        { icon: '🐋', label: 'Whale movement alerts' },
        { icon: '💰', label: 'Custom ETH thresholds' },
        { icon: '⛓️', label: 'Chainlink Automation' },
        { icon: '📱', label: 'Multi-channel notify' },
        { icon: '⏱️', label: 'Real-time triggers' },
        { icon: '📋', label: 'Alert history log' },
      ]}
    />
  )
}

// ─── Shared: Whale Table ──────────────────────────────────────────

function WhaleTable({ activities, loading, error, formatTime, formatAddress, WHALE_THRESHOLD, showAll = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px',
        borderBottom: `1px solid ${COLORS.cardBorder}`,
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: COLORS.text, marginBottom: '2px' }}>
            🐋 Whale Activity Feed
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>
            Transactions ≥ {WHALE_THRESHOLD} ETH · Powered by The Graph
          </p>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: 600, color: COLORS.green,
          border: `1px solid ${COLORS.green}40`, backgroundColor: COLORS.greenDim,
          padding: '4px 10px', borderRadius: '50px',
        }}>
          ● Live Data
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
        padding: '10px 24px', borderBottom: `1px solid ${COLORS.cardBorder}`,
      }}>
        {['Wallet', 'Action', 'Amount', 'Time'].map(col => (
          <span key={col} style={{
            color: COLORS.textMuted, fontSize: '11px', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            textAlign: col === 'Time' ? 'right' : 'left',
          }}>
            {col}
          </span>
        ))}
      </div>

      {loading ? (
        <LoadingPulse />
      ) : error ? (
        <div style={{ padding: '40px', textAlign: 'center', color: COLORS.red }}>⚠️ {error}</div>
      ) : activities.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>No whale activity detected</div>
      ) : (
        <AnimatePresence>
          {activities.map((tx, i) => (
            <ActivityRow key={tx.id} tx={tx} formatTime={formatTime} formatAddress={formatAddress} index={i} />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

function ActivityRow({ tx, formatTime, formatAddress, index }) {
  const isStake = tx.action === 'STAKE'
  const actionColor = isStake ? COLORS.green : COLORS.red
  const actionBg = isStake ? COLORS.greenDim : COLORS.redDim

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr',
        alignItems: 'center', padding: '16px 24px',
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        cursor: 'default',
      }}
      whileHover={{ backgroundColor: '#0e2040' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: actionColor, boxShadow: `0 0 8px ${actionColor}`, flexShrink: 0,
        }} />
        <span style={{ color: COLORS.cyan, fontSize: '13px', fontFamily: 'monospace' }}>
          {formatAddress(tx.address)}
        </span>
      </div>
      <div>
        <span style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
          padding: '4px 10px', borderRadius: '50px',
          backgroundColor: actionBg, color: actionColor, border: `1px solid ${actionColor}40`,
        }}>
          {tx.action}
        </span>
      </div>
      <div>
        <p style={{ color: COLORS.text, fontSize: '14px', fontWeight: 600 }}>{tx.amount} ETH</p>
        <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>${tx.amountUSD}</p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ color: COLORS.textMuted, fontSize: '13px' }}>{formatTime(tx.timestamp)}</span>
      </div>
    </motion.div>
  )
}

function LoadingPulse() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px' }}>
      {[1, 2, 3].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{ height: '52px', backgroundColor: COLORS.cardBorder, borderRadius: '8px' }}
        />
      ))}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────

function Dashboard({ activeItem }) {
  const renderContent = () => {
    switch (activeItem) {
      case 'overview':     return <OverviewContent />
      case 'whale':        return <WhaleActivityContent />
      case 'staking':      return <StakingStatsContent />
      case 'protocol':     return <ProtocolHealthContent />
      case 'ai':           return <AIInsightsContent />
      case 'alerts':       return <AlertsContent />
      default:             return <OverviewContent />
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: '32px 40px',
    }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          textAlign: 'center', color: COLORS.textMuted,
          fontSize: '12px', marginTop: '48px',
        }}
      >
        TronicLens · Built for ETHOnline 2026 · Powered by The Graph + Chainlink + 0G
      </motion.p>
    </div>
  )
}

export default Dashboard