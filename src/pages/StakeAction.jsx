// StakeAction.jsx
// TronicLens — Stake ETH to participate in Governance

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { parseEther, formatEther } from 'viem'
import { COLORS } from '../utils/colors'
import { useSettings } from '../context/SettingsContext'

const STAKING_ADDRESS = '0x89907e8F6CB6468b2c8fe2d3814249881eF06926'

const STAKING_ABI = [
  { name: 'stake', type: 'function', stateMutability: 'payable', inputs: [], outputs: [] },
  { name: 'unstake', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'getStakeInfo', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'reward', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ]
  },
  { name: 'calculateReward', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  { name: 'MIN_STAKE_AMOUNT', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'minimumStakePeriod', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] },
]

function formatEth(wei) {
  if (!wei && wei !== 0n) return '0.000000'
  const val = parseFloat(formatEther(wei))
  if (val === 0) return '0.000000'
  if (val < 0.00000001) return '< 0.00000001'
  if (val < 0.0001) return val.toFixed(10)
  return val.toFixed(6)
}

function formatDuration(seconds) {
  if (!seconds) return '—'
  const s = Number(seconds)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`
  if (s < 31536000) return `${Math.floor(s / 2592000)}mo ${Math.floor((s % 2592000) / 86400)}d`
  return `${Math.floor(s / 31536000)}y ${Math.floor((s % 31536000) / 2592000)}mo`
}

// ─── Background ──────────────────────────────────────────────────
function StakeBackground() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <motion.div
        animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.07, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '460px', height: '460px', borderRadius: '50%',
          background: 'radial-gradient(circle, #10b98130 0%, #10b98108 50%, transparent 70%)',
          filter: 'blur(48px)', willChange: 'transform, opacity',
        }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        style={{
          position: 'absolute', bottom: '-80px', left: '60px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, #38bdf820 0%, #38bdf808 50%, transparent 70%)',
          filter: 'blur(56px)', willChange: 'transform, opacity',
        }}
      />
      <motion.div
        animate={{ opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', top: '30%', left: '40%',
          width: '500px', height: '260px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, #10b98115 0%, transparent 70%)',
          filter: 'blur(60px)', willChange: 'opacity',
        }}
      />
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = '#10b981', delay = 0 }) {
  const { settings } = useSettings()
  const compact = settings.compactMode
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '10px',
        padding: compact ? '10px 12px' : '14px 16px',
        position: 'relative', overflow: 'hidden',
        flex: 1, minWidth: '120px',
      }}
    >
      {/* Static top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: accent, opacity: 0.7,
      }} />
      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: delay * 2 }}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '40%', height: '1px',
          background: 'linear-gradient(90deg, transparent, #ffffff90, transparent)',
        }}
      />
      <p style={{ color: COLORS.textMuted, fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</p>
      <p style={{ color: COLORS.text, fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>{value}</p>
      <p style={{ color: COLORS.textMuted, fontSize: '11px' }}>{sub}</p>
    </motion.div>
  )
}

// ─── Connect Prompt ───────────────────────────────────────────────
function ConnectPrompt() {
  const { open } = useAppKit()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center', gap: '24px' }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '72px', height: '72px', borderRadius: '16px',
          background: `linear-gradient(135deg, ${COLORS.cyan}20, ${COLORS.green}20)`,
          border: `1px solid ${COLORS.cyan}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 32px ${COLORS.cyan}20`,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="14" height="14" rx="2"/>
            <circle cx="9" cy="12" r="2.5"/>
            <line x1="9" y1="10.5" x2="9" y2="12"/>
            <line x1="9" y1="12" x2="10.5" y2="12"/>
            <rect x="17" y="8" width="5" height="4" rx="1"/>
            <ellipse cx="19.5" cy="10" rx="2" ry="1"/>
            <path d="M16 9.5 L13 8"/>
            <path d="M16 11 L13 13"/>
        </svg>
      </motion.div>
      <div>
        <p style={{ color: COLORS.text, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Connect Wallet to Stake</p>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', maxWidth: '300px', lineHeight: 1.6, margin: '0 auto' }}>
          Stake ETH to earn rewards and gain voting power in TronicLens Governance.
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.04, boxShadow: '0 0 24px #10b98140' }}
        whileTap={{ scale: 0.97 }}
        onClick={() => open()}
        style={{
          padding: '13px 32px',
          background: 'linear-gradient(135deg, #10b981, #38bdf8)',
          border: 'none',
          borderRadius: '10px',
          color: '#ffffff',
          fontSize: '14px', fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          boxShadow: '0 0 20px #10b98140',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '40%', height: '100%',
            background: 'linear-gradient(90deg, transparent, #ffffff15, transparent)',
            pointerEvents: 'none',
          }}
        />
        Connect Wallet
      </motion.button>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────
export default function StakeActionContent({ onGoToGovernance }) {
  const { address, isConnected } = useAccount()
  const { settings } = useSettings()
  const compact = settings.compactMode
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])
  const [stakeInput, setStakeInput] = useState('')
  const [tab, setTab] = useState('stake') // 'stake' | 'unstake'

  // Read contract data
  const { data: stakeInfo, refetch: refetchStakeInfo } = useReadContract({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: 'getStakeInfo', args: [address],
    query: { enabled: !!address },
  })
  const { data: rewardData, refetch: refetchReward } = useReadContract({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: 'calculateReward', args: [address],
    query: { enabled: !!address },
  })
  const { data: minStake } = useReadContract({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: 'MIN_STAKE_AMOUNT',
  })
  const { data: minPeriod } = useReadContract({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: 'minimumStakePeriod',
  })
  const { data: balance } = useBalance({ address })
  const { data: contractBalance } = useBalance({ address: STAKING_ADDRESS })

  const stakedAmount = stakeInfo?.[0] ?? 0n
  const stakeTimestamp = stakeInfo?.[1] ?? 0n
  const currentReward = rewardData ?? 0n
  const hasStake = stakedAmount > 0n

  // Write: stake
  const { writeContract: writeStake, data: stakeHash, isPending: staking, error: stakeError } = useWriteContract()
  const { isLoading: stakeConfirming, isSuccess: stakeSuccess } = useWaitForTransactionReceipt({ hash: stakeHash })

  // Write: unstake
  const { writeContract: writeUnstake, data: unstakeHash, isPending: unstaking, error: unstakeError } = useWriteContract()
  const { isLoading: unstakeConfirming, isSuccess: unstakeSuccess } = useWaitForTransactionReceipt({ hash: unstakeHash })

  useEffect(() => {
    if (stakeSuccess || unstakeSuccess) {
      refetchStakeInfo()
      refetchReward()
      setStakeInput('')
    }
  }, [stakeSuccess, unstakeSuccess])

  const handleStake = () => {
    if (!stakeInput || parseFloat(stakeInput) <= 0) return
    writeStake({
      address: STAKING_ADDRESS, abi: STAKING_ABI,
      functionName: 'stake',
      value: parseEther(stakeInput),
    })
  }

  const handleUnstake = () => {
    writeUnstake({ address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'unstake' })
  }

  const minEth = minStake ? parseFloat(formatEther(minStake)) : 0
  const inputValid = stakeInput && parseFloat(stakeInput) >= minEth

  return (
    <div style={{ padding: isMobile ? '12px 10px' : compact ? '16px' : '24px 32px', position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <StakeBackground />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: compact ? '16px' : '28px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
            color: '#10b981', textTransform: 'uppercase',
            border: '1px solid #10b98135', padding: '3px 12px',
            borderRadius: '50px', background: 'linear-gradient(135deg, #10b9811a, #10b98105)',
            marginBottom: compact ? '6px' : '10px',
          }}>
            <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
            Sepolia Testnet · Live
          </span>
          <h1 style={{ fontSize: compact ? '22px' : '28px', fontWeight: 800, color: COLORS.text, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Staking
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: compact ? '12px' : '14px' }}>
            Stake assets to earn rewards and unlock voting power in TronicLens Governance
          </p>
        </motion.div>

        {!isConnected ? <ConnectPrompt /> : (
          <>
            {/* Stats row */}
            <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px',
            gap: '10px',
            marginBottom: '20px',
            }}>
              <StatCard label="Your Stake" value={`${formatEth(stakedAmount)} ETH`} sub={hasStake ? 'Active position' : 'No active stake'} accent="#10b981" delay={0.05} />
                <StatCard label="Accrued Reward" value={`${formatEth(currentReward)} ETH`} sub="Claimed on unstake" accent="#10b981" delay={0.1} />
                <StatCard label="Stake Duration" value={hasStake ? formatDuration(stakeInfo?.[2]) : '—'} sub={hasStake ? 'Time staked' : 'Not staking'} accent="#10b981" delay={0.15} />
                <StatCard label="Min. Stake" value={`${minEth} ETH`} sub={minPeriod ? `Min. period: ${formatDuration(minPeriod)}` : '...'} accent="#10b981" delay={0.2} />
            </div>

            {/* Contract Reserve Bar */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              style={{
                marginBottom: '16px', padding: '10px 16px',
                backgroundColor: '#10b98108',
                border: '1px solid #10b98120',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="14" height="14" rx="2"/>
                  <circle cx="9" cy="12" r="2.5"/>
                  <line x1="9" y1="10.5" x2="9" y2="12"/>
                  <line x1="9" y1="12" x2="10.5" y2="12"/>
                  <rect x="17" y="8" width="5" height="4" rx="1"/>
                  <path d="M16 9.5 L13 8" /><path d="M16 11 L13 13"/>
                </svg>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                  Contract Reserve
                </span>
                <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {contractBalance ? parseFloat(formatEther(contractBalance.value)).toFixed(4) : '...'}  ETH
                </span>
              </div>
              <span style={{ color: '#4a5568', fontSize: '11px', fontFamily: 'monospace' }}>
                {contractBalance && rewardData !== undefined
                  ? (() => {
                      const reserveWei = contractBalance.value
                      const ratePerYear = BigInt(500) * BigInt(31536000)
                      if (ratePerYear === 0n) return 'Rate: inactive'
                      const yearsLeft = reserveWei / ratePerYear
                      return yearsLeft > 1000n
                        ? 'Sustainable for 1000+ years'
                        : `~${yearsLeft.toString()} years sustainable`
                    })()
                  : ''}
              </span>
            </motion.div>

            {/* Governance CTA — shown if has stake */}
            <AnimatePresence>
              {hasStake && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    marginBottom: '20px', padding: '14px 20px',
                    backgroundColor: `${COLORS.green}10`,
                    border: `1px solid ${COLORS.green}30`,
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>
                      You are eligible to participate in Governance
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={onGoToGovernance}
                    style={{
                      padding: '7px 16px',
                      background: `linear-gradient(135deg, ${COLORS.green}25, ${COLORS.cyan}15)`,
                      border: `1px solid ${COLORS.green}50`,
                      borderRadius: '8px', color: COLORS.green,
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Go to Governance →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tab: Stake / Unstake */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
              style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>

              {/* Tab headers */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.cardBorder}` }}>
                {['stake', 'unstake'].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{
                      flex: 1, padding: '14px', background: 'none', border: 'none', cursor: 'pointer',
                      color: tab === t ? COLORS.cyan : COLORS.textDim,
                      fontSize: '13px', fontWeight: tab === t ? 600 : 400,
                      borderBottom: tab === t ? `2px solid ${COLORS.cyan}` : '2px solid transparent',
                      transition: 'all 0.2s', textTransform: 'capitalize',
                    }}
                  >
                    {t === 'stake' ? 'Stake ETH' : 'Unstake & Claim'}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ padding: isMobile ? '16px 12px' : '20px 24px' }}>
                <AnimatePresence mode="wait">
                  {tab === 'stake' ? (
                    <motion.div key="stake"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      <div>
                        <label style={{ color: COLORS.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                          Amount to Stake
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number" min="0" step="0.01"
                            value={stakeInput}
                            onChange={e => setStakeInput(e.target.value)}
                            placeholder={`Min. ${minEth} ETH`}
                            style={{
                              width: '100%', padding: '12px 52px 12px 14px',
                              backgroundColor: '#060d1a',
                              border: `1px solid ${inputValid ? COLORS.cyan + '60' : COLORS.cardBorder}`,
                              borderRadius: '8px', color: COLORS.text,
                              fontSize: '15px', fontFamily: 'monospace',
                              outline: 'none', boxSizing: 'border-box',
                              transition: 'border-color 0.2s',
                            }}
                          />
                          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: COLORS.textDim, fontSize: '13px', fontWeight: 600 }}>
                            ETH
                          </span>
                        </div>
                        {balance && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                            <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>
                              Balance: {parseFloat(formatEther(balance.value)).toFixed(4)} ETH
                            </span>
                            <button onClick={() => setStakeInput(parseFloat(formatEther(balance.value)).toFixed(4))}
                              style={{ background: 'none', border: 'none', color: COLORS.cyan, fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                              MAX
                            </button>
                          </div>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: inputValid ? 1.03 : 1, boxShadow: inputValid ? '0 0 24px #10b98135' : 'none' }}
                        whileTap={{ scale: inputValid ? 0.97 : 1 }}
                        onClick={handleStake}
                        disabled={!inputValid || staking || stakeConfirming}
                        style={{
                          padding: '13px',
                          background: inputValid
                            ? 'linear-gradient(135deg, #10b981, #38bdf8)'
                            : '#0a1628',
                          border: inputValid ? 'none' : `1px solid ${COLORS.cardBorder}`,
                          borderRadius: '10px',
                          color: inputValid ? '#ffffff' : COLORS.textMuted,
                          fontSize: '14px', fontWeight: 600,
                          cursor: inputValid ? 'pointer' : 'not-allowed',
                          position: 'relative', overflow: 'hidden',
                          boxShadow: inputValid ? '0 0 20px #10b98140' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        {inputValid && (
                          <motion.div
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                            style={{
                              position: 'absolute', top: 0, left: 0,
                              width: '40%', height: '100%',
                              background: 'linear-gradient(90deg, transparent, #ffffff15, transparent)',
                              pointerEvents: 'none',
                            }}
                          />
                        )}
                        {staking ? 'Confirm in wallet...' : stakeConfirming ? 'Staking...' : stakeSuccess ? '✓ Staked!' : 'Stake ETH'}
                      </motion.button>

                      {stakeError && (
                        <p style={{ color: COLORS.red, fontSize: '12px', fontFamily: 'monospace' }}>
                          {stakeError.shortMessage || stakeError.message}
                        </p>
                      )}
                      {stakeSuccess && (
                        <p style={{ color: COLORS.green, fontSize: '13px' }}>
                          ✓ Stake confirmed! You can now participate in Governance.
                        </p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="unstake"
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                    >
                      {!hasStake ? (
                        <p style={{ color: COLORS.textMuted, fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
                          You have no active stake to withdraw.
                        </p>
                      ) : (
                        <>
                          <div style={{ padding: isMobile ? '10px' : '14px', backgroundColor: '#060d1a', border: `1px solid ${COLORS.cardBorder}`, borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Staked Amount</span>
                              <span style={{ color: COLORS.text, fontSize: '12px', fontFamily: 'monospace' }}>{formatEth(stakedAmount)} ETH</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>Accrued Reward</span>
                              <span style={{ color: COLORS.green, fontSize: '12px', fontFamily: 'monospace' }}>+{formatEth(currentReward)} ETH</span>
                            </div>
                            <div style={{ borderTop: `1px solid ${COLORS.cardBorder}`, marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>Total You Receive</span>
                              <span style={{ color: COLORS.cyan, fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                                {parseFloat(formatEther(stakedAmount + currentReward)).toFixed(10)} ETH
                              </span>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.03, boxShadow: '0 0 24px #ef444440' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleUnstake}
                            disabled={unstaking || unstakeConfirming}
                            style={{
                              padding: '13px',
                              background: 'linear-gradient(135deg, #ef4444, #7f1d1d)',
                              border: 'none',
                              borderRadius: '10px',
                              color: '#ffffff',
                              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                              position: 'relative', overflow: 'hidden',
                              boxShadow: '0 0 20px #ef444430',
                            }}
                          >
                            <motion.div
                              animate={{ x: ['-100%', '200%'] }}
                              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                              style={{
                                position: 'absolute', top: 0, left: 0,
                                width: '40%', height: '100%',
                                background: 'linear-gradient(90deg, transparent, #ffffff15, transparent)',
                                pointerEvents: 'none',
                              }}
                            />
                            {unstaking ? 'Confirm in wallet...' : unstakeConfirming ? 'Processing...' : unstakeSuccess ? '✓ Unstaked!' : 'Unstake & Claim Rewards'}
                          </motion.button>

                          {unstakeError && (
                            <p style={{ color: COLORS.red, fontSize: '12px', fontFamily: 'monospace' }}>
                              {unstakeError.shortMessage || unstakeError.message}
                            </p>
                          )}
                          {unstakeSuccess && (
                            <p style={{ color: COLORS.green, fontSize: '13px' }}>
                              ✓ Unstaked! Funds and rewards returned to your wallet.
                            </p>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Info box */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}
              style={{ padding: '14px 18px', backgroundColor: `${COLORS.cyan}08`, border: `1px solid ${COLORS.cyan}20`, borderRadius: '10px' }}>
              <p style={{ color: COLORS.textMuted, fontSize: '12px', lineHeight: 1.7 }}>
                <span style={{ color: COLORS.cyan, fontWeight: 600 }}>How it works: </span>
                Stake any amount above the minimum to start earning rewards automatically. Your staked ETH also grants you voting power in Governance — the more you stake, the more weight your vote carries. Unstaking returns your full principal plus accrued rewards.
              </p>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}