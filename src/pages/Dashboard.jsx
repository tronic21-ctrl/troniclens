// Dashboard.jsx
// TronicLens — DeFi Staking Intelligence Cockpit
// All sections: Overview, Whale Activity, Staking Stats, Protocol Health, AI Insights, Alerts, Settings, About

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWhaleActivity } from '../hooks/useWhaleActivity'
import { useSettings } from '../context/SettingsContext'
import { COLORS } from '../utils/colors'
import { useAccount } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import AlertsContent from './Alerts'
import GovernanceContent from './Governance'
import StakeActionContent from './StakeAction'

// ─── Shared Components ───────────────────────────────────────────

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { open } = useAppKit()

  return isConnected ? (
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: '0 0 16px #10b98125' }}
      whileTap={{ scale: 0.97 }}
      onClick={() => open({ view: 'Account' })}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '7px 14px',
        background: 'linear-gradient(135deg, #10b98115, #10b98108)',
        border: '1px solid #10b98135',
        borderRadius: '8px',
        cursor: 'pointer',
      }}
    >
      <motion.div
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0, marginRight: '4px' }}
      />
      <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, fontFamily: 'monospace', letterSpacing: '0.03em' }}>
        {`${address.slice(0, 6)}...${address.slice(-4)}`}
      </span>
    </motion.button>
  ) : (
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: '0 0 20px #818cf830' }}
      whileTap={{ scale: 0.97 }}
      onClick={() => open()}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '7px 16px',
        background: 'linear-gradient(135deg, #818cf8, #38bdf8)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 0 20px #818cf840',
      }}
    >
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '40%', height: '100%',
          background: 'linear-gradient(90deg, transparent, #ffffff08, transparent)',
          pointerEvents: 'none',
        }}
      />
      <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, letterSpacing: '0.04em' }}>
        Connect Wallet
      </span>
    </motion.button>
  )
}

function PageBackground({ accentColor = '#38bdf8', accentColor2 = '#818cf8' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 0,
      overflow: 'hidden',
    }}>
      <motion.div
        animate={{ opacity: [0.15, 0.28, 0.15], scale: [1, 1.07, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-120px', right: '-80px',
          width: '460px', height: '460px', borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor}28 0%, ${accentColor}08 50%, transparent 70%)`,
          filter: 'blur(48px)',
          willChange: 'transform, opacity',
        }}
      />
      <motion.div
        animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        style={{
          position: 'absolute', bottom: '-100px', left: '80px',
          width: '380px', height: '380px', borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor2}20 0%, ${accentColor2}08 50%, transparent 70%)`,
          filter: 'blur(56px)',
          willChange: 'transform, opacity',
        }}
      />
      <motion.div
        animate={{ opacity: [0.05, 0.11, 0.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{
          position: 'absolute', top: '35%', left: '35%',
          width: '500px', height: '260px', borderRadius: '50%',
          background: `radial-gradient(ellipse, ${accentColor}12 0%, transparent 70%)`,
          filter: 'blur(60px)',
          willChange: 'opacity',
        }}
      />
    </div>
  )
}

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
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
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
          background: accent || COLORS.cyan, opacity: 0.7,
        }} />
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: delay * 1.5 }}
          style={{
            position: 'absolute', top: 0, left: 0,
            width: '40%', height: '1px',
            background: 'linear-gradient(90deg, transparent, #ffffff90, transparent)',
            pointerEvents: 'none',
          }}
        />
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
            TronicLens v1.4.0 · Built for ETHOnline 2026 · Open Source
          </p>
        </motion.div>

      </div>
    </div>
  )
}

// ─── Onboarding Popup ─────────────────────────────────────────────

function OnboardingPopup({ onClose }) {
  const [step, setStep] = useState(0)
  const steps = [
    {
      badge: 'TESTNET',
      badgeColor: '#f59e0b',
      title: 'Running on Sepolia',
      desc: 'TronicLens is deployed on Ethereum Sepolia Testnet. All transactions use test ETH — no real money involved.',
      hint: 'Need Sepolia ETH? Get it free from sepoliafaucet.com',
      hintIcon: '⛽',
      gradientTo: '#ef4444',
    },
    {
      badge: 'WALLET',
      badgeColor: '#38bdf8',
      title: 'Add Sepolia to Your Wallet',
      desc: 'Open MetaMask or Rabby → Add Network → search "Sepolia". Without it, transactions will fail.',
      hint: 'Chain ID: 11155111  ·  RPC: rpc.sepolia.org',
      hintIcon: '🔗',
      gradientTo: '#818cf8',
    },
    {
      badge: 'STAKING ACTIVITY',
      badgeColor: '#38bdf8',
      title: 'Live Whale Tracker',
      desc: 'Monitor real-time staking transactions on Sepolia. Powered by The Graph — a decentralized indexing protocol that indexes on-chain events.',
      hint: 'Transactions ≥ threshold are flagged as whale activity',
      hintIcon: '🐋',
      gradientTo: '#0ea5e9',
    },
    {
      badge: 'AI INSIGHTS',
      badgeColor: '#818cf8',
      title: 'On-Chain AI Analysis',
      desc: 'AI commentary on staking data generated by 0G Compute — a decentralized AI inference network. Insights are stored on 0G Storage.',
      hint: 'Model: qwen/qwen2.5-omni-7b via 0G router-api-testnet',
      hintIcon: '🤖',
      gradientTo: '#6366f1',
    },
    {
      badge: 'SMART ALERTS',
      badgeColor: '#f59e0b',
      title: 'Real-Time Alerts',
      desc: 'Get notified of whale movements and ETH price changes. ETH/USD price is fetched live from Chainlink — a decentralized oracle network.',
      hint: 'Price feed: Chainlink ETH/USD on Sepolia',
      hintIcon: '🔔',
      gradientTo: '#ef4444',
    },
    {
      badge: 'PROTOCOL HEALTH',
      badgeColor: '#10b981',
      title: 'Protocol Health Monitor',
      desc: 'Track the overall health of TronicLens protocol — TVL, staker distribution, reward rates, and live contract status all in one view.',
      hint: 'All data sourced directly from on-chain contracts',
      hintIcon: '📊',
      gradientTo: '#0d9488',
    },
    {
      badge: 'HOW IT WORKS',
      badgeColor: '#10b981',
      title: 'Stake → Vote → Govern',
      desc: 'Stake testnet ETH to earn rewards and unlock voting power. Then create or vote on on-chain Governance proposals.',
      hint: 'Your stake amount determines your voting weight',
      hintIcon: '⚖️',
      gradientTo: '#38bdf8',
    },
  ]
  const isLast = step === steps.length - 1
  const current = steps[step]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'rgba(10, 22, 40, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          maxWidth: '440px',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 32px rgba(56, 189, 248, 0.02)',
        }}
      >
        {/* Visual area */}
        <div style={{
          height: '150px',
          background: 'linear-gradient(135deg, #060d19 0%, #0d1e33 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        }}>
          {/* Decorative glowing blobs */}
          <div style={{
            position: 'absolute',
            width: '180px', height: '180px', borderRadius: '50%',
            background: `radial-gradient(circle, ${current.badgeColor}1c 0%, transparent 70%)`,
            filter: 'blur(20px)',
            top: '-50px',
            transition: 'background 0.4s ease',
          }} />

          <motion.div
            key={step}
            initial={{ scale: 0.75, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            style={{
              width: '72px', height: '72px', borderRadius: '22px',
              background: `linear-gradient(135deg, ${current.badgeColor}20, ${current.badgeColor}05)`,
              border: `1px solid ${current.badgeColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 24px ${current.badgeColor}15, inset 0 1px 1px rgba(255,255,255,0.1)`,
            }}
          >
            {step === 0 ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={current.badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              ) : step === 1 ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={current.badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                </svg>
              ) : step === 2 ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={current.badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12C22 12 19 7 12 7C5 7 2 12 2 12"/>
                  <path d="M2 12C2 12 5 17 12 17C19 17 22 12 22 12"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : step === 3 ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={current.badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
                </svg>
              ) : step === 4 ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={current.badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              ) : step === 5 ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={current.badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={current.badgeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="22" x2="21" y2="22"/>
                  <line x1="6" y1="18" x2="6" y2="11"/>
                  <line x1="10" y1="18" x2="10" y2="11"/>
                  <line x1="14" y1="18" x2="14" y2="11"/>
                  <line x1="18" y1="18" x2="18" y2="11"/>
                  <polygon points="12 2 20 7 4 7"/>
                </svg>
              )}
          </motion.div>

          {/* Progress / Step dots */}
          <div style={{
            position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '8px',
          }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === step ? '24px' : '8px', height: '8px',
                borderRadius: '4px',
                backgroundColor: i === step ? current.badgeColor : 'rgba(255,255,255,0.15)',
                boxShadow: i === step ? `0 0 10px ${current.badgeColor}b0` : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 24px 24px' }}>
          <motion.div
            key={step + 'c'}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              color: current.badgeColor,
              textTransform: 'uppercase',
              border: `1px solid ${current.badgeColor}35`,
              background: `linear-gradient(135deg, ${current.badgeColor}15, ${current.badgeColor}03)`,
              padding: '3px 10px', borderRadius: '50px',
              display: 'inline-block', marginBottom: '12px',
              boxShadow: `0 0 8px ${current.badgeColor}08`,
            }}>
              {current.badge}
            </span>
            <h3 style={{
              color: '#f8fafc',
              fontSize: '20px',
              fontWeight: 800,
              marginBottom: '10px',
              lineHeight: 1.3,
              fontFamily: "'Outfit', 'DM Sans', sans-serif",
              letterSpacing: '-0.01em',
            }}>
              {current.title}
            </h3>
            <p style={{
              color: '#94a3b8',
              fontSize: '13.5px',
              lineHeight: '1.65',
              marginBottom: '20px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {current.desc}
            </p>

            {/* Hint Box - Clean, minimal alert box without emoji or left accent */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 13, 26, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              marginBottom: '24px',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
            }}>
              <span style={{
                color: '#94a3b8',
                fontSize: '12px',
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1.5,
              }}>
                {current.hint}
              </span>
            </div>
          </motion.div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {step > 0 && (
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(s => s - 1)}
                style={{
                  flex: '1 1 30%', padding: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px', color: '#94a3b8',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'border-color 0.2s, color 0.2s',
                }}
              >
                Back
              </motion.button>
            )}
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: `0 8px 24px ${current.badgeColor}25`,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => isLast ? onClose() : setStep(s => s + 1)}
              style={{
                flex: step > 0 ? '1 1 70%' : '1', padding: '12px',
                background: `linear-gradient(135deg, ${current.badgeColor}, ${current.gradientTo})`,
                border: 'none', borderRadius: '12px',
                color: '#ffffff', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
                boxShadow: `0 4px 12px ${current.badgeColor}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}
            >
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, left: 0,
                  width: '40%', height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent)',
                  pointerEvents: 'none',
                }}
              />
              <span>{isLast ? "Let's Explore" : 'Continue'}</span>
              <span style={{ fontSize: '14px' }}>→</span>
            </motion.button>
          </div>

          {/* Skip Intro */}
          {!isLast && (
            <button
              onClick={onClose}
              style={{
                width: '100%', marginTop: '12px', padding: '6px',
                background: 'none', border: 'none',
                color: '#64748b', fontSize: '12px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              Skip intro
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Section: Overview ────────────────────────────────────────────

function OverviewContent() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !sessionStorage.getItem('troniclens_onboarding_seen')
  })
  const handleCloseOnboarding = () => {
    sessionStorage.setItem('troniclens_onboarding_seen', '1')
    setShowOnboarding(false)
  }
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
      <AnimatePresence>
        {showOnboarding && <OnboardingPopup key="onboarding" onClose={handleCloseOnboarding} />}
      </AnimatePresence>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: settings.compactMode ? '16px' : '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: COLORS.cyan,
              textTransform: 'uppercase',
              border: `1px solid ${COLORS.cyan}35`,
              padding: '3px 12px',
              borderRadius: '50px',
              background: `linear-gradient(135deg, ${COLORS.cyan}1a, ${COLORS.cyan}05)`,
              boxShadow: `0 0 12px ${COLORS.cyan}10`,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              whiteSpace: 'nowrap',
            }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: COLORS.cyan,
                  boxShadow: `0 0 8px ${COLORS.cyan}`,
                  display: 'inline-block', flexShrink: 0,
                }}
              />
              Live · Sepolia
            </span>
            <span style={{ color: COLORS.textMuted, fontSize: '12px', whiteSpace: 'nowrap' }}>
              {settings.autoRefresh ? `Refreshes every ${settings.refreshInterval}s` : 'Auto-refresh OFF'}
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
          <StatCard label="Active Stakers" value={stats.activeStakers} sub="unique addresses" accent={COLORS.cyan} delay={0.15}  />
          <StatCard label="Whale Wallets" value={stats.whaleCount} sub={`≥ ${settings.whaleThreshold} ETH threshold`} accent={COLORS.cyan} delay={0.2} icon="" />
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
  return (
    <div>
      <PageHeader
        title="Staking Activity"
        subtitle="Live staking transactions on Sepolia · Powered by The Graph"
        badge="Live Feed"
        badgeColor={COLORS.cyan}
      />

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
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
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: settings.compactMode ? '8px' : '16px', marginBottom: settings.compactMode ? '16px' : '32px' }}>
          <StatCard label="Total Value Locked" value={`${stats.totalStaked} ETH`} sub={`$${stats.totalStakedUSD}`} accent={COLORS.green} delay={0.05} />
          <StatCard label="Active Stakers" value={stats.activeStakers} sub="unique addresses" accent={COLORS.green} delay={0.1} />
          <StatCard label="Whale Wallets" value={stats.whaleCount} sub={`≥ ${settings.whaleThreshold} ETH`} accent={COLORS.green} delay={0.15} icon="" />
          <StatCard label="Avg Stake Size" value={`${stats.avgStakeSize} ETH`} sub="per wallet" accent={COLORS.green} delay={0.2} icon="" />
          <StatCard label="ETH Price" value={`$${stats.ethPrice}`} sub="via Chainlink feed" accent={COLORS.green} delay={0.25} />
          <StatCard label="Retail Stakers" value={stats.activeStakers - stats.whaleCount} sub={`< ${settings.whaleThreshold} ETH threshold`} accent={COLORS.green} delay={0.3} />
        </div>
      )}

      {stats && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          backgroundColor: '#060d1a',
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '14px 20px',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: '#040a14',
        }}>
          <h3 style={{ color: COLORS.text, fontSize: '15px', fontWeight: 600, margin: 0 }}>
            Staker Distribution
          </h3>
        </div>
        <div style={{ padding: '20px 24px' }}>
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
                  style={{ height: '100%', backgroundColor: COLORS.amber, borderRadius: '4px', position: 'relative', overflow: 'hidden' }}
                >
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.8 }}
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      width: '40%', height: '100%',
                      background: 'linear-gradient(90deg, transparent, #ffffff40, transparent)',
                      pointerEvents: 'none',
                    }}
                  />
                </motion.div>
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    { 
      label: 'GovernanceContract', 
      status: 'Healthy', 
      detail: '0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8',
      link: 'https://eth-sepolia.blockscout.com/address/0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8',
      color: COLORS.green, 
      logo: '/logos/eth-diamond-(color-filled).svg' 
    },
    { 
      label: 'StakingGovernance', 
      status: 'Healthy', 
      detail: '0xa830b86ce9D994A3c5b95F124c9a008e74b75080',
      link: 'https://eth-sepolia.blockscout.com/address/0xa830b86ce9D994A3c5b95F124c9a008e74b75080',
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
  ]

  return (
    <div>
      <PageHeader
        title="Protocol Health"
        subtitle="Real-time status of all TronicLens smart contracts and integrations"
        badge="On-Chain"
        badgeColor={COLORS.green}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: settings.compactMode ? '8px' : '14px' }}>
        {healthChecks.map((check, i) => (
          <motion.div
            key={check.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '14px',
              padding: settings.compactMode ? '14px 20px' : '20px 24px',
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
            whileHover={{
              backgroundColor: `${COLORS.card}ef`,
              borderColor: `${check.color}30`,
              boxShadow: `inset 4px 0 0 ${check.color}, 0 8px 32px rgba(0,0,0,0.35), 0 0 16px ${check.color}05`,
              paddingLeft: settings.compactMode ? '24px' : '28px', // slide-in for human touch!
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                backgroundColor: `${check.color}0a`,
                border: `1px solid ${check.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img src={check.logo} alt={check.label} style={{ width: '22px', height: '22px', objectFit: 'contain', opacity: 0.95 }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ 
                  color: COLORS.text, 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  marginBottom: '3px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                }}>{check.label}</p>
                <p style={{ 
                  color: COLORS.textMuted, 
                  fontSize: '12px', 
                  fontFamily: 'monospace',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  overflow: isMobile ? 'visible' : 'hidden',
                  textOverflow: isMobile ? 'unset' : 'ellipsis',
                  maxWidth: '100%',
                  wordBreak: isMobile ? 'break-all' : 'normal',
                }}>
                  {check.link ? (
                    <span
                      onClick={() => window.open(check.link, '_blank')}
                      style={{
                        color: COLORS.cyan,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textDecorationStyle: 'dotted',
                        textUnderlineOffset: '3px',
                        transition: 'color 0.2s',
                      }}
                      title="View on Blockscout"
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.color = COLORS.cyan}
                    >
                      {check.detail.length > 30 ? `${check.detail.slice(0, 10)}...${check.detail.slice(-6)}` : check.detail}
                    </span>
                  ) : check.label === '0G Storage' && lastSnapshot ? (
                    <>
                      {`Last snapshot: ${new Date(lastSnapshot.timestamp).toLocaleString('id-ID')} · `}
                      <span
                        onClick={() => window.open(
                          lastSnapshot.sequence
                            ? `https://storagescan-galileo.0g.ai/submission/${lastSnapshot.sequence}`
                            : 'https://storagescan-galileo.0g.ai',
                          '_blank'
                        )}
                        style={{
                          color: COLORS.cyan,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                          textUnderlineOffset: '3px',
                          transition: 'color 0.2s',
                        }}
                        title="View on 0G Explorer"
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = COLORS.cyan}
                      >
                        {lastSnapshot.rootHash.slice(0, 10)}...
                      </span>
                    </>
                  ) : check.detail}
                </p>
              </div>
            </div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: check.color,
              textTransform: 'uppercase',
              border: `1px solid ${check.color}35`,
              padding: '4px 12px',
              borderRadius: '50px',
              background: `linear-gradient(135deg, ${check.color}15, ${check.color}03)`,
              boxShadow: `0 0 10px ${check.color}08`,
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              flexShrink: 0,
            }}>
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: check.color,
                  boxShadow: `0 0 6px ${check.color}`,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
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
            whileHover={{
              backgroundColor: `${COLORS.card}ef`,
              borderColor: `${COLORS.purple}60`,
              boxShadow: `inset 4px 0 0 ${COLORS.purple}, 0 8px 32px rgba(0,0,0,0.35), 0 0 16px ${COLORS.purple}05`,
              paddingLeft: '28px',
            }}
            style={{ 
              backgroundColor: COLORS.card, 
              border: `1px solid ${COLORS.purple}30`, 
              borderRadius: '16px', 
              padding: '20px 24px', 
              position: 'relative', 
              overflow: 'hidden',
              transition: 'all 0.25s ease',
            }}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.6, delay: 0.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '30%', height: '100%',
                background: `linear-gradient(90deg, transparent, ${COLORS.purple}12, transparent)`,
                pointerEvents: 'none',
              }}
            />
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
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: COLORS.purple,
                textTransform: 'uppercase',
                border: `1px solid ${COLORS.purple}35`,
                padding: '4px 12px',
                borderRadius: '50px',
                background: `linear-gradient(135deg, ${COLORS.purple}15, ${COLORS.purple}03)`,
                boxShadow: `0 0 10px ${COLORS.purple}08`,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}>
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: COLORS.purple,
                    boxShadow: `0 0 6px ${COLORS.purple}`,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                Verified On-chain
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
                <motion.div
                  key={i}
                  whileHover={{
                    backgroundColor: i === 0 ? `${COLORS.purple}15` : 'rgba(255,255,255,0.02)',
                    borderColor: i === 0 ? `${COLORS.purple}40` : 'rgba(255,255,255,0.12)',
                    paddingLeft: '18px',
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    backgroundColor: i === 0 ? `${COLORS.purple}10` : 'transparent',
                    border: `1px solid ${i === 0 ? COLORS.purple + '30' : COLORS.cardBorder}`,
                    borderRadius: '12px',
                    flexWrap: 'wrap', gap: '8px',
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                  }}
                >
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
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          color: COLORS.purple,
                          letterSpacing: '0.05em',
                          border: `1px solid ${COLORS.purple}30`,
                          padding: '1px 6px',
                          borderRadius: '50px',
                          backgroundColor: `${COLORS.purple}10`,
                          marginLeft: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}>
                          <motion.span
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: COLORS.purple, display: 'inline-block', flexShrink: 0 }}
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
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        color: sentimentColor[snap.sentiment] || COLORS.amber,
                        textTransform: 'uppercase',
                        border: `1px solid ${sentimentColor[snap.sentiment] || COLORS.amber}35`,
                        padding: '3px 10px',
                        borderRadius: '50px',
                        background: `linear-gradient(135deg, ${sentimentColor[snap.sentiment] || COLORS.amber}15, ${sentimentColor[snap.sentiment] || COLORS.amber}03)`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: sentimentColor[snap.sentiment] || COLORS.amber,
                            display: 'inline-block',
                            flexShrink: 0,
                          }}
                        />
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
                </motion.div>
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
      style={{
        backgroundColor: '#060d1a',
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px',
        padding: '14px 20px',
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        backgroundColor: '#040a14',
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
          fontSize: '10px', fontWeight: 700, color: COLORS.green, 
          letterSpacing: '0.08em', textTransform: 'uppercase',
          border: `1px solid ${COLORS.green}35`,
          background: `linear-gradient(135deg, ${COLORS.green}1a, ${COLORS.green}05)`,
          boxShadow: `0 0 12px ${COLORS.green}10`,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          padding: '3px 12px', borderRadius: '50px',
          display: 'inline-flex', alignItems: 'center', gap: '6px'
        }}>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ 
              width: '6px', height: '6px', borderRadius: '50%', 
              backgroundColor: COLORS.green, display: 'inline-block', flexShrink: 0,
              boxShadow: `0 0 8px ${COLORS.green}`
            }}
          />
          Live Data
        </span>
      </div>

      {!isMobile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(80px, 2fr) minmax(60px, 1fr) minmax(70px, 1.5fr) minmax(50px, 1fr)',
          padding: '8px 20px',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: '#040a14',
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
            <ActivityRow key={tx.id} tx={tx} formatTime={formatTime} formatAddress={formatAddress} index={i} isMobile={isMobile} />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

function ActivityRow({ tx, formatTime, formatAddress, index, isMobile }) {
  const isStake = tx.action === 'STAKE'
  const actionColor = isStake ? COLORS.green : COLORS.red
  const actionBg = isStake ? COLORS.greenDim : COLORS.redDim
  const humanTime = formatTime(tx.timestamp)

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: `${actionColor}03`,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: actionBg,
              border: `1px solid ${actionColor}30`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {isStake ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={actionColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={actionColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </span>
            <span
              style={{
                color: COLORS.cyan,
                fontSize: '13px',
                fontFamily: 'monospace',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '3px',
              }}
              onClick={() => window.open(`https://eth-sepolia.blockscout.com/address/${tx.address}`, '_blank')}
            >
              {formatAddress(tx.address)}
            </span>
          </div>
          <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>{humanTime}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px', paddingLeft: '34px' }}>
          <span style={{
            color: COLORS.text,
            fontSize: '13px',
            fontWeight: 500,
            lineHeight: '1.4'
          }}>
            {isStake ? 'Staked' : 'Unstaked'}{' '}
            <strong style={{ color: actionColor, fontWeight: 700 }}>{tx.amount} ETH</strong>
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>
            (≈ ${tx.amountUSD})
          </span>
        </div>
      </motion.div>
    )
  }

  // Desktop layout (aligns with table columns)
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(80px, 2fr) minmax(60px, 1fr) minmax(70px, 1.5fr) minmax(50px, 1fr)',
        padding: '14px 24px',
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        alignItems: 'center',
        cursor: 'default',
        transition: 'all 0.2s ease',
      }}
      whileHover={{ 
        backgroundColor: `${COLORS.card}ef`, 
        boxShadow: `inset 4px 0 0 ${actionColor}`,
        paddingLeft: '28px', // slide slightly to the right on hover for human touch!
      }}
    >
      {/* Wallet Column */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          backgroundColor: actionColor,
          boxShadow: `0 0 8px ${actionColor}`,
          flexShrink: 0
        }} />
        <span
          style={{
            color: COLORS.cyan,
            fontSize: '13px',
            fontFamily: 'monospace',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textUnderlineOffset: '3px',
            transition: 'color 0.2s',
          }}
          onClick={() => window.open(`https://eth-sepolia.blockscout.com/address/${tx.address}`, '_blank')}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = COLORS.cyan}
        >
          {formatAddress(tx.address)}
        </span>
      </div>

      {/* Action Column */}
      <div>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          padding: '3px 10px',
          borderRadius: '50px',
          backgroundColor: actionBg,
          color: actionColor,
          border: `1px solid ${actionColor}30`,
          textTransform: 'uppercase',
          display: 'inline-block',
        }}>
          {isStake ? 'Stake' : 'Unstake'}
        </span>
      </div>

      {/* Amount Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ color: COLORS.text, fontSize: '13px', fontWeight: 600 }}>
          {tx.amount} ETH
        </span>
        <span style={{ color: COLORS.textMuted, fontSize: '11px' }}>
          ${tx.amountUSD}
        </span>
      </div>

      {/* Time Column */}
      <div style={{ textAlign: 'right', color: COLORS.textDim, fontSize: '12px' }}>
        {humanTime}
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

function Dashboard({ activeItem, mobile, onItemClick }) {
  // Reset scroll ke top setiap ganti halaman
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [activeItem])

  const PAGE_ACCENTS = {
    overview:   { c1: '#38bdf8', c2: '#818cf8' },
    whale:      { c1: '#38bdf8', c2: '#10b981' },
    staking:    { c1: '#10b981', c2: '#38bdf8' },
    protocol:   { c1: '#10b981', c2: '#818cf8' },
    ai:         { c1: '#818cf8', c2: '#38bdf8' },
    alerts:        { c1: '#f59e0b', c2: '#818cf8' },
    'stake-action': { c1: '#38bdf8', c2: '#10b981' },
  }

  const accent = PAGE_ACCENTS[activeItem]

  const renderContent = () => {
    switch (activeItem) {
      case 'overview':   return <OverviewContent />
      case 'whale':      return <WhaleActivityContent />
      case 'staking':    return <StakingStatsContent />
      case 'protocol':   return <ProtocolHealthContent />
      case 'ai':         return <AIInsightsContent />
      case 'alerts':     return <AlertsContent />
      case 'stake-action': return <StakeActionContent onGoToGovernance={() => onItemClick('governance')} />
      case 'governance': return <GovernanceContent onItemClick={onItemClick} />
      case 'settings':   return <SettingsContent />
      case 'about':      return <AboutContent />
      default:           return <OverviewContent />
    }
  }

  const { settings } = useSettings()

    return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: COLORS.bg,
      color: COLORS.text,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Ambient background — semua halaman kecuali settings & about */}
      {accent && (
        <PageBackground accentColor={accent.c1} accentColor2={accent.c2} />
      )}

      {/* Top Bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: '#080f20',
        borderBottom: '1px solid #0e2040',
        padding: '0 16px',
        height: '52px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px',
      }}>
        {/* Page title — hidden on mobile */}
        <span style={{
          color: COLORS.textDim, fontSize: '12px',
          fontWeight: 600, letterSpacing: '0.08em',
          textTransform: 'uppercase',
          flexShrink: 0,
          display: mobile ? 'none' : 'block',
        }}>
          {activeItem === 'overview' ? 'Overview' :
          activeItem === 'whale' ? 'Staking Activity' :
          activeItem === 'staking' ? 'Staking Stats' :
          activeItem === 'protocol' ? 'Protocol Health' :
          activeItem === 'ai' ? 'AI Insights' :
          activeItem === 'alerts' ? 'Alerts' :
          activeItem === 'governance' ? 'Governance' :
          activeItem === 'settings' ? 'Settings' : 'About'}
        </span>

        {/* Wallet connect */}
        <div style={{ flexShrink: 0, marginLeft: 'auto' }}>
          <WalletButton />
        </div>
      </div>

      {/* Main content */}
      <div style={{
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
    </div>
  )
}

export default Dashboard
