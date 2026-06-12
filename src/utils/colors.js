// utils/colors.js
// TronicLens — Dual Theme Color Palette
// Dark theme = current brand identity | Light theme = complementary

export const DARK_COLORS = {
  // Surface
  bg: '#060d1a',
  card: '#0a1628',
  cardBorder: 'rgba(255,255,255,0.06)',

  // Sidebar (merged from Sidebar.jsx local)
  sidebar: '#080f20',
  sidebarBorder: '#0e2040',
  active: '#38bdf820',
  activeBorder: '#38bdf840',

  // Top bar
  topBar: '#080f20',
  topBarBorder: '#0e2040',

  // Chart (merged from ETHPriceChart.jsx local C)
  chartCard: '#080f20',
  chartBorder: '#0e2040',
  chartHeader: '#040a14',
  chartGrid: '#0e2040',
  tooltipBg: '#0d1829',
  tooltipBorder: '#1a2f4e',
  inputBg: '#060d1a',

  // Accents
  cyan: '#38bdf8',
  cyanDim: '#38bdf812',
  cyanGlow: '#38bdf825',

  // Status
  red: '#f43f5e',
  redDim: '#f43f5e15',
  green: '#10b981',
  greenDim: '#10b98115',
  amber: '#f59e0b',
  amberDim: '#f59e0b10',
  purple: '#818cf8',
  purpleDim: '#818cf815',

  // Typography
  text: '#e2e8f0',
  textMuted: '#4b5563',
  textDim: '#9ca3af',

  // Misc
  overlay: 'rgba(0,0,0,0.5)',
  glass: 'rgba(10, 22, 40, 0.75)',
  glassBorder: 'rgba(56, 189, 248, 0.15)',

  // Chart-specific reds (candlestick)
  chartRed: '#ef4444',
  chartDim: '#64748b',
  chartMuted: '#4a5568',
}

export const LIGHT_COLORS = {
  // Surface
  bg: '#f1f5f9',
  card: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.07)',

  // Sidebar
  sidebar: '#ffffff',
  sidebarBorder: '#e2e8f0',
  active: '#38bdf815',
  activeBorder: '#38bdf830',

  // Top bar
  topBar: '#ffffff',
  topBarBorder: '#e2e8f0',

  // Chart
  chartCard: '#ffffff',
  chartBorder: '#e2e8f0',
  chartHeader: '#e8edf2',
  chartGrid: '#e2e8f0',
  tooltipBg: '#ffffff',
  tooltipBorder: '#e2e8f0',
  inputBg: '#d1dae6',

  // Accents (same hues, work on light bg)
  cyan: '#0ea5e9',
  cyanDim: '#0ea5e912',
  cyanGlow: '#0ea5e920',

  // Status
  red: '#ef4444',
  redDim: '#ef444412',
  green: '#059669',
  greenDim: '#05966912',
  amber: '#d97706',
  amberDim: '#d9770610',
  purple: '#6366f1',
  purpleDim: '#6366f112',

  // Typography
  text: '#1e293b',
  textMuted: '#94a3b8',
  textDim: '#64748b',

  // Misc
  overlay: 'rgba(0,0,0,0.25)',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(14, 165, 233, 0.2)',

  // Chart-specific
  chartRed: '#ef4444',
  chartDim: '#64748b',
  chartMuted: '#94a3b8',
}

// Backward-compatible default (dark)
export const COLORS = DARK_COLORS