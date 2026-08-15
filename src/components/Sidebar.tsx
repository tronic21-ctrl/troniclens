// Sidebar.tsx
// TronicLens — Professional DeFi App Sidebar Navigation
"use client";

import { motion } from "framer-motion";
import { useSettings, useThemeColors } from "../context/SettingsContext";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import Magnetic from "./Magnetic";

const navItems = [
  {
    id: "overview",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    label: "Overview",
    soon: false,
  },
  {
    id: "whale",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12C22 12 19 7 12 7C5 7 2 12 2 12" />
        <path d="M2 12C2 12 5 17 12 17C19 17 22 12 22 12" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: "Staking Activity",
    soon: false,
  },
  {
    id: "staking",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    label: "Staking Stats",
    soon: false,
  },
  {
    id: "protocol",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    label: "Protocol Health",
    soon: false,
  },
  {
    id: "ai",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    label: "AI Insights",
    soon: false,
  },
  {
    id: "alerts",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    label: "Alerts",
    soon: false,
  },
  {
    id: "stake-action",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="8" rx="8" ry="3" />
        <path d="M4 8v4c0 1.66 3.58 3 8 3s8-1.34 8-3V8" />
        <path d="M4 12v4c0 1.66 3.58 3 8 3s8-1.34 8-3v-4" />
      </svg>
    ),
    label: "Staking",
    soon: false,
  },
  {
    id: "governance",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="3" y1="22" x2="21" y2="22" />
        <line x1="6" y1="18" x2="6" y2="11" />
        <line x1="10" y1="18" x2="10" y2="11" />
        <line x1="14" y1="18" x2="14" y2="11" />
        <line x1="18" y1="18" x2="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </svg>
    ),
    label: "Governance",
    soon: false,
  },
];

const bottomItems = [
  {
    id: "settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    label: "Settings",
    soon: false,
  },
  {
    id: "about",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    label: "About",
    soon: false,
  },
];

interface SidebarProps {
  activeItem: string;
  onItemClick: (id: string) => void;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export default function Sidebar({
  activeItem,
  onItemClick,
  collapsed,
  onCollapse,
}: SidebarProps) {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const { autoRefresh, refreshInterval, compactMode } = settings;
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Staggered Entrance Animation for nav items
    if (navRef.current) {
      const items = navRef.current.querySelectorAll('.gsap-nav-item');
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.04,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.1
        }
      );
    }
  }, []);

  const itemPadding = compactMode
    ? collapsed ? "8px" : "8px 14px"
    : collapsed ? "12px" : "12px 16px";

  const liveText = autoRefresh
    ? `LIVE · ${refreshInterval}s`
    : "LIVE · OFF";

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: collapsed ? "76px" : "260px",
        minHeight: "100dvh",
        background: "var(--sidebar)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: `1px solid var(--border)`,
        boxShadow: "4px 0 32px rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            padding: collapsed ? "24px 0" : "24px 20px",
            borderBottom: `1px solid var(--border)`,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            minHeight: compactMode ? "64px" : "80px",
            transition: "all 0.3s ease",
          }}
        >
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  settings.theme === "light"
                    ? "/logos/troniclens-logo-dark.svg"
                    : "/logos/troniclens-logo-transparent.svg"
                }
                alt="TronicLens"
                style={{
                  width: "36px",
                  height: "36px",
                  objectFit: "contain",
                  flexShrink: 0,
                  filter: "none",
                }}
              />
              <span
                style={{
                  fontSize: compactMode ? "15px" : "18px",
                  fontWeight: 800,
                  color: "var(--text)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "-0.03em",
                  whiteSpace: "nowrap",
                  transition: "font-size 0.2s",
                }}
              >
                TronicLens
              </span>
            </div>
          )}

          {collapsed && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                settings.theme === "light"
                  ? "/logos/troniclens-logo-dark.svg"
                  : "/logos/troniclens-logo-transparent.svg"
              }
              alt="TronicLens"
              style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
                filter:
                  settings.theme === "light"
                    ? "none"
                    : "drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))",
              }}
            />
          )}

          <Magnetic strength={0.3}>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: "var(--border)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onCollapse(!collapsed)}
              style={{
                background: "transparent",
                border: `1px solid var(--border)`,
                borderRadius: "8px",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "color 0.2s, background-color 0.2s",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {collapsed ? (
                  <polyline points="9 18 15 12 9 6" />
                ) : (
                  <polyline points="15 18 9 12 15 6" />
                )}
              </svg>
            </motion.button>
          </Magnetic>
        </div>

        {/* Live indicator */}
        {!collapsed && (
          <div
            style={{
              padding: compactMode ? "12px 20px 8px" : "16px 20px 12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "padding 0.2s",
            }}
          >
            <div className="pulse-dot" style={{ width: "6px", height: "6px", flexShrink: 0 }} />
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              {liveText}
            </span>
          </div>
        )}

        {/* Nav items */}
        <nav
          ref={navRef}
          style={{
            flex: 1,
            padding: compactMode ? "8px 12px" : "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: compactMode ? "4px" : "6px",
            transition: "padding 0.2s, gap 0.2s",
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <motion.button
                key={item.id}
                className="gsap-nav-item"
                whileHover={{
                  x: isActive ? 0 : 4,
                  backgroundColor: isActive ? "rgba(56, 189, 248, 0.08)" : "rgba(129, 140, 248, 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !item.soon && onItemClick(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: itemPadding,
                  borderRadius: "12px",
                  border: `1px solid ${isActive ? "var(--border)" : "transparent"}`,
                  background: isActive ? "rgba(56, 189, 248, 0.08)" : "transparent",
                  color: isActive ? "var(--cyan)" : item.soon ? "var(--amber)" : "var(--text-dim)",
                  cursor: item.soon ? "default" : "pointer",
                  width: "100%",
                  textAlign: "left",
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                  overflow: "hidden"
                }}
                title={collapsed ? item.label : ""}
              >
                <span style={{ 
                  flexShrink: 0, 
                  display: "flex"
                }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span
                    style={{
                      fontSize: compactMode ? "13px" : "14px",
                      fontWeight: isActive ? 700 : 500,
                      whiteSpace: "nowrap",
                      flex: 1,
                      transition: "font-size 0.2s, font-weight 0.2s",
                      letterSpacing: "-0.01em"
                    }}
                  >
                    {item.label}
                  </span>
                )}
                {!collapsed && item.soon && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      color: "var(--amber)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      backgroundColor: "rgba(245, 158, 11, 0.1)",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      flexShrink: 0,
                    }}
                  >
                    SOON
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          style={{
            padding: "16px",
            borderTop: `1px solid var(--border)`,
            display: "flex",
            flexDirection: "column",
            gap: "6px"
          }}
        >
          {/* ETHOnline badge */}
          {!collapsed && (
            <div
              style={{
                marginBottom: compactMode ? "6px" : "12px",
                padding: compactMode ? "10px 14px" : "12px 16px",
                borderRadius: "12px",
                background: "var(--premium-grad-dim)",
                border: `1px solid var(--border)`,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                transition: "all 0.3s ease"
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/ETHGlobal_Logomark_White.svg"
                alt="ETHGlobal"
                style={{
                  width: "20px",
                  height: "20px",
                  objectFit: "contain",
                  filter: settings.theme === "light" ? "invert(1)" : "none",
                }}
              />
              <div style={{ lineHeight: 1.3 }}>
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    marginBottom: "0",
                    textTransform: "uppercase",
                    color: "var(--cyan)"
                  }}
                >
                  ETHOnline 2026
                </p>
                {!compactMode && (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "11px",
                      margin: "0",
                      fontWeight: 600
                    }}
                  >
                    Sep 4–16, 2026
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Settings + About */}
          {bottomItems.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{
                  x: isActive ? 0 : 4,
                  backgroundColor: isActive ? "rgba(56, 189, 248, 0.1)" : "rgba(129, 140, 248, 0.04)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => !item.soon && onItemClick(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: itemPadding,
                  borderRadius: "12px",
                  border: "1px solid transparent",
                  background: isActive ? "linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%)" : "transparent",
                  color: isActive ? "var(--cyan)" : "var(--text-dim)",
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: collapsed ? "center" : "flex-start",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                title={collapsed ? item.label : ""}
              >
                <span style={{ 
                  flexShrink: 0, 
                  display: "flex",
                  filter: isActive ? "drop-shadow(0 0 6px var(--cyan))" : "none"
                }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span
                    style={{
                      fontSize: compactMode ? "13px" : "14px",
                      fontWeight: isActive ? 700 : 500,
                      flex: 1,
                      whiteSpace: "nowrap",
                      letterSpacing: "-0.01em"
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
