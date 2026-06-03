// Governance.jsx
// TronicLens — On-Chain Governance (Flight Controls)
// Connects to GovernanceContract + StakingGovernance via wagmi + Reown AppKit

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { COLORS } from '../utils/colors'
import { useSettings } from '../context/SettingsContext'

// ─── Contract Config ──────────────────────────────────────────────

const STAKING_GOVERNANCE_ADDRESS = '0xa830b86ce9D994A3c5b95F124c9a008e74b75080'
const GOVERNANCE_CONTRACT_ADDRESS = '0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8'

const STAKING_GOVERNANCE_ABI = [
  {
    name: 'checkEligibility',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'eligible', type: 'bool' },
      { name: 'votingPower', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
  },
  {
    name: 'createProposalAsStaker',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'description', type: 'string' }],
    outputs: [{ name: 'proposalId', type: 'uint256' }],
  },
  {
    name: 'voteAsStaker',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'support', type: 'bool' },
    ],
    outputs: [],
  },
  {
    name: 'getTotalProposals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'total', type: 'uint256' }],
  },
  {
    name: 'getProposalInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'proposer', type: 'address' },
      { name: 'description', type: 'string' },
      { name: 'yesVotes', type: 'uint256' },
      { name: 'noVotes', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'timelockEnd', type: 'uint256' },
      { name: 'executed', type: 'bool' },
      { name: 'canceled', type: 'bool' },
    ],
  },
  {
    name: 'getProposalStatus',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [{ name: 'status', type: 'string' }],
  },
  {
    name: 'getVoteInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'proposalId', type: 'uint256' },
      { name: 'voter', type: 'address' },
    ],
    outputs: [
      { name: 'voted', type: 'bool' },
      { name: 'support', type: 'bool' },
    ],
  },
  {
    name: 'executeProposal',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────

function formatEth(wei) {
  if (!wei) return '0'
  return (Number(wei) / 1e18).toFixed(4)
}

function shortenAddr(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function useCountdown(targetTimestamp, onComplete) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!targetTimestamp) return
    const target = Number(targetTimestamp) * 1000

    const update = () => {
      const diff = target - Date.now()
      if (diff <= 0) {
        setTimeLeft('00:00')
        onComplete?.()
        return
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetTimestamp])

  return timeLeft
}

function getStatusColor(status) {
  switch (status) {
    case 'Active': return COLORS.cyan
    case 'Passed': return COLORS.green
    case 'Executable': return '#a78bfa'
    case 'Executed': return COLORS.green
    case 'Defeated': return COLORS.red
    case 'Canceled': return COLORS.amber
    default: return COLORS.textDim
  }
}

// ─── Governance Ambient Background ───────────────────────────────

function GovBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 0,
      overflow: 'hidden',
    }}>
      <motion.div
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, #818cf830 0%, #818cf808 50%, transparent 70%)',
          filter: 'blur(48px)',
          willChange: 'transform, opacity',
        }}
      />
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.06, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '-100px', left: '80px',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, #38bdf820 0%, #38bdf808 50%, transparent 70%)',
          filter: 'blur(56px)',
          willChange: 'transform, opacity',
        }}
      />
      <motion.div
        animate={{ opacity: [0.06, 0.13, 0.06] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', top: '30%', left: '40%',
          width: '600px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, #818cf815 0%, transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'opacity',
        }}
      />
    </div>
  )
}

// ─── Animated Stat Card ───────────────────────────────────────────

function StatCard({ label, value, sub, delay = 0, compact = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '10px',
        padding: compact ? '12px 16px' : '16px 20px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Animated top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: COLORS.purple, opacity: 0.7,
      }} />
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: delay * 2 }}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '40%', height: '1px',
          background: `linear-gradient(90deg, transparent, #ffffff90, transparent)`,
        }}
      />
      <p style={{
        color: COLORS.textMuted, fontSize: '10px', fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px',
      }}>
        {label}
      </p>
      <p style={{ color: COLORS.text, fontSize: '18px', fontWeight: 700, marginBottom: '2px' }}>
        {value}
      </p>
      <p style={{ color: COLORS.textMuted, fontSize: '11px' }}>{sub}</p>
    </motion.div>
  )
}

// ─── Shared Components ────────────────────────────────────────────

function PageHeader({ title, subtitle, badge, badgeColor = COLORS.cyan }) {
  const { settings } = useSettings()
  const compact = settings.compactMode
  const isLive = badge && (
    badge.toLowerCase().includes('live') || 
    badge.toLowerCase().includes('monitoring') || 
    badge.toLowerCase().includes('feed')
  )
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: compact ? '16px' : '32px' }}
    >
      {badge && (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: badgeColor,
          textTransform: 'uppercase',
          border: `1px solid ${badgeColor}35`,
          padding: '3px 12px',
          borderRadius: '50px',
          background: `linear-gradient(135deg, ${badgeColor}1a, ${badgeColor}05)`,
          boxShadow: `0 0 12px ${badgeColor}10`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          marginBottom: compact ? '6px' : '10px',
        }}>
          {isLive && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: badgeColor,
                boxShadow: `0 0 8px ${badgeColor}`,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
          )}
          {badge}
        </span>
      )}
      <h1 style={{
        fontSize: compact ? '22px' : '28px', fontWeight: 800,
        color: COLORS.text,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '-0.02em',
        marginBottom: '6px',
      }}>
        {title}
      </h1>
      <p style={{ color: COLORS.textMuted, fontSize: compact ? '12px' : '14px' }}>{subtitle}</p>
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
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '50vh', textAlign: 'center', gap: '28px',
        position: 'relative',
      }}
    >
      {/* Wallet icon with pulse rings */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulse ring 1 */}
        <motion.div
          animate={{ scale: [1, 1.7, 1.7], opacity: [0.35, 0, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: '72px', height: '72px', borderRadius: '20px',
            border: `1px solid ${COLORS.cyan}`,
          }}
        />
        {/* Pulse ring 2 — offset */}
        <motion.div
          animate={{ scale: [1, 1.7, 1.7], opacity: [0.2, 0, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeOut', delay: 1.2 }}
          style={{
            position: 'absolute',
            width: '72px', height: '72px', borderRadius: '20px',
            border: `1px solid ${COLORS.purple}`,
          }}
        />
        {/* Icon box */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '72px', height: '72px', borderRadius: '16px',
            background: `linear-gradient(135deg, ${COLORS.cyan}20, ${COLORS.purple}20)`,
            border: `1px solid ${COLORS.cyan}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 32px ${COLORS.cyan}20`,
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="1.5">
            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="2"/>
            <path d="M6 12h.01M18 12h.01"/>
          </svg>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p style={{ color: COLORS.text, fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Connect Wallet to Access Governance
        </p>
        <p style={{ color: COLORS.textMuted, fontSize: '13px', maxWidth: '320px', lineHeight: 1.6, margin: '0 auto' }}>
          Connect your wallet to view proposals, check eligibility, and participate in on-chain governance.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        whileHover={{ scale: 1.04, boxShadow: `0 0 24px ${COLORS.cyan}30` }}
        whileTap={{ scale: 0.97 }}
        onClick={() => open()}
        style={{
          padding: '13px 32px',
          background: `linear-gradient(135deg, ${COLORS.cyan}25, ${COLORS.purple}20)`,
          border: `1px solid ${COLORS.cyan}50`,
          borderRadius: '10px',
          color: COLORS.cyan,
          fontSize: '14px', fontWeight: 600,
          cursor: 'pointer',
          letterSpacing: '0.05em',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
        Connect Wallet
      </motion.button>
    </motion.div>
  )
}

// ─── Eligibility Card ─────────────────────────────────────────────

function EligibilityCard({ address }) {
  const { data, isLoading } = useReadContract({
    address: STAKING_GOVERNANCE_ADDRESS,
    abi: STAKING_GOVERNANCE_ABI,
    functionName: 'checkEligibility',
    args: [address],
  })

  const eligible = data?.[0]
  const votingPower = data?.[1]
  const reason = data?.[2]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${eligible ? COLORS.green + '50' : COLORS.cardBorder}`,
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        boxShadow: eligible ? `0 0 24px ${COLORS.green}18` : 'none',
        transition: 'box-shadow 0.5s ease, border-color 0.5s ease',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Eligible shimmer sweep */}
      {eligible && !isLoading && (
        window.innerWidth >= 768 ? (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '400%' }}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '20%', height: '100%',
              background: `linear-gradient(90deg, transparent, ${COLORS.green}10, transparent)`,
              pointerEvents: 'none',
            }}
          />
        ) : (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.4, delay: 0.5, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: 0, left: 0,
              width: '100%', height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${COLORS.green}10 50%, transparent 100%)`,
              pointerEvents: 'none',
            }}
          />
        )
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          backgroundColor: eligible ? `${COLORS.green}15` : `${COLORS.amber}15`,
          border: `1px solid ${eligible ? COLORS.green + '30' : COLORS.amber + '30'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: '16px', height: '16px', border: `2px solid ${COLORS.cyan}`, borderTopColor: 'transparent', borderRadius: '50%' }}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={eligible ? COLORS.green : COLORS.amber} strokeWidth="2">
              {eligible
                ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              }
            </svg>
          )}
        </div>
        <div>
          <p style={{ color: COLORS.text, fontSize: '14px', fontWeight: 600, marginBottom: '3px' }}>
            {isLoading ? 'Checking eligibility...' : eligible ? 'Eligible to Vote & Propose' : 'Not Eligible'}
          </p>
          <p style={{ color: COLORS.textMuted, fontSize: '12px', fontFamily: 'monospace' }}>
            {isLoading ? '—' : eligible
              ? `Voting Power: ${formatEth(votingPower)} ETH · ${shortenAddr(address)}`
              : reason || 'Minimum stake required'}
          </p>
        </div>
      </div>
      <span style={{
        fontSize: '12px', fontWeight: 600,
        color: eligible ? COLORS.green : COLORS.amber,
        border: `1px solid ${eligible ? COLORS.green + '40' : COLORS.amber + '40'}`,
        backgroundColor: eligible ? `${COLORS.green}15` : `${COLORS.amber}15`,
        padding: '4px 12px', borderRadius: '4px',
      }}>
        {isLoading ? 'Checking...' : eligible ? 'Eligible' : 'Not Eligible'}
      </span>
    </motion.div>
  )
}

// ─── Create Proposal Form ─────────────────────────────────────────

function CreateProposalForm({ eligible, onSuccess }) {
  const [description, setDescription] = useState('')
  const [expanded, setExpanded] = useState(false)
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      setDescription('')
      setExpanded(false)
      onSuccess?.()
    }
  }, [isSuccess])

  const handleSubmit = () => {
    if (!description.trim()) return
    writeContract({
      address: STAKING_GOVERNANCE_ADDRESS,
      abi: STAKING_GOVERNANCE_ABI,
      functionName: 'createProposalAsStaker',
      args: [description.trim()],
    })
  }

  if (!eligible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '12px',
        marginBottom: '24px',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: `${COLORS.cyan}15`, border: `1px solid ${COLORS.cyan}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <span style={{ color: COLORS.text, fontSize: '14px', fontWeight: 600 }}>
            Create New Proposal
          </span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textDim} strokeWidth="2"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value.slice(0, 500))}
                placeholder="Describe your proposal... (max 500 characters)"
                rows={4}
                style={{
                  width: '100%', padding: '12px',
                  backgroundColor: '#060d1a',
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: '8px', color: COLORS.text,
                  fontSize: '13px', fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>
                  {description.length}/500 characters
                </span>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={!description.trim() || isPending || isConfirming}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: description.trim() ? `${COLORS.cyan}20` : '#0a1628',
                    border: `1px solid ${description.trim() ? COLORS.cyan + '60' : COLORS.cardBorder}`,
                    borderRadius: '8px',
                    color: description.trim() ? COLORS.cyan : COLORS.textMuted,
                    fontSize: '13px', fontWeight: 600,
                    cursor: description.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isPending ? 'Confirm in wallet...' : isConfirming ? 'Submitting...' : 'Submit Proposal'}
                </motion.button>
              </div>
              {error && (
                <p style={{ color: COLORS.red, fontSize: '12px', fontFamily: 'monospace' }}>
                  {error.shortMessage || error.message}
                </p>
              )}
              {isSuccess && (
                <p style={{ color: COLORS.green, fontSize: '12px' }}>
                  ✓ Proposal submitted successfully!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Proposal Card ────────────────────────────────────────────────

function ProposalCard({ proposalId, address, eligible, delay = 0 }) {
  const { data: info, refetch: refetchInfo } = useReadContract({
    address: STAKING_GOVERNANCE_ADDRESS,
    abi: STAKING_GOVERNANCE_ABI,
    functionName: 'getProposalInfo',
    args: [BigInt(proposalId)],
  })

  const { data: statusData, refetch: refetchStatus } = useReadContract({
    address: STAKING_GOVERNANCE_ADDRESS,
    abi: STAKING_GOVERNANCE_ABI,
    functionName: 'getProposalStatus',
    args: [BigInt(proposalId)],
  })

  const { data: voteInfo, refetch: refetchVote } = useReadContract({
    address: STAKING_GOVERNANCE_ADDRESS,
    abi: STAKING_GOVERNANCE_ABI,
    functionName: 'getVoteInfo',
    args: [BigInt(proposalId), address],
    query: { enabled: !!address },
  })

  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        refetchInfo()
        refetchStatus()
        refetchVote()
      }, 2000) // tunggu 2 detik agar RPC sync
    }
  }, [isSuccess])

  // Hooks harus dipanggil sebelum early return
  const deadlineCountdown = useCountdown(
    statusData === 'Active' ? info?.[5] : null,
    () => { refetchStatus(); refetchInfo() }
  )
  const timelockCountdown = useCountdown(
    statusData === 'Passed' ? info?.[6] : null,
    () => { refetchStatus(); refetchInfo() }
  )

  if (!info) return null

  const [id, proposer, description, yesVotes, noVotes, deadline, timelockEnd, executed, canceled] = info
  const status = statusData || 'Loading...'
  const statusColor = getStatusColor(status)
  const hasVoted = voteInfo?.[0]
  const myVote = voteInfo?.[1]

  const totalVotes = Number(yesVotes || 0n) + Number(noVotes || 0n)
  const yesPercent = totalVotes > 0 ? (Number(yesVotes) / totalVotes) * 100 : 0
  const deadlineDate = deadline ? new Date(Number(deadline) * 1000) : null

  const handleVote = (support) => {
    writeContract({
      address: STAKING_GOVERNANCE_ADDRESS,
      abi: STAKING_GOVERNANCE_ABI,
      functionName: 'voteAsStaker',
      args: [BigInt(proposalId), support],
    })
  }

  const handleExecute = () => {
    writeContract({
      address: GOVERNANCE_CONTRACT_ADDRESS,
      abi: [{
        name: 'executeProposal',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [{ name: 'proposalId', type: 'uint256' }],
        outputs: [],
      }],
      functionName: 'executeProposal',
      args: [BigInt(proposalId)],
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, boxShadow: `0 8px 32px rgba(0,0,0,0.4)`, transition: { duration: 0.2 } }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${status === 'Active' ? COLORS.cyan + '30' : status === 'Executable' ? '#a78bfa40' : COLORS.cardBorder}`,
        borderRadius: '12px',
        padding: '20px 24px',
        display: 'flex', flexDirection: 'column', gap: '14px',
        position: 'relative', overflow: 'hidden',
        boxShadow: status === 'Active' ? `0 0 20px ${COLORS.cyan}10` : 'none',
      }}
    >
      {/* Active top glow line */}
      {status === 'Active' && (
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '35%', height: '1px',
            background: `linear-gradient(90deg, transparent, ${COLORS.cyan}80, transparent)`,
          }}
        />
      )}
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: COLORS.textDim,
              fontFamily: 'monospace', letterSpacing: '0.05em',
            }}>
              PROPOSAL #{proposalId}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 600, color: statusColor,
              border: `1px solid ${statusColor}40`, backgroundColor: `${statusColor}15`,
              padding: '2px 8px', borderRadius: '4px',
            }}>
              {status}
            </span>
            {hasVoted && (
              <span style={{
                fontSize: '11px', fontWeight: 600,
                color: myVote ? COLORS.green : COLORS.red,
                border: `1px solid ${myVote ? COLORS.green : COLORS.red}40`,
                backgroundColor: `${myVote ? COLORS.green : COLORS.red}15`,
                padding: '2px 8px', borderRadius: '4px',
              }}>
                You voted {myVote ? 'YES' : 'NO'}
              </span>
            )}
          </div>
          <p style={{ color: COLORS.text, fontSize: '14px', lineHeight: 1.6 }}>
            {description}
          </p>
        </div>
      </div>

      {/* Proposer + deadline */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ color: COLORS.textMuted, fontSize: '12px', fontFamily: 'monospace' }}>
          By: <span
                onClick={() => window.open(`https://eth-sepolia.blockscout.com/address/${proposer}`, '_blank')}
                style={{
                  color: COLORS.cyan, cursor: 'pointer',
                  textDecoration: 'underline',
                  textDecorationStyle: 'dotted',
                  textUnderlineOffset: '3px',
                }}
                title="View on Blockscout"
              >
                {shortenAddr(proposer)}
              </span>
        </span>
        {deadlineDate && (
          <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>
            Deadline: {deadlineDate.toLocaleString('id-ID', { timeZone: 'UTC' })} UTC
          </span>
        )}
        {status === 'Active' && deadlineCountdown && (
          <span style={{
            color: COLORS.amber, fontSize: '12px', fontWeight: 600,
            fontFamily: 'monospace',
            border: `1px solid ${COLORS.amber}40`,
            backgroundColor: `${COLORS.amber}10`,
            padding: '2px 8px', borderRadius: '4px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}>
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {deadlineCountdown}
          </span>
        )}
        {status === 'Passed' && timelockCountdown && (
          <span style={{
            color: COLORS.purple, fontSize: '12px', fontWeight: 600,
            fontFamily: 'monospace',
            border: `1px solid ${COLORS.purple}40`,
            backgroundColor: `${COLORS.purple}10`,
            padding: '2px 8px', borderRadius: '4px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '4px'}}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            {timelockCountdown}
          </span>
        )}
      </div>

      {/* Vote bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: COLORS.green, fontSize: '12px', fontWeight: 600 }}>
            YES — {formatEth(yesVotes)} ETH ({yesPercent.toFixed(1)}%)
          </span>
          <span style={{ color: COLORS.red, fontSize: '12px', fontWeight: 600 }}>
            NO — {formatEth(noVotes)} ETH
          </span>
        </div>
        <div style={{
          height: '6px', borderRadius: '3px',
          backgroundColor: `${COLORS.red}30`,
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yesPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${COLORS.green}, ${COLORS.cyan})`,
              borderRadius: '3px',
            }}
          />
        </div>
      </div>

      {/* Action buttons */}
      {eligible && !hasVoted && status === 'Active' && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => handleVote(true)}
            disabled={isPending || isConfirming}
            style={{
              flex: 1, padding: '10px',
              backgroundColor: `${COLORS.green}15`,
              border: `1px solid ${COLORS.green}40`,
              borderRadius: '8px',
              color: COLORS.green,
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isPending || isConfirming ? 'Confirming...' : '✓ Vote YES'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => handleVote(false)}
            disabled={isPending || isConfirming}
            style={{
              flex: 1, padding: '10px',
              backgroundColor: `${COLORS.red}15`,
              border: `1px solid ${COLORS.red}40`,
              borderRadius: '8px',
              color: COLORS.red,
              fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isPending || isConfirming ? 'Confirming...' : '✗ Vote NO'}
          </motion.button>
        </div>
      )}

      {status === 'Executable' && (
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={handleExecute}
          disabled={isPending || isConfirming}
          style={{
            padding: '10px',
            backgroundColor: '#a78bfa15',
            border: '1px solid #a78bfa40',
            borderRadius: '8px',
            color: '#a78bfa',
            fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isPending || isConfirming ? 'Executing...' : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Execute Proposal
            </span>
          )}
        </motion.button>
      )}

      {error && (
        <p style={{ color: COLORS.red, fontSize: '12px', fontFamily: 'monospace' }}>
          {error.shortMessage || error.message}
        </p>
      )}
    </motion.div>
  )
}

// ─── Proposals List ───────────────────────────────────────────────

function ProposalsList({ address, eligible, refreshTrigger }) {
  const { data: totalData, refetch } = useReadContract({
    address: STAKING_GOVERNANCE_ADDRESS,
    abi: STAKING_GOVERNANCE_ABI,
    functionName: 'getTotalProposals',
  })

  useEffect(() => {
    refetch()
  }, [refreshTrigger])

  const total = totalData ? Number(totalData) : 0
  const proposalIds = Array.from({ length: total }, (_, i) => total - i)

  if (total === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center', padding: '48px 24px',
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: '12px',
        }}
      >
        <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>
          No proposals yet. {eligible ? 'Be the first to create one!' : 'Stake ETH to participate.'}
        </p>
      </motion.div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {proposalIds.map((id, i) => (
        <ProposalCard
          key={id}
          proposalId={id}
          address={address}
          eligible={eligible}
          delay={i * 0.05}
        />
      ))}
    </div>
  )
}

// ─── Main GovernanceContent ───────────────────────────────────────

export default function GovernanceContent() {
  const { address, isConnected } = useAccount()
  const { settings } = useSettings()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const { data: eligibilityData } = useReadContract({
    address: STAKING_GOVERNANCE_ADDRESS,
    abi: STAKING_GOVERNANCE_ABI,
    functionName: 'checkEligibility',
    args: [address],
    query: { enabled: !!address },
  })

  const eligible = eligibilityData?.[0] ?? false

  const handleProposalCreated = useCallback(() => {
    setRefreshTrigger(t => t + 1)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <GovBackground />

      {/* Content sits above background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <PageHeader
          title="Governance"
          subtitle="Stakers vote on protocol parameters, reward rates, and upgrades — voting power weighted by stake amount"
          badge="On-Chain Governance"
          badgeColor={COLORS.purple}
        />

        {/* Stats bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {[
            { label: 'Voting Period', value: '5 min', sub: 'Testnet optimized' },
            { label: 'Timelock Delay', value: '120s', sub: 'Before execution' },
            { label: 'Quorum', value: '0.001 ETH', sub: 'Min yes votes' },
            { label: 'Min Stake', value: '0.001 ETH', sub: 'To vote / propose' },
          ].map((stat, i) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              sub={stat.sub}
              delay={i * 0.08}
              compact={settings.compactMode}
            />
          ))}
        </div>

        {!isConnected ? (
          <ConnectPrompt />
        ) : (
          <>
            <EligibilityCard address={address} />
            <CreateProposalForm eligible={eligible} onSuccess={handleProposalCreated} />

            <div style={{ marginBottom: '16px' }}>
              <p style={{
                color: COLORS.textDim, fontSize: '12px',
                fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                All Proposals
              </p>
            </div>

            <ProposalsList
              address={address}
              eligible={eligible}
              refreshTrigger={refreshTrigger}
            />
          </>
        )}
      </div>
    </div>
  )
}
