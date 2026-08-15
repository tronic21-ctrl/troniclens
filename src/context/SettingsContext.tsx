// context/SettingsContext.tsx
// TronicLens — Global Settings + Theme Context
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { DARK_COLORS, LIGHT_COLORS, type ThemeColors } from "../utils/colors";

const STORAGE_KEY = "troniclens_settings";

export interface Settings {
  autoRefresh: boolean;
  refreshInterval: number; // seconds: 15 | 30 | 60
  whaleThreshold: number;  // ETH: 0.05 | 0.1 | 0.5
  compactMode: boolean;
  theme: "dark" | "light";
}

export const DEFAULT_SETTINGS: Settings = {
  autoRefresh: true,
  refreshInterval: 30,
  whaleThreshold: 0.1,
  compactMode: false,
  theme: "dark",
};

interface SettingsContextValue {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
  DEFAULT_SETTINGS: Settings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  // Persist setiap kali settings berubah
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Sync body background color with theme
  useEffect(() => {
    const colors = settings.theme === "light" ? LIGHT_COLORS : DARK_COLORS;
    document.documentElement.style.backgroundColor = colors.bg;
    document.body.style.backgroundColor = colors.bg;
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const updateSetting = useCallback(
    <K extends keyof Settings>(key: K, value: Settings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSetting, resetSettings, DEFAULT_SETTINGS }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// Hook — pakai ini di semua komponen
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}

// Theme-aware color hook — returns the active color palette
export function useThemeColors(): ThemeColors {
  const { settings } = useSettings();
  return settings.theme === "light" ? LIGHT_COLORS : DARK_COLORS;
}
