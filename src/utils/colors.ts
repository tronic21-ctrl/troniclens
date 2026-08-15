// utils/colors.ts
// TronicLens — Dual Theme Color Palette

export interface ThemeColors {
  bg: string;
  card: string;
  cardBorder: string;
  sidebar: string;
  sidebarBorder: string;
  active: string;
  activeBorder: string;
  topBar: string;
  topBarBorder: string;
  chartCard: string;
  chartBorder: string;
  chartHeader: string;
  chartGrid: string;
  tooltipBg: string;
  tooltipBorder: string;
  inputBg: string;
  cyan: string;
  cyanDim: string;
  cyanGlow: string;
  red: string;
  redDim: string;
  green: string;
  greenDim: string;
  amber: string;
  amberDim: string;
  purple: string;
  purpleDim: string;
  text: string;
  textMuted: string;
  textDim: string;
  overlay: string;
  glass: string;
  glassBorder: string;
  chartRed: string;
  chartDim: string;
  chartMuted: string;
}

export const DARK_COLORS: ThemeColors = {
  // Surface
  bg: '#040814',
  card: '#081022',
  cardBorder: 'rgba(56, 189, 248, 0.12)',

  // Sidebar
  sidebar: '#050a17',
  sidebarBorder: 'rgba(56, 189, 248, 0.12)',
  active: 'rgba(56, 189, 248, 0.12)',
  activeBorder: 'rgba(56, 189, 248, 0.35)',

  // Top bar
  topBar: 'rgba(8, 16, 34, 0.8)',
  topBarBorder: 'rgba(56, 189, 248, 0.12)',

  // Chart
  chartCard: '#081022',
  chartBorder: 'rgba(56, 189, 248, 0.12)',
  chartHeader: '#050c1a',
  chartGrid: 'rgba(56, 189, 248, 0.08)',
  tooltipBg: '#0b162c',
  tooltipBorder: 'rgba(56, 189, 248, 0.25)',
  inputBg: '#050a17',

  // Accents
  cyan: '#38bdf8',
  cyanDim: 'rgba(56, 189, 248, 0.1)',
  cyanGlow: 'rgba(56, 189, 248, 0.25)',

  // Status
  red: '#f43f5e',
  redDim: 'rgba(244, 63, 94, 0.12)',
  green: '#10b981',
  greenDim: 'rgba(16, 185, 129, 0.12)',
  amber: '#f59e0b',
  amberDim: 'rgba(245, 158, 11, 0.12)',
  purple: '#818cf8',
  purpleDim: 'rgba(129, 140, 248, 0.12)',

  // Typography
  text: '#f1f5f9',
  textMuted: '#64748b',
  textDim: '#94a3b8',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.65)',
  glass: 'rgba(8, 16, 34, 0.75)',
  glassBorder: 'rgba(56, 189, 248, 0.15)',

  // Chart-specific reds (candlestick)
  chartRed: '#ef4444',
  chartDim: '#64748b',
  chartMuted: '#475569',
}

export const LIGHT_COLORS: ThemeColors = {
  // Surface
  bg: '#f1f5f9',
  card: '#ffffff',
  cardBorder: 'rgba(0, 0, 0, 0.12)',

  // Sidebar
  sidebar: '#ffffff',
  sidebarBorder: '#cbd5e1',
  active: 'rgba(14, 165, 233, 0.12)',
  activeBorder: 'rgba(14, 165, 233, 0.4)',

  // Top bar
  topBar: 'rgba(255, 255, 255, 0.95)',
  topBarBorder: '#cbd5e1',

  // Chart
  chartCard: '#ffffff',
  chartBorder: '#cbd5e1',
  chartHeader: '#f8fafc',
  chartGrid: '#e2e8f0',
  tooltipBg: '#ffffff',
  tooltipBorder: '#cbd5e1',
  inputBg: '#e2e8f0',

  // Accents (same hues, work on light bg)
  cyan: '#0284c7',
  cyanDim: 'rgba(2, 132, 199, 0.1)',
  cyanGlow: 'rgba(2, 132, 199, 0.15)',

  // Status
  red: '#dc2626',
  redDim: 'rgba(220, 38, 38, 0.1)',
  green: '#059669',
  greenDim: 'rgba(5, 150, 105, 0.1)',
  amber: '#d97706',
  amberDim: 'rgba(217, 119, 6, 0.1)',
  purple: '#4f46e5',
  purpleDim: 'rgba(79, 70, 229, 0.1)',

  // Typography
  text: '#0f172a',
  textMuted: '#64748b',
  textDim: '#475569',

  // Misc
  overlay: 'rgba(0,0,0,0.3)',
  glass: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(0, 0, 0, 0.1)',

  // Chart-specific
  chartRed: '#dc2626',
  chartDim: '#475569',
  chartMuted: '#64748b',
}

// Backward-compatible default (dark)
export const COLORS = DARK_COLORS
