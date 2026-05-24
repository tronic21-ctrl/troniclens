// Dashboard.jsx
// TronicLens — DeFi Staking Intelligence Cockpit
// All sections: Overview, Whale Activity, Staking Stats, Protocol Health, AI Insights, Alerts, Settings, About

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWhaleActivity } from '../hooks/useWhaleActivity'
import { useSettings } from '../context/SettingsContext'
import { COLORS } from '../utils/colors'
import AlertsContent from './Alerts'

// ─── Shared Components ───────────────────────────────────────────

function PageHeader({ title, subtitle, badge, badgeColor = COLORS.cyan }) {
  const { settings } = useSettings()
  const compact = settings.compactMode
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginBottom: compact ? '16px' : '32px' }}
    >
      {badge && (
        <span style={{
          display: 'inline-block',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
          color: badgeColor, textTransform: 'uppercase',
          border: `1px solid ${badgeColor}40`,
          padding: '3px 10px', borderRadius: '4px',
          backgroundColor: `${badgeColor}15`,
          marginBottom: compact ? '6px' : '10px',
        }}>
          {badge}
        </span>
      )}
      <h1 style={{
        fontSize: compact ? '22px' : '28px', fontWeight: 800,
        color: COLORS.text,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '-0.02em',
        marginBottom: '6px',
        transition: 'font-size 0.2s',
      }}>
        {title}
      </h1>
      <p style={{ color: COLORS.textMuted, fontSize: compact ? '12px' : '14px' }}>{subtitle}</p>
    </motion.div>
  )
}

function StatCard({ label, value, sub, accent = COLORS.cyan, delay = 0, icon }) {
  const { settings } = useSettings()
  const compact = settings.compactMode
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: compact ? '10px' : '16px',
        padding: compact ? '12px 16px' : '24px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'padding 0.2s, border-radius 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: accent || COLORS.cyan
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: compact ? '6px' : '12px' }}>
        <p style={{ color: COLORS.textMuted, fontSize: compact ? '10px' : '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {label}
        </p>
        {icon && <span style={{ fontSize: compact ? '14px' : '18px', opacity: 0.6 }}>{icon}</span>}
      </div>
      <p style={{ color: COLORS.text, fontSize: compact ? '20px' : '26px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: compact ? '2px' : '4px' }}>
        {value}
      </p>
      {sub && <p style={{ color: COLORS.textMuted, fontSize: compact ? '11px' : '13px' }}>{sub}</p>}
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
        padding: '4px 12px', borderRadius: '4px', marginBottom: '16px',
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

// ─── Settings UI Components ───────────────────────────────────────

// Toggle switch
function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: '44px', height: '24px',
        borderRadius: '12px',
        backgroundColor: value ? COLORS.cyan : COLORS.cardBorder,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        flexShrink: 0,
        boxShadow: value ? `0 0 8px ${COLORS.cyan}60` : 'none',
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: '2px',
          width: '20px', height: '20px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}
      />
    </div>
  )
}

// Option pill selector
function PillSelector({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const isSelected = opt.value === value
        return (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '5px 14px',
              borderRadius: '50px',
              border: isSelected ? `1px solid ${COLORS.cyan}60` : `1px solid ${COLORS.cardBorder}`,
              backgroundColor: isSelected ? COLORS.cyanDim : 'transparent',
              color: isSelected ? COLORS.cyan : COLORS.textDim,
              fontSize: '12px',
              fontWeight: isSelected ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </motion.button>
        )
      })}
    </div>
  )
}

// Settings row wrapper
function SettingRow({ label, description, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '16px 0',
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: '160px' }}>
        <p style={{ color: COLORS.text, fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
          {label}
        </p>
        {description && (
          <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>{description}</p>
        )}
      </div>
      <div style={{ flexShrink: 0, maxWidth: '100%' }}>
        {children}
      </div>
    </motion.div>
  )
}

// Settings card wrapper
function SettingsCard({ title, icon, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '16px',
        padding: '20px 24px',
      }}
    >
      <p style={{
        color: COLORS.text, fontSize: '13px', fontWeight: 700,
        letterSpacing: '0.05em', textTransform: 'uppercase',
        marginBottom: '4px',
        display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <span>{icon}</span> {title}
      </p>
      <div>
        {children}
      </div>
    </motion.div>
  )
}

// ─── Section: Settings ────────────────────────────────────────────

function SettingsContent() {
  const { settings, updateSetting, resetSettings } = useSettings()
  const [resetConfirm, setResetConfirm] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)

  // Flash "Saved" feedback setiap ada perubahan
  const handleUpdate = (key, value) => {
    updateSetting(key, value)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1500)
  }

  const handleReset = () => {
    if (resetConfirm) {
      resetSettings()
      setResetConfirm(false)
      setSaveFlash(true)
      setTimeout(() => setSaveFlash(false), 1500)
    } else {
      setResetConfirm(true)
      setTimeout(() => setResetConfirm(false), 3000)
    }
  }

  const handleManualRefresh = () => {
    window.dispatchEvent(new CustomEvent('troniclens:refresh'))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span style={{
              display: 'inline-block',
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
              color: COLORS.textDim, textTransform: 'uppercase',
              border: `1px solid ${COLORS.cardBorder}`,
              padding: '3px 10px', borderRadius: '4px',
              backgroundColor: `${COLORS.cardBorder}40`,
              marginBottom: '10px',
            }}>
              Preferences
            </span>
            <h1 style={{
              fontSize: '28px', fontWeight: 800,
              color: COLORS.text,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}>
              Settings
            </h1>
            <p style={{ color: COLORS.textMuted, fontSize: '14px' }}>
              Customize your TronicLens dashboard experience
            </p>
          </motion.div>
        </div>

        {/* Auto-save indicator */}
        <AnimatePresence>
          {saveFlash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '50px',
                backgroundColor: COLORS.greenDim,
                border: `1px solid ${COLORS.green}40`,
                fontSize: '12px', fontWeight: 600, color: COLORS.green,
              }}
            >
              ✓ Saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Dashboard Preferences */}
        <SettingsCard title="Dashboard" icon="" delay={0.1}>
          <SettingRow
            label="Auto Refresh"
            description="Automatically fetch new data from The Graph"
            delay={0.15}
          >
            <Toggle
              value={settings.autoRefresh}
              onChange={(v) => handleUpdate('autoRefresh', v)}
            />
          </SettingRow>

          <SettingRow
            label="Refresh Interval"
            description={settings.autoRefresh ? 'How often data is updated' : 'Enable auto refresh to use this'}
            delay={0.2}
          >
            <PillSelector
              options={[
                { label: '15s', value: 15 },
                { label: '30s', value: 30 },
                { label: '60s', value: 60 },
              ]}
              value={settings.refreshInterval}
              onChange={(v) => handleUpdate('refreshInterval', v)}
            />
          </SettingRow>
        </SettingsCard>

        {/* Whale Filter */}
        <SettingsCard title="Whale Detection" icon="" delay={0.2}>
          <SettingRow
            label="Whale Threshold"
            description="Minimum ETH to classify a wallet as whale"
            delay={0.25}
          >
            <PillSelector
              options={[
                { label: '0.05 ETH', value: 0.05 },
                { label: '0.1 ETH', value: 0.1 },
                { label: '0.5 ETH', value: 0.5 },
              ]}
              value={settings.whaleThreshold}
              onChange={(v) => handleUpdate('whaleThreshold', v)}
            />
          </SettingRow>
        </SettingsCard>

        {/* Display */}
        <SettingsCard title="Display" icon="" delay={0.3}>
          <SettingRow
            label="Compact Mode"
            description="Reduce spacing for a denser layout"
            delay={0.35}
          >
            <Toggle
              value={settings.compactMode}
              onChange={(v) => handleUpdate('compactMode', v)}
            />
          </SettingRow>
        </SettingsCard>

        {/* Data & Actions */}
        <SettingsCard title="Data" icon="" delay={0.4}>
          {/* Last row — no border bottom */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 0',
              borderBottom: `1px solid ${COLORS.cardBorder}`,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ color: COLORS.text, fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
                Manual Refresh
              </p>
              <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>
                Force fetch latest data from The Graph now
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleManualRefresh}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.cyan}40`,
                backgroundColor: COLORS.cyanDim,
                color: COLORS.cyan,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh Now
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '16px 0',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p style={{ color: COLORS.text, fontSize: '14px', fontWeight: 500, marginBottom: '2px' }}>
                Reset to Default
              </p>
              <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>
                Restore all settings to their original values
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: `1px solid ${resetConfirm ? COLORS.red + '60' : COLORS.cardBorder}`,
                backgroundColor: resetConfirm ? COLORS.redDim : 'transparent',
                color: resetConfirm ? COLORS.red : COLORS.textMuted,
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {resetConfirm ? 'Confirm Reset' : 'Reset'}
            </motion.button>
          </motion.div>
        </SettingsCard>

        {/* Current values summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{
            backgroundColor: `${COLORS.cyan}08`,
            border: `1px solid ${COLORS.cyan}20`,
            borderRadius: '8px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>Current:</span>
          <span style={{ color: COLORS.cyan, fontSize: '11px', fontWeight: 600 }}>
            Auto-refresh {settings.autoRefresh ? `every ${settings.refreshInterval}s` : 'OFF'}
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>·</span>
          <span style={{ color: COLORS.cyan, fontSize: '11px', fontWeight: 600 }}>
            Whale ≥ {settings.whaleThreshold} ETH
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>·</span>
          <span style={{ color: COLORS.cyan, fontSize: '11px', fontWeight: 600 }}>
            Compact {settings.compactMode ? 'ON' : 'OFF'}
          </span>
        </motion.div>

      </div>
    </div>
  )
}

// ─── Section: About ───────────────────────────────────────────────

function AboutContent() {
  const links = [
    {
      label: 'GitHub',
      url: 'https://github.com/tronic21-ctrl/troniclens',
      icon: <img src="/logos/GitHub_Invertocat_White.svg" alt="GitHub" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
    },
    {
      label: 'Portfolio',
      url: 'https://portofolio-riko-mu.vercel.app',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    },
    {
      label: 'ETHGlobal',
      url: 'https://ethglobal.com/events/ethonline2026',
      icon: <img src="/logos/ETHGlobal_Logomark_White.svg" alt="ETHGlobal" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
    },
    {
      label: 'Instagram',
      url: 'https://instagram.com/rikotronic',
      icon: <img src="/logos/Instagram_Glyph_White.svg" alt="Instagram" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
    },
  ]

  const stack = [
    { name: 'The Graph', desc: 'Subgraph indexing for staking events', logo: '/logos/The Graph - Logomark - Light.svg' },
    { name: 'Chainlink', desc: 'ETH/USD price feed on Sepolia', logo: '/logos/Chainlink-Symbol-White.svg' },
    { name: '0G Storage', desc: 'Decentralized on-chain data storage', logo: '/logos/0G-Logo-White.svg' },
    { name: '0G Compute', desc: 'Qwen2.5 AI inference — TEE verified', logo: '/logos/0G-Logo-White.svg' },
    { name: 'Ethereum', desc: 'Smart contracts on Sepolia testnet', logo: '/logos/eth-diamond-(color-filled).svg' },
    { name: 'OpenZeppelin', desc: 'ReentrancyGuard security library', logo: '/logos/OZ-Logo-FavIconColor.svg' },
  ]

  return (
    <div>
      <PageHeader
        title="About"
        subtitle="TronicLens — built for ETHOnline 2026"
        badge="Info"
        badgeColor={COLORS.textDim}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* About TronicLens */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '16px', padding: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <img src="/logos/troniclens-logo-transparent.svg" alt="TronicLens" style={{ width: '40px', height: '40px' }} />
            <div>
              <p style={{ color: COLORS.text, fontSize: '18px', fontWeight: 700 }}>TronicLens</p>
              <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>On-chain intelligence for stakers</p>
            </div>
          </div>
          <p style={{ color: COLORS.textMuted, fontSize: '13px', lineHeight: '1.7' }}>
            TronicLens is a DeFi analytics dashboard built for <span style={{ color: COLORS.cyan }}>ETHOnline 2026</span>.
            It combines on-chain data indexing, decentralized AI inference, and verifiable storage
            to deliver real-time staking intelligence — without any centralized backend.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ETHOnline 2026', 'Sepolia Testnet', 'Open Source'].map(tag => (
              <span key={tag} style={{
                fontSize: '11px', fontWeight: 600, color: COLORS.cyan,
                border: `1px solid ${COLORS.cyan}40`, backgroundColor: COLORS.cyanDim,
                padding: '3px 10px', borderRadius: '4px',
              }}>{tag}</span>
            ))}
          </div>
        </motion.div>

        {/* Builder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '16px', padding: '24px' }}
        >
          <p style={{ color: COLORS.text, fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Builder
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              border: `2px solid ${COLORS.cyan}40`,
              overflow: 'hidden', flexShrink: 0,
              backgroundColor: '#000',
            }}>
              <img
                src="/logos/RT-logo.png"
                alt="Riko Tronic"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <p style={{ color: COLORS.text, fontSize: '15px', fontWeight: 700 }}>Riko Tronic</p>
              <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>Economics Graduate · Web3 Developer</p>
              <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>Indonesia 🇮🇩</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            {links.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '10px',
                  backgroundColor: COLORS.bg, border: `1px solid ${COLORS.cardBorder}`,
                  color: COLORS.text, fontSize: '13px', fontWeight: 600,
                  textDecoration: 'none', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.cyan}
                onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.cardBorder}
              >
                <span style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{link.icon}</span>
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '16px', padding: '24px' }}
        >
          <p style={{ color: COLORS.text, fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px' }}>
            Powered By
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stack.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={item.logo} alt={item.name} style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
                <div>
                  <p style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>{item.name}</p>
                  <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Version */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', padding: '8px' }}
        >
          <p style={{ color: COLORS.textMuted, fontSize: '11px' }}>
            TronicLens v1.0.0 · Built for ETHOnline 2026 · Open Source
          </p>
        </motion.div>

      </div>
    </div>
  )
}

// ─── Section: Overview ────────────────────────────────────────────

function OverviewContent() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { settings } = useSettings()

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { activities, stats, chainlinkPrice, loading, error, formatTime, formatAddress, WHALE_THRESHOLD } = useWhaleActivity({
    refreshInterval: settings.autoRefresh ? settings.refreshInterval * 1000 : null,
    whaleThreshold: settings.whaleThreshold,
  })

  return (
    <div style={{ padding: settings.compactMode ? '0' : undefined }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: settings.compactMode ? '16px' : '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em',
              color: COLORS.cyan, textTransform: 'uppercase',
              border: `1px solid ${COLORS.cyan}40`,
              padding: '3px 10px', borderRadius: '4px',
              backgroundColor: COLORS.cyanDim,
            }}>
              Live
            </span>
            <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>
              {settings.autoRefresh ? `Refreshes every ${settings.refreshInterval}s` : 'Auto-refresh OFF'}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: COLORS.amber,
              padding: '2px 7px', borderRadius: '50px',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              Sepolia
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
            <img
              src="/logos/troniclens-logo-transparent.svg"
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

        {chainlinkPrice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '8px',
              padding: '14px 20px',
              textAlign: 'right',
              ...(isMobile ? { width: '100%' } : { minWidth: '200px', maxWidth: '280px' }),
            }}
          >
            <p style={{ color: COLORS.textMuted, fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
              <img src="/logos/Chainlink-Symbol-White.svg" alt="Chainlink" style={{ width: '12px', height: '12px', objectFit: 'contain', marginRight: '6px', verticalAlign: 'middle', opacity: 0.8 }} />
              Chainlink · {chainlinkPrice.pair}
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

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: settings.compactMode ? '8px' : '16px', marginBottom: settings.compactMode ? '16px' : '32px' }}>
          <StatCard label="Total Staked" value={`${stats.totalStaked} ETH`} sub={`$${stats.totalStakedUSD}`} accent={COLORS.cyan} delay={0.1} />
          <StatCard label="Active Stakers" value={stats.activeStakers} sub="unique addresses" accent={COLORS.green} delay={0.15}  />
          <StatCard label="Whale Wallets" value={stats.whaleCount} sub={`≥ ${settings.whaleThreshold} ETH threshold`} accent={COLORS.amber} delay={0.2} icon="" />
          <StatCard label="Avg Stake Size" value={`${stats.avgStakeSize} ETH`} sub="per staker" accent={COLORS.cyan} delay={0.25} icon="" />
        </div>
      )}

      <WhaleTable activities={activities} loading={loading} error={error} formatTime={formatTime} formatAddress={formatAddress} WHALE_THRESHOLD={settings.whaleThreshold} />
    </div>
  )
}

// ─── Section: Staking Activity ────────────────────────────────────

function WhaleActivityContent() {
  const { settings } = useSettings()
  const { activities, allActivities, loading, error, formatTime, formatAddress, WHALE_THRESHOLD } = useWhaleActivity({
    refreshInterval: settings.autoRefresh ? settings.refreshInterval * 1000 : null,
    whaleThreshold: settings.whaleThreshold,
  })

  // ── Simulate Whale — dev only ──────────────────────────────────
  const [simLoading, setSimLoading] = useState(false)
  const [simStatus, setSimStatus] = useState(null)

  const simulateWhale = async () => {
  if (!window.ethereum) return setSimStatus('❌ No wallet detected')
  try {
    setSimLoading(true)
    setSimStatus(null)
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const from = accounts[0]

    const STAKE_AMOUNT_WEI = BigInt('100000000000000000') // 0.1 ETH exact

    await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from,
        to: '0x89907e8F6CB6468b2c8fe2d3814249881eF06926',
        value: '0x' + STAKE_AMOUNT_WEI.toString(16),
        data: '0x3a4b66f1', // ✅ selector stake() dari Blockscout
      }],
    })
    setSimStatus('✅ Whale tx sent! Wait ~30s for The Graph to index...')
  } catch (err) {
    setSimStatus('❌ ' + (err.message || 'Transaction rejected'))
  } finally {
    setSimLoading(false)
  }
}

  return (
    <div>
      <PageHeader
        title="Staking Activity"
        subtitle="Live staking transactions on Sepolia · Powered by The Graph"
        badge="Live Feed"
        badgeColor={COLORS.cyan}
      />

      {/* Simulate Whale — only in dev */}
      {import.meta.env.DEV && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.amber}40`,
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <p style={{ color: COLORS.amber, fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
              🧪 Dev Mode — Simulate Whale Transaction
            </p>
            <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>
              Send 0.1 ETH stake to trigger whale detection · Only visible in localhost
            </p>
            {simStatus && (
              <p style={{ color: COLORS.textDim, fontSize: '12px', marginTop: '6px' }}>{simStatus}</p>
            )}
          </div>
          <button
            onClick={simulateWhale}
            disabled={simLoading}
            style={{
              backgroundColor: COLORS.amber,
              color: COLORS.bg,
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: simLoading ? 'not-allowed' : 'pointer',
              opacity: simLoading ? 0.7 : 1,
              flexShrink: 0,
            }}
          >
            {simLoading ? 'Sending...' : '🐋 Simulate Whale'}
          </button>
        </motion.div>
      )}

      <WhaleTable activities={activities} loading={loading} error={error} formatTime={formatTime} formatAddress={formatAddress} WHALE_THRESHOLD={settings.whaleThreshold} />
      <div style={{ marginTop: '24px' }}>
        <WhaleTable
          activities={allActivities}
          loading={loading}
          error={error}
          formatTime={formatTime}
          formatAddress={formatAddress}
          WHALE_THRESHOLD={settings.whaleThreshold}
          title="All Transactions"
          subtitle="Complete staking history · Powered by The Graph"
          showAll={true}
        />
      </div>
    </div>
  )
}

// ─── Section: Staking Stats ───────────────────────────────────────

function StakingStatsContent() {
  const { settings } = useSettings()
  const { stats } = useWhaleActivity({
    refreshInterval: settings.autoRefresh ? settings.refreshInterval * 1000 : null,
    whaleThreshold: settings.whaleThreshold,
  })

  return (
    <div>
      <PageHeader
        title="Staking Stats"
        subtitle="Protocol-level staking metrics and performance indicators"
        badge="Analytics"
        badgeColor={COLORS.green}
      />

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: settings.compactMode ? '8px' : '16px', marginBottom: settings.compactMode ? '16px' : '32px' }}>
          <StatCard label="Total Value Locked" value={`${stats.totalStaked} ETH`} sub={`$${stats.totalStakedUSD}`} accent={COLORS.cyan} delay={0.05} />
          <StatCard label="Active Stakers" value={stats.activeStakers} sub="unique addresses" accent={COLORS.green} delay={0.1} />
          <StatCard label="Whale Wallets" value={stats.whaleCount} sub={`≥ ${settings.whaleThreshold} ETH`} accent={COLORS.amber} delay={0.15} icon="" />
          <StatCard label="Avg Stake Size" value={`${stats.avgStakeSize} ETH`} sub="per wallet" accent={COLORS.purple} delay={0.2} icon="" />
          <StatCard label="ETH Price" value={`$${stats.ethPrice}`} sub="via Chainlink feed" accent={COLORS.cyan} delay={0.25} icon={<img src="/logos/Chainlink-Symbol-White.svg" alt="Chainlink" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />} />
          <StatCard label="Retail Stakers" value={stats.activeStakers - stats.whaleCount} sub={`< ${settings.whaleThreshold} ETH threshold`} accent={COLORS.green} delay={0.3} />
        </div>
      )}

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
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: COLORS.amber, fontSize: '13px' }}>Whale ({stats.whaleCount})</span>
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
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: COLORS.cyan, fontSize: '13px' }}>Retail ({stats.activeStakers - stats.whaleCount})</span>
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

// ─── Section: Protocol Health ─────────────────────────────────────

function ProtocolHealthContent() {
  const { settings } = useSettings()
  const [lastSnapshot, setLastSnapshot] = useState(null)

  useEffect(() => {
    fetch('/og-snapshots.json')
      .then(res => res.json())
      .then(data => { if (data.length > 0) setLastSnapshot(data[0]) })
      .catch(() => {})
  }, [])

  const healthChecks = [
    { 
      label: 'StakingContract', 
      status: 'Healthy', 
      detail: '0x89907e8F6CB6468b2c8fe2d3814249881eF06926',
      link: 'https://eth-sepolia.blockscout.com/address/0x89907e8F6CB6468b2c8fe2d3814249881eF06926',
      color: COLORS.green, 
      logo: '/logos/eth-diamond-(color-filled).svg' 
    },
    { label: 'ReentrancyGuard', status: 'Active', detail: 'OpenZeppelin v5.6.1', color: COLORS.green, logo: '/logos/OZ-Logo-FavIconColor.svg' },
    { label: 'The Graph Subgraph', status: 'Synced', detail: 'tronic-staking · v0.0.2 · 100%', color: COLORS.green, logo: '/logos/The Graph - Logomark - Light.svg' },
    { label: 'Chainlink Feed', status: 'Live', detail: 'ETH/USD · Sepolia · 8 decimals', color: COLORS.cyan, logo: '/logos/Chainlink-Symbol-White.svg' },
    {
      label: '0G Storage', status: 'Connected',
      detail: lastSnapshot
        ? `Last snapshot: ${new Date(lastSnapshot.timestamp).toLocaleString('id-ID')} · ${lastSnapshot.rootHash.slice(0, 10)}...`
        : 'Galileo Testnet · ChainID 16602',
      color: COLORS.purple, logo: '/logos/0G-Logo-White.svg',
    },
    { label: 'GovernanceContract', status: 'Deployed', detail: 'Sepolia · timelock 120s', color: COLORS.green, logo: '/logos/eth-diamond-(color-filled).svg' },
  ]

  return (
    <div>
      <PageHeader
        title="Protocol Health"
        subtitle="Real-time status of all TronicLens smart contracts and integrations"
        badge="On-chain"
        badgeColor={COLORS.green}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: settings.compactMode ? '6px' : '12px' }}>
        {healthChecks.map((check, i) => (
          <motion.div
            key={check.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '8px',
              padding: settings.compactMode ? '12px 20px' : '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={check.logo} alt={check.label} style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: 0.9 }} />
              <div>
                <p style={{ color: COLORS.text, fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{check.label}</p>
                <p style={{ color: COLORS.textMuted, fontSize: '12px', fontFamily: 'monospace' }}>
                  {check.link ? (
                    <span
                      onClick={() => window.open(check.link, '_blank')}
                      style={{
                        color: COLORS.cyan,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted',
                        textUnderlineOffset: '3px',
                      }}
                      title="View on Blockscout"
                    >
                      {check.detail.length > 30 ? `${check.detail.slice(0, 10)}...${check.detail.slice(-6)}` : check.detail}
                    </span>
                  ) : check.label === '0G Storage' && lastSnapshot ? (
                    // existing 0G Storage logic tidak berubah
                    <>
                      {`Last snapshot: ${new Date(lastSnapshot.timestamp).toLocaleString('id-ID')} · `}
                      <span
                        onClick={() => window.open(
                          lastSnapshot.sequence
                            ? `https://storagescan-galileo.0g.ai/submission/${lastSnapshot.sequence}`
                            : 'https://storagescan-galileo.0g.ai',
                          '_blank'
                        )}
                        style={{ color: COLORS.cyan, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}
                        title="View on 0G Explorer"
                      >
                        {lastSnapshot.rootHash.slice(0, 10)}...
                      </span>
                    </>
                  ) : check.detail}
                </p>
              </div>
            </div>
            <span style={{
              fontSize: '12px', fontWeight: 600, color: check.color,
              border: `1px solid ${check.color}40`, backgroundColor: `${check.color}15`,
              padding: '4px 12px', borderRadius: '4px',
            }}>
              {check.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: AI Insights ─────────────────────────────────────────

function AIInsightsContent() {
  const [insights, setInsights] = useState(null)
  const [allSnapshots, setAllSnapshots] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetch('/og-snapshots.json')
      .then(res => res.json())
      .then(data => {
        setAllSnapshots(data)
        const aiSnap = data.find(s => s.type === 'ai-insights')
        if (aiSnap) {
          setInsights(aiSnap)
          setLastUpdated(new Date(aiSnap.timestamp))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const sentimentColor = {
    'Bullish': COLORS.green,
    'Neutral': COLORS.amber,
    'Bearish': COLORS.red,
  }

  const healthColor = (score) => {
    if (score >= 70) return COLORS.green
    if (score >= 40) return COLORS.amber
    return COLORS.red
  }

  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="0G Compute-powered Qwen2.5 analysis — whale patterns, protocol health, and staker intelligence stored on-chain"
        badge="0G Compute"
        badgeColor={COLORS.purple}
      />

      {loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 0', color: COLORS.textMuted }}>
          <p style={{ fontSize: '14px' }}>Loading AI analysis...</p>
        </motion.div>
      ) : !insights ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '16px', padding: '48px', textAlign: 'center' }}
        >
          <p style={{ color: COLORS.text, fontWeight: 700, marginBottom: '8px' }}>No AI analysis yet</p>
          <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>
            Run <code style={{ color: COLORS.cyan }}>node ai-insights.mjs</code> to generate your first analysis
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <StatCard
              label="Protocol Health Score"
              value={`${insights.healthScore}/100`}
              sub="Based on staking activity"
              accent={healthColor(insights.healthScore)}
              icon={
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  border: `3px solid ${healthColor(insights.healthScore)}`,
                  backgroundColor: `${healthColor(insights.healthScore)}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px',
                  boxShadow: `0 0 10px ${healthColor(insights.healthScore)}60`,
                }}>
                  {insights.healthScore >= 70 ? '✓' : insights.healthScore >= 40 ? '!' : '✕'}
                </div>
              }
            />
            <StatCard
              label="Market Sentiment"
              value={insights.sentiment}
              sub="Qwen2.5 analysis"
              accent={sentimentColor[insights.sentiment] || COLORS.amber}
              icon={
                <div style={{
                  width: '28px', height: '28px',
                  borderRadius: '50%',
                  border: `3px solid ${sentimentColor[insights.sentiment] || COLORS.amber}`,
                  backgroundColor: `${sentimentColor[insights.sentiment] || COLORS.amber}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px',
                  boxShadow: `0 0 10px ${sentimentColor[insights.sentiment] || COLORS.amber}60`,
                }}>
                  {insights.sentiment === 'Bullish' ? '↑' : insights.sentiment === 'Bearish' ? '↓' : '-'}
                </div>
              }
            />
            <StatCard label="Last Analysis" value={lastUpdated ? lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} sub={lastUpdated ? lastUpdated.toLocaleDateString('id-ID') : '-'} accent={COLORS.purple} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.purple}40`, borderRadius: '16px', padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src="/logos/0G-Logo-White.svg" alt="0G" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                <div>
                  <p style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>AI Result stored on 0G Network</p>
                  <p style={{ color: COLORS.textMuted, fontSize: '11px', fontFamily: 'monospace' }}>
                    {'Root Hash: '}
                    <span
                      onClick={() => window.open(insights.sequence ? `https://storagescan-galileo.0g.ai/submission/${insights.sequence}` : 'https://storagescan-galileo.0g.ai', '_blank')}
                      style={{ color: COLORS.cyan, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                    >
                      {insights.rootHash?.slice(0, 18)}...
                    </span>
                    {insights.sequence && <span style={{ color: COLORS.textMuted }}>{` · txSeq: ${insights.sequence}`}</span>}
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: COLORS.purple, border: `1px solid ${COLORS.purple}40`, backgroundColor: `${COLORS.purple}15`, padding: '4px 12px', borderRadius: '4px' }}>
                ✓ On-chain Verified
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '16px', padding: '20px 24px' }}
          >
            <p style={{ color: COLORS.text, fontSize: '13px', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Analysis History
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allSnapshots.map((snap, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: i === 0 ? `${COLORS.purple}10` : 'transparent',
                  border: `1px solid ${i === 0 ? COLORS.purple + '30' : COLORS.cardBorder}`,
                  borderRadius: '10px',
                  flexWrap: 'wrap', gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {snap.type === 'ai-insights'
                        ? <img src="/logos/0G-Logo-White.svg" alt="0G" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                        : <img src="/logos/The Graph - Logomark - Light.svg" alt="Snapshot" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                      }
                    </span>
                    <div>
                      <p style={{ color: COLORS.text, fontSize: '12px', fontWeight: 600 }}>
                        {snap.type === 'ai-insights' ? 'AI Insights' : 'Whale Snapshot'}
                        {i === 0 && (
                        <span style={{ color: COLORS.purple, marginLeft: '8px', fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <motion.span
                            animate={{ opacity: [1, 0.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: COLORS.purple, display: 'inline-block', flexShrink: 0 }}
                          />
                          LATEST
                        </span>
                      )}
                      </p>
                      <p style={{ color: COLORS.textMuted, fontSize: '11px', fontFamily: 'monospace' }}>
                        {new Date(snap.timestamp).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {snap.sentiment && (
                      <span style={{
                        fontSize: '11px', fontWeight: 600,
                        color: sentimentColor[snap.sentiment] || COLORS.amber,
                        border: `1px solid ${(sentimentColor[snap.sentiment] || COLORS.amber)}40`,
                        backgroundColor: `${(sentimentColor[snap.sentiment] || COLORS.amber)}15`,
                        padding: '2px 8px', borderRadius: '4px',
                      }}>
                        {snap.sentiment}
                      </span>
                    )}
                    <span
                      onClick={() => snap.sequence && window.open(`https://storagescan-galileo.0g.ai/submission/${snap.sequence}`, '_blank')}
                      style={{
                        color: COLORS.cyan, fontSize: '11px', fontFamily: 'monospace',
                        cursor: snap.sequence ? 'pointer' : 'default',
                        textDecoration: snap.sequence ? 'underline' : 'none',
                        textDecorationStyle: 'dotted',
                      }}
                    >
                      {snap.rootHash?.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: 'center', padding: '8px' }}>
            <p style={{ color: COLORS.textMuted, fontSize: '11px' }}>
              Powered by <span style={{ color: COLORS.purple }}>0G Compute Network</span>
              {' · '}<span style={{ color: COLORS.cyan }}>Qwen2.5-7b-instruct</span>
              {' · TEE Verified'}
            </p>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ─── Shared: Whale Table ──────────────────────────────────────────

function WhaleTable({ activities, loading, error, formatTime, formatAddress, WHALE_THRESHOLD, title, subtitle }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ backgroundColor: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '16px', overflow: 'hidden' }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
        padding: '20px 24px 16px',
        borderBottom: `1px solid ${COLORS.cardBorder}`,
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: COLORS.text, marginBottom: '2px' }}>
            {title || (
              <>
                <img src="/logos/The Graph - Logomark - Light.svg" alt="The Graph" style={{ width: '16px', height: '16px', objectFit: 'contain', marginRight: '8px', verticalAlign: 'middle' }} />
                Whale Activity Feed
              </>
            )}
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: '12px' }}>
            {subtitle || `Transactions ≥ ${WHALE_THRESHOLD} ETH · Powered by The Graph`}
          </p>
        </div>
        <span style={{ 
          fontSize: '11px', fontWeight: 600, color: COLORS.green, 
          border: `1px solid ${COLORS.green}40`, backgroundColor: COLORS.greenDim, 
          padding: '4px 10px', borderRadius: '4px',
          display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ 
              width: '6px', height: '6px', borderRadius: '50%', 
              backgroundColor: COLORS.green, display: 'inline-block', flexShrink: 0
            }}
          />
          Live Data
        </span>
      </div>

      {!isMobile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(80px, 2fr) minmax(60px, 1fr) minmax(70px, 1.5fr) minmax(50px, 1fr)',
          padding: '10px 24px',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
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
      )}

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
      style={{ padding: '12px 16px', borderBottom: `1px solid ${COLORS.cardBorder}`, cursor: 'default' }}
      whileHover={{ backgroundColor: '#0e2040' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: actionColor, boxShadow: `0 0 8px ${actionColor}`, flexShrink: 0 }} />
          <span
            style={{ color: COLORS.cyan, fontSize: '12px', fontFamily: 'monospace', cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '3px' }}
            onClick={() => window.open(`https://eth-sepolia.blockscout.com/address/${tx.address}`, '_blank')}
          >
            {formatAddress(tx.address)}
          </span>
        </div>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', padding: '3px 10px', borderRadius: '4px', backgroundColor: actionBg, color: actionColor, border: `1px solid ${actionColor}40`, flexShrink: 0 }}>
          {tx.action}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '16px' }}>
        <div>
          <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>{tx.amount} ETH</span>
          <span style={{ color: COLORS.textMuted, fontSize: '12px', marginLeft: '6px' }}>${tx.amountUSD}</span>
        </div>
        <span style={{ color: COLORS.textMuted, fontSize: '12px' }}>{formatTime(tx.timestamp)}</span>
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
  // Reset scroll ke top setiap ganti halaman
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeItem])

  const renderContent = () => {
    switch (activeItem) {
      case 'overview':  return <OverviewContent />
      case 'whale':     return <WhaleActivityContent />
      case 'staking':   return <StakingStatsContent />
      case 'protocol':  return <ProtocolHealthContent />
      case 'ai':        return <AIInsightsContent />
      case 'alerts':    return <AlertsContent />
      case 'settings':  return <SettingsContent />
      case 'about':     return <AboutContent />
      default:          return <OverviewContent />
    }
  }

  const { settings } = useSettings()

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      padding: settings.compactMode ? '20px 24px' : '32px 40px',
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

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          textAlign: 'center', color: COLORS.textMuted,
          fontSize: '12px', marginTop: settings.compactMode ? '24px' : '48px',
        }}
      >
        TronicLens · Built for ETHOnline 2026 · Powered by The Graph + Chainlink + 0G
      </motion.p>
    </div>
  )
}

export default Dashboard
