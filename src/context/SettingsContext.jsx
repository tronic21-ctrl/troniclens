// context/SettingsContext.jsx
// TronicLens — Global Settings + Theme Context
// Semua komponen share state yang sama → real-time sync tanpa reload

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DARK_COLORS, LIGHT_COLORS } from '../utils/colors'

const STORAGE_KEY = 'troniclens_settings'

export const DEFAULT_SETTINGS = {
  autoRefresh: true,
  refreshInterval: 30,   // seconds: 15 | 30 | 60
  whaleThreshold: 0.1,   // ETH: 0.05 | 0.1 | 0.5
  compactMode: false,
  theme: 'dark',         // 'dark' | 'light'
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }
    } catch (_) {}
    return DEFAULT_SETTINGS
  })

  // Persist setiap kali settings berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (_) {}
  }, [settings])

  // Sync body background color with theme
  useEffect(() => {
    const colors = settings.theme === 'light' ? LIGHT_COLORS : DARK_COLORS
    document.documentElement.style.backgroundColor = colors.bg
    document.body.style.backgroundColor = colors.bg
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    try { localStorage.removeItem(STORAGE_KEY) } catch (_) {}
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, DEFAULT_SETTINGS }}>
      {children}
    </SettingsContext.Provider>
  )
}

// Hook — pakai ini di semua komponen, gantikan useSettings lama
export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider')
  return ctx
}

// Theme-aware color hook — returns the active color palette
export function useThemeColors() {
  const { settings } = useSettings()
  return settings.theme === 'light' ? LIGHT_COLORS : DARK_COLORS
}
