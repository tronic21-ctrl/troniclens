// Sidebar.jsx
// TronicLens — Professional DeFi App Sidebar Navigation

import { motion } from 'framer-motion'
import { useSettings } from '../context/SettingsContext'

const COLORS = {
  bg: '#060d1a',
  sidebar: '#080f20',
  sidebarBorder: '#0e2040',
  active: '#38bdf820',
  activeBorder: '#38bdf840',
  cyan: '#38bdf8',
  cyanDim: '#38bdf815',
  text: '#e2e8f0',
  textMuted: '#4a5568',
  textDim: '#64748b',
  green: '#10b981',
}

const navItems = [
  {
    id: 'overview',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>),
    label: 'Overview', soon: false,
  },
  {
    id: 'whale',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 12C22 12 19 7 12 7C5 7 2 12 2 12"/><path d="M2 12C2 12 5 17 12 17C19 17 22 12 22 12"/><circle cx="12" cy="12" r="3"/></svg>),
    label: 'Staking Activity', soon: false,
  },
  {
    id: 'staking',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>),
    label: 'Staking Stats', soon: false,
  },
  {
    id: 'protocol',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>),
    label: 'Protocol Health', soon: false,
  },
  {
    id: 'ai',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>),
    label: 'AI Insights', soon: false,
  },
  {
    id: 'alerts',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
    label: 'Alerts', soon: false,
  },
  {
    id: 'stake-action',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="8" rx="8" ry="3"/>
        <path d="M4 8v4c0 1.66 3.58 3 8 3s8-1.34 8-3V8"/>
        <path d="M4 12v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4"/>
      </svg>
    ),
      label: 'Staking', soon: false,
  },
  {
    id: 'governance',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="3" y1="22" x2="21" y2="22"/>
            <line x1="6" y1="18" x2="6" y2="11"/>
            <line x1="10" y1="18" x2="10" y2="11"/>
            <line x1="14" y1="18" x2="14" y2="11"/>
            <line x1="18" y1="18" x2="18" y2="11"/>
            <polygon points="12 2 20 7 4 7"/>
          </svg>),
    label: 'Governance', soon: false,
  },
]

const bottomItems = [
  {
    id: 'settings',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
    label: 'Settings', soon: false,
  },
  {
    id: 'about',
    icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>),
    label: 'About', soon: false,
  },
]

function Sidebar({ activeItem, onItemClick, collapsed, onCollapse }) {
  // Baca langsung dari Context — real-time, tidak perlu props
  const { settings } = useSettings()
  const { autoRefresh, refreshInterval, compactMode } = settings

  // Compact mode: kurangi padding nav items
  const itemPadding = compactMode
    ? (collapsed ? '7px' : '7px 12px')
    : (collapsed ? '10px' : '10px 12px')

  const liveText = autoRefresh
    ? `LIVE · Refreshes ${refreshInterval}s`
    : 'LIVE · Auto-refresh OFF'

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        width: collapsed ? '64px' : '220px',
        minHeight: '100dvh',
        backgroundColor: COLORS.sidebar,
        borderRight: `1px solid ${COLORS.sidebarBorder}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowX: 'hidden',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
      }}>
      {/* Logo area */}
      <div style={{
        padding: collapsed ? '20px 0' : '20px 16px',
        borderBottom: `1px solid ${COLORS.sidebarBorder}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: compactMode ? '52px' : '64px',
        transition: 'min-height 0.2s',
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/logos/troniclens-logo-transparent.svg"
              alt="TronicLens"
              style={{ width: '32px', height: '32px', filter: 'drop-shadow(0 0 6px #38bdf860)', flexShrink: 0 }}
            />
            <span style={{
              fontSize: compactMode ? '13px' : '15px',
              fontWeight: 700, color: COLORS.text,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '-0.01em', whiteSpace: 'nowrap',
              transition: 'font-size 0.2s',
            }}>
              TronicLens
            </span>
          </div>
        )}

        {collapsed && (
          <img
            src="/logos/troniclens-logo-transparent.svg"
            alt="TronicLens"
            style={{ width: '28px', height: '28px', filter: 'drop-shadow(0 0 6px #38bdf860)' }}
          />
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCollapse(!collapsed)}
          style={{
            background: 'none',
            border: `1px solid ${COLORS.sidebarBorder}`,
            borderRadius: '6px',
            color: COLORS.textDim,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </motion.button>
      </div>

      {/* Live indicator */}
      {!collapsed && (
        <div style={{
          padding: compactMode ? '7px 16px' : '10px 16px',
          borderBottom: `1px solid ${COLORS.sidebarBorder}`,
          display: 'flex', alignItems: 'center', gap: '8px',
          transition: 'padding 0.2s',
        }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: COLORS.green,
              boxShadow: `0 0 6px ${COLORS.green}`,
              flexShrink: 0,
            }}
          />
          <span style={{ color: COLORS.textDim, fontSize: '11px', letterSpacing: '0.08em' }}>
            {liveText}
          </span>
        </div>
      )}

      {/* Nav items */}
      <nav style={{
          flex: 1,
          padding: compactMode ? '8px 8px' : '12px 8px',
          display: 'flex', flexDirection: 'column',
          gap: compactMode ? '1px' : '2px',
          transition: 'padding 0.2s, gap 0.2s',
          overflowY: 'auto',
          minHeight: 0,
        }}>
        {navItems.map((item) => {
          const isActive = activeItem === item.id
          return (
            <motion.button
              key={item.id}
              whileHover={{ backgroundColor: isActive ? COLORS.active : '#0e2040' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !item.soon && onItemClick(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: itemPadding,
                borderRadius: '8px',
                border: isActive ? `1px solid ${COLORS.activeBorder}` : '1px solid transparent',
                backgroundColor: isActive ? COLORS.active : 'transparent',
                color: isActive ? COLORS.cyan : item.soon ? '#f59e0b' : COLORS.textDim,
                cursor: item.soon ? 'default' : 'pointer',
                width: '100%', textAlign: 'left',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'all 0.2s',
              }}
              title={collapsed ? item.label : ''}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {!collapsed && (
                <span style={{
                  fontSize: compactMode ? '12px' : '13px',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap', flex: 1,
                  transition: 'font-size 0.2s',
                }}>
                  {item.label}
                </span>
              )}
              {!collapsed && item.soon && (
                <span style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em',
                  color: '#f59e0b', border: '1px solid #f59e0b40',
                  backgroundColor: '#f59e0b10', padding: '2px 6px', borderRadius: '4px', flexShrink: 0,
                }}>
                  SOON
                </span>
              )}
              {isActive && !collapsed && (
                <div style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  backgroundColor: COLORS.cyan, boxShadow: `0 0 6px ${COLORS.cyan}`, flexShrink: 0,
                }} />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '8px', borderTop: `1px solid ${COLORS.sidebarBorder}` }}>
        {/* ETHOnline badge */}
        {!collapsed && (
          <div style={{
            margin: compactMode ? '0 4px 4px' : '0 4px 8px',
            padding: compactMode ? '6px 12px' : '8px 12px',
            borderRadius: '8px',
            backgroundColor: '#38bdf810',
            border: '1px solid #38bdf820',
            display: 'flex', alignItems: 'center', gap: '8px',
            transition: 'padding 0.2s, margin 0.2s',
          }}>
            <img src="/logos/ETHGlobal_Logomark_White.svg" alt="ETHGlobal" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
            <div style={{ lineHeight: 1.2 }}>
              <p style={{ color: COLORS.cyan, fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0' }}>
                  ETHOnline 2026
                </p>
                {!compactMode && (
                  <p style={{ color: COLORS.textMuted, fontSize: '10px', margin: '0' }}>Sep 4–16, 2026</p>
                )}
            </div>
          </div>
        )}

        {/* Settings + About */}
        {bottomItems.map(item => {
          const isActive = activeItem === item.id
          return (
            <motion.button
              key={item.id}
              whileHover={{ backgroundColor: isActive ? COLORS.active : '#0e2040' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => !item.soon && onItemClick(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: itemPadding,
                borderRadius: '8px',
                border: isActive ? `1px solid ${COLORS.activeBorder}` : '1px solid transparent',
                backgroundColor: isActive ? COLORS.active : 'transparent',
                color: isActive ? COLORS.cyan : COLORS.textMuted,
                cursor: 'pointer', width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                transition: 'all 0.2s',
              }}
              title={collapsed ? item.label : ''}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              {!collapsed && (
                <span style={{
                  fontSize: compactMode ? '12px' : '13px',
                  fontWeight: isActive ? 600 : 400,
                  flex: 1, whiteSpace: 'nowrap',
                  transition: 'font-size 0.2s',
                }}>
                  {item.label}
                </span>
              )}
              {isActive && !collapsed && (
                <div style={{
                  width: '4px', height: '4px', borderRadius: '50%',
                  backgroundColor: COLORS.cyan, boxShadow: `0 0 6px ${COLORS.cyan}`, flexShrink: 0,
                }} />
              )}
            </motion.button>
          )
        })}
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar
