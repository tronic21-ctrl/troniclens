// HeaderBar.tsx
// TronicLens — Uniswap Pro Style Floating Header Bar
"use client";

import { motion } from "framer-motion";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useSettings, useThemeColors } from "../context/SettingsContext";
import { useWhaleActivity } from "../hooks/useWhaleActivity";
import AnimatedNumber from "./AnimatedNumber";
import Magnetic from "./Magnetic";
import React from "react";

interface HeaderBarProps {
  mobile: boolean;
  onOpenSettings?: () => void;
}

export default function HeaderBar({ mobile }: HeaderBarProps) {
  const COLORS = useThemeColors();
  const { settings, updateSetting } = useSettings();
  const { chainlinkPrice } = useWhaleActivity({ refreshInterval: null });
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  const ethPrice = chainlinkPrice?.price || "1,924.06";
  const btcPrice = chainlinkPrice?.btcPrice || "66,230.23";

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 90,
        height: mobile ? "56px" : "80px",
        background: "var(--topbar)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderBottom: `1px solid var(--border)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: mobile ? "0 10px" : "0 32px",
        gap: mobile ? "8px" : "16px",
      }}
    >
      {/* Left: Chainlink Oracles Marquee */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: mobile ? "6px" : "10px",
            backgroundColor: settings.theme === "light" ? "rgba(56, 189, 248, 0.08)" : "rgba(56, 189, 248, 0.05)",
            border: `1px solid var(--border)`,
            borderRadius: "50px",
            padding: mobile ? "4px 10px" : "6px 16px",
            fontSize: mobile ? "11px" : "13px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/Chainlink-Symbol-White.svg"
            alt="Chainlink"
            style={{ 
              width: "16px", 
              height: "16px", 
              objectFit: "contain",
              filter: settings.theme === "light" ? "invert(1) brightness(0)" : "none",
            }}
          />
          {!mobile && (
            <span style={{ color: "var(--text-muted)", fontSize: "11px", letterSpacing: "0.05em" }}>ORACLES</span>
          )}
          <span style={{ color: "var(--text)", fontWeight: 700 }}>ETH/USD</span>
          <span style={{ color: "var(--cyan)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>$<AnimatedNumber value={parseFloat(String(ethPrice).replace(/,/g, '')) || 0} decimals={2} /></span>

          {!mobile && (
            <>
              <span style={{ color: "var(--border)", margin: "0 4px" }}>|</span>
              <span style={{ color: "var(--text)", fontWeight: 700 }}>BTC/USD</span>
              <span style={{ color: "var(--amber)", fontFamily: "var(--font-mono)", textShadow: "0 0 12px var(--amber-glow)" }}>$<AnimatedNumber value={parseFloat(String(btcPrice).replace(/,/g, '')) || 0} decimals={2} /></span>
            </>
          )}
        </div>
      </div>

      {/* Right: Network Status & Wallet Connect */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {!mobile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: `1px solid var(--border)`,
              borderRadius: "50px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-dim)"
            }}
          >
            <div className="pulse-dot" style={{ width: "6px", height: "6px" }} />
            <span>Sepolia Testnet</span>
          </div>
        )}

        {/* Theme Switcher - hidden on mobile to save space */}
        {!mobile && (
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "var(--border)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updateSetting("theme", settings.theme === "dark" ? "light" : "dark")}
          style={{
            background: "transparent",
            border: `1px solid var(--border)`,
            borderRadius: "12px",
            padding: "10px",
            color: "var(--text)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease"
          }}
          title="Toggle Theme"
        >
          {settings.theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </motion.button>
        )}

        {/* Connect Wallet Button */}
        <Magnetic strength={0.4}>
          <button className="btn-wallet-premium" onClick={() => open()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/rabby-wallet.svg"
              alt="Wallet"
              style={{ width: "18px", height: "18px", objectFit: "contain" }}
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <span>
              {isConnected && address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : "Connect Wallet"}
            </span>
          </button>
        </Magnetic>
      </div>
    </motion.header>
  );
}
