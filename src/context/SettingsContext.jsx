// context/SettingsContext.jsx
// TronicLens — Global Settings Context
// Semua komponen share state yang sama → real-time sync tanpa reload

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'troniclens_settings'

export const DEFAULT_SETTINGS = {
  autoRefresh: true,
  refreshInterval: 30,   // seconds: 15 | 30 | 60
  whaleThreshold: 0.1,   // ETH: 0.05 | 0.1 | 0.5
  compactMode: false,
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
