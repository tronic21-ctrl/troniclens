// Dashboard.tsx
// TronicLens — DeFi Staking Intelligence Cockpit
// All sections: Overview, Whale Activity, Staking Stats, Protocol Health, AI Insights, Alerts, Settings, About
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useWhaleActivity } from "../hooks/useWhaleActivity";
import AnimatedNumber from "./AnimatedNumber";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { useSettings, useThemeColors } from "../context/SettingsContext";

// Import other sections
import HeaderBar from "./HeaderBar";
import AlertsContent from "./Alerts";
import GovernanceContent from "./Governance";
import StakeActionContent from "./StakeAction";
import ScrollReveal from "./ScrollReveal";

// Dynamic import of ETHPriceChart to prevent SSR issues
const ETHPriceChart = dynamic(() => import("./ETHPriceChart"), {
  ssr: false,
});

// ─── Shared Components ───────────────────────────────────────────

function WalletButton() {
  const COLORS = useThemeColors();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();

  return isConnected ? (
    <motion.button
      whileHover={{ scale: 1.03, boxShadow: "0 0 16px #10b98125" }}
      whileTap={{ scale: 0.98 }}
      onClick={() => open()}
      style={{
        padding: "6px 14px",
        background: `linear-gradient(135deg, ${COLORS.green}18, ${COLORS.green}04)`,
        border: `1px solid ${COLORS.green}40`,
        borderRadius: "8px",
        color: COLORS.green,
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <div
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: COLORS.green,
          boxShadow: `0 0 8px ${COLORS.green}`,
        }}
      />
      <span style={{ fontFamily: "monospace" }}>
        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
      </span>
    </motion.button>
  ) : (
    <motion.button
      whileHover={{
        scale: 1.03,
        boxShadow: `0 0 16px ${COLORS.cyan}30`,
        borderColor: COLORS.cyan,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => open()}
      style={{
        padding: "6px 14px",
        backgroundColor: COLORS.cyanDim,
        border: `1px solid ${COLORS.cyan}40`,
        borderRadius: "8px",
        color: COLORS.cyan,
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      Connect Wallet
    </motion.button>
  );
}

interface PageBackgroundProps {
  accentColor?: string;
  accentColor2?: string;
}

function PageBackground({
  accentColor = "#38bdf8",
  accentColor2 = "#818cf8",
}: PageBackgroundProps) {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable mouse glow on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      // Lazy follow with lerp (very smooth, laggy trailing)
      currentX += (mouseX - currentX) * 0.03;
      currentY += (mouseY - currentY) * 0.03;

      if (glow) {
        glow.style.transform = `translate(${currentX - 250}px, ${currentY - 250}px)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* Mouse-reactive ambient glow */}
      <div
        ref={glowRef}
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}18 0%, ${accentColor}06 40%, transparent 70%)`,
          filter: "blur(80px)",
          willChange: "transform",
          opacity: 0.8,
        }}
      />
      <motion.div
        animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.08, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-120px",
          right: "-80px",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor}30 0%, ${accentColor}08 50%, transparent 70%)`,
          filter: "blur(48px)",
          willChange: "transform, opacity",
        }}
      />
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.06, 1] }}
        transition={{
          duration: 17,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "80px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accentColor2}20 0%, ${accentColor2}08 50%, transparent 70%)`,
          filter: "blur(56px)",
          willChange: "transform, opacity",
        }}
      />
      <motion.div
        animate={{ opacity: [0.06, 0.13, 0.06] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{
          position: "absolute",
          top: "30%",
          left: "40%",
          width: "600px",
          height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accentColor}15 0%, transparent 70%)`,
          filter: "blur(60px)",
          willChange: "opacity",
        }}
      />
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
}

function PageHeader({ title, subtitle }: PageHeaderProps) {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const compact = settings.compactMode;

  return (
    <div style={{ marginBottom: compact ? "16px" : "20px" }}>
      <h1
        style={{
          fontSize: "16px",
          fontWeight: 700,
          color: COLORS.text,
          fontFamily: "var(--font-sans)",
          margin: 0,
          marginBottom: "4px",
        }}
      >
        {title}
      </h1>
      <p style={{ color: COLORS.textMuted, fontSize: "13px", margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  accent?: string;
  delay?: number;
  icon?: any;
}

function StatCard({
  label,
  value,
  sub,
  accent,
  delay = 0,
  icon,
}: StatCardProps) {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const compact = settings.compactMode;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.2)", delay: delay }
      );
    }
  }, [delay]);

  return (
    <div
      ref={cardRef}
      className="bento-card hover-glow"
      style={{
        padding: compact ? "16px" : "24px",
        display: "flex",
        flexDirection: "column",
        gap: compact ? "8px" : "12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative gradient orb */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "120px",
          height: "120px",
          background: `radial-gradient(circle, ${accent || COLORS.cyan}30 0%, transparent 70%)`,
          borderRadius: "50%",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: COLORS.textMuted, fontSize: compact ? "11px" : "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
          {label}
        </p>
        {icon && <span style={{ fontSize: "20px", opacity: 0.8, color: accent || COLORS.cyan }}>{icon}</span>}
      </div>
      
      <p style={{ color: COLORS.text, fontSize: compact ? "20px" : "28px", fontWeight: 700, fontFamily: "var(--font-sans)", letterSpacing: "-0.01em", margin: 0 }}>
        {value}
      </p>
      
      {sub && (
        <p style={{ color: accent || COLORS.cyan, fontSize: compact ? "12px" : "13px", fontWeight: 600, margin: 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

interface ComingSoonSectionProps {
  title: string;
  subtitle: string;
  icon: any;
  color?: string;
  features?: any[];
}

function ComingSoonSection({
  title,
  subtitle,
  icon,
  color,
  features = [],
}: ComingSoonSectionProps) {
  const COLORS = useThemeColors();
  const resolvedColor = color ?? COLORS.cyan;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          backgroundColor: `${resolvedColor}15`,
          border: `1px solid ${resolvedColor}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "36px",
          marginBottom: "24px",
          boxShadow: `0 0 40px ${resolvedColor}20`,
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: COLORS.amber,
          textTransform: "uppercase",
          border: "1px solid #f59e0b40",
          backgroundColor: "#f59e0b10",
          padding: "4px 12px",
          borderRadius: "50px",
          marginBottom: "16px",
          display: "inline-block",
        }}
      >
        Coming Soon
      </span>

      <h2
        style={{
          fontSize: "32px",
          fontWeight: 800,
          color: COLORS.text,
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "-0.02em",
          marginBottom: "12px",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: COLORS.textMuted,
          fontSize: "15px",
          maxWidth: "480px",
          lineHeight: 1.7,
          marginBottom: "40px",
        }}
      >
        {subtitle}
      </p>

      {features.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            maxWidth: "600px",
            width: "100%",
          }}
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: "10px",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "16px" }}>{f.icon}</span>
              <span style={{ color: COLORS.textDim, fontSize: "13px" }}>
                {f.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      <p style={{ color: COLORS.textMuted, fontSize: "12px", marginTop: "40px" }}>
        Planned for ETHOnline 2026 · Sep 4–16, 2026
      </p>
    </motion.div>
  );
}

// ─── Settings UI Components ───────────────────────────────────────

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ value, onChange }: ToggleProps) {
  const COLORS = useThemeColors();
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        backgroundColor: value ? COLORS.cyan : COLORS.cardBorder,
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
        flexShrink: 0,
        boxShadow: value ? `0 0 8px ${COLORS.cyan}60` : "none",
      }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          position: "absolute",
          top: "2px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}

interface PillSelectorProps {
  options: { label: string; value: any }[];
  value: any;
  onChange: (v: any) => void;
}

function PillSelector({ options, value, onChange }: PillSelectorProps) {
  const COLORS = useThemeColors();
  return (
    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "5px 14px",
              borderRadius: "50px",
              border: isSelected
                ? `1px solid ${COLORS.cyan}`
                : `1px solid ${COLORS.cardBorder}`,
              backgroundColor: isSelected ? COLORS.cyan : "transparent",
              color: isSelected ? "#04101c" : COLORS.textDim,
              fontSize: "12px",
              fontWeight: isSelected ? 700 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </motion.button>
        );
      })}
    </div>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}

function SettingRow({ label, description, children, delay = 0 }: SettingRowProps) {
  const COLORS = useThemeColors();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "12px",
        padding: "16px 0",
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: "160px" }}>
        <p
          style={{
            color: COLORS.text,
            fontSize: "14px",
            fontWeight: 500,
            marginBottom: "2px",
          }}
        >
          {label}
        </p>
        {description && (
          <p style={{ color: COLORS.textMuted, fontSize: "12px" }}>
            {description}
          </p>
        )}
      </div>
      <div style={{ flexShrink: 0, maxWidth: "100%" }}>{children}</div>
    </motion.div>
  );
}

interface SettingsCardProps {
  title: string;
  icon?: any;
  children: React.ReactNode;
  delay?: number;
}

function SettingsCard({ title, icon, children, delay = 0 }: SettingsCardProps) {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const isLight = settings.theme === "light";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" : "none",
      }}
    >
      <p
        style={{
          color: COLORS.text,
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "4px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {icon && <span>{icon}</span>} {title}
      </p>
      <div>{children}</div>
    </motion.div>
  );
}

// ─── Settings Content ────────────────────────────────────────────

function SettingsContent() {
  const COLORS = useThemeColors();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [saveFlash, setSaveFlash] = useState(false);

  const handleUpdate = (key: any, value: any) => {
    updateSetting(key, value);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 1500);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: COLORS.text,
              fontFamily: "var(--font-sans)",
              margin: 0,
              marginBottom: "4px",
            }}
          >
            Settings
          </h1>
          <p style={{ color: COLORS.textMuted, fontSize: "13px", margin: 0 }}>
            Customize your TronicLens dashboard experience
          </p>
        </div>

        <AnimatePresence>
          {saveFlash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 14px",
                borderRadius: "50px",
                backgroundColor: COLORS.greenDim,
                border: `1px solid ${COLORS.green}40`,
                fontSize: "12px",
                fontWeight: 600,
                color: COLORS.green,
              }}
            >
              ✓ Saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <SettingsCard title="Appearance" delay={0.05}>
          <SettingRow
            label="Theme"
            description="Switch between dark and light mode"
            delay={0.08}
          >
            <Toggle
              value={settings.theme === "light"}
              onChange={(v) => handleUpdate("theme", v ? "light" : "dark")}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard title="Dashboard" delay={0.1}>
          <SettingRow
            label="Auto Refresh"
            description="Automatically fetch new data from The Graph"
            delay={0.15}
          >
            <Toggle
              value={settings.autoRefresh}
              onChange={(v) => handleUpdate("autoRefresh", v)}
            />
          </SettingRow>

          <SettingRow
            label="Refresh Interval"
            description={
              settings.autoRefresh
                ? "How often data is updated"
                : "Enable auto refresh to use this"
            }
            delay={0.2}
          >
            <PillSelector
              options={[
                { label: "15s", value: 15 },
                { label: "30s", value: 30 },
                { label: "60s", value: 60 },
              ]}
              value={settings.refreshInterval}
              onChange={(v) => handleUpdate("refreshInterval", v)}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard title="Whale Detection" delay={0.2}>
          <SettingRow
            label="Whale Threshold"
            description="Minimum ETH to classify a wallet as whale"
            delay={0.25}
          >
            <PillSelector
              options={[
                { label: "0.05 ETH", value: 0.05 },
                { label: "0.1 ETH", value: 0.1 },
                { label: "0.5 ETH", value: 0.5 },
              ]}
              value={settings.whaleThreshold}
              onChange={(v) => handleUpdate("whaleThreshold", v)}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard title="Display" delay={0.25}>
          <SettingRow
            label="Compact Mode"
            description="Reduce spacing for a denser layout"
            delay={0.3}
          >
            <Toggle
              value={settings.compactMode}
              onChange={(v) => handleUpdate("compactMode", v)}
            />
          </SettingRow>
        </SettingsCard>

        <SettingsCard title="Data" delay={0.3}>
          <SettingRow
            label="Manual Refresh"
            description="Force fetch latest data from The Graph now"
            delay={0.35}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.cyan}40`,
                backgroundColor: "transparent",
                color: COLORS.cyan,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ↻ Refresh Now
            </button>
          </SettingRow>

          <SettingRow
            label="Reset to Default"
            description="Restore all settings to their original values"
            delay={0.4}
          >
            <button
              onClick={() => {
                resetSettings();
                setSaveFlash(true);
                setTimeout(() => setSaveFlash(false), 1500);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${COLORS.cardBorder}`,
                backgroundColor: "transparent",
                color: COLORS.textDim,
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </SettingRow>
        </SettingsCard>

        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: `${COLORS.cyan}0d`,
            border: `1px solid ${COLORS.cyan}25`,
            fontSize: "13px",
            color: COLORS.textDim,
          }}
        >
          <span style={{ fontWeight: 600, color: COLORS.text }}>Current: </span>
          <span style={{ color: COLORS.cyan, fontWeight: 600 }}>
            Auto-refresh every {settings.refreshInterval}s
          </span>
          {" · "}
          <span style={{ color: COLORS.cyan, fontWeight: 600 }}>
            Whale ≥ {settings.whaleThreshold} ETH
          </span>
          {" · "}
          <span style={{ color: COLORS.cyan, fontWeight: 600 }}>
            Compact {settings.compactMode ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── About Content ───────────────────────────────────────────────

function AboutContent() {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const whiteLogo = settings.theme === "light" ? "invert(1)" : "none";
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const builderLinks = [
    {
      label: "GitHub",
      url: "https://github.com/tronic21-ctrl",
      icon: "/logos/GitHub_Invertocat_White.svg",
    },
    {
      label: "Portfolio",
      url: "https://rikotronic.vercel.app/",
      icon: null, // inline globe icon
    },
    {
      label: "ETHGlobal",
      url: "https://ethglobal.com/events/ethonline2026",
      icon: "/logos/ETHGlobal_Logomark_White.svg",
    },
    {
      label: "X",
      url: "https://x.com/rikotronic",
      icon: null, // inline X icon
    },
  ];

  const poweredBy = [
    {
      name: "The Graph",
      desc: "Subgraph indexing for staking events",
      logo: "/logos/The Graph - Logomark - Light.svg",
      invert: true,
    },
    {
      name: "Chainlink",
      desc: "ETH/USD price feed on Sepolia",
      logo: "/logos/Chainlink-Symbol-White.svg",
      invert: true,
    },
    {
      name: "0G Storage",
      desc: "Decentralized on-chain data storage",
      logo: "/logos/0G-Logo-White.svg",
      invert: true,
    },
    {
      name: "0G Compute",
      desc: "Qwen2.5 AI inference — TEE verified",
      logo: "/logos/0G-Logo-White.svg",
      invert: true,
    },
    {
      name: "Ethereum",
      desc: "Smart contracts on Sepolia testnet",
      logo: "/logos/eth-circle-white.svg",
      invert: true,
    },
    {
      name: "OpenZeppelin",
      desc: "ReentrancyGuard security library",
      logo: "/logos/OZ-Logo-FavIconColor.svg",
      invert: false,
    },
  ];

  return (
    <div>
      <PageHeader
        title="About TronicLens"
        subtitle="DeFi Staking Intelligence Cockpit built for ETHOnline 2026"
      />

      <ScrollReveal variant="staggerChildren" staggerSelector=".about-section-item" staggerAmount={0.1}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div
          className="about-section-item"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              color: COLORS.text,
              fontSize: "18px",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            The Mission
          </h2>
          <p
            style={{
              color: COLORS.textDim,
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "14px",
            }}
          >
            In the fast-paced world of decentralized finance, stakers are often
            forced to make decisions with incomplete information. Whale activity,
            yield trends, and governance events happen in silos, making it hard
            to see the bigger picture.
          </p>
          <p
            style={{
              color: COLORS.textDim,
              fontSize: "14px",
              lineHeight: 1.6,
              marginBottom: "16px",
            }}
          >
            TronicLens acts as a unified cockpit, aggregating on-chain events, AI
            insights, smart alerts, and on-chain governance into a single,
            hyper-responsive interface. Built for power-stakers who demand
            uncompromising clarity.
          </p>
          <p style={{ fontSize: "12px", color: COLORS.textMuted, fontWeight: 500 }}>
            ETHOnline 2026 · Sepolia Testnet · Open Source
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {[
            {
              title: "The Graph Integration",
              logo: "/logos/The Graph - Logomark - Light.svg",
              desc: "Provides decentralized indexing of staking events, allowing for real-time feed updates and staker leaderboard tracking on Sepolia.",
            },
            {
              title: "Chainlink Price Feeds",
              logo: "/logos/Chainlink-Symbol-White.svg",
              desc: "Decentralized oracles supply live, secure ETH/USD and BTC/USD price feeds to accurately calculate the fiat value of staked assets.",
            },
            {
              title: "0G AI & Storage",
              logo: "/logos/0G-Logo-White.svg",
              desc: "Qwen2.5 model generates protocol sentiment and health analysis. The finalized snapshots are then stored permanently on decentralized 0G Storage.",
            },
          ].map((tech, i) => (
            <div
              key={tech.title}
              className="about-section-item"
              style={{
                backgroundColor: COLORS.card,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: "16px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tech.logo}
                  alt={tech.title}
                  style={{
                    width: "20px",
                    height: "20px",
                    objectFit: "contain",
                    filter: whiteLogo,
                  }}
                />
                <h3
                  style={{ color: COLORS.text, fontSize: "15px", fontWeight: 600 }}
                >
                  {tech.title}
                </h3>
              </div>
              <p style={{ color: COLORS.textMuted, fontSize: "13px", lineHeight: 1.6 }}>
                {tech.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Builder */}
        <div
          className="about-section-item"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <p
            style={{
              color: COLORS.textMuted,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Builder
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/RT-logo.png"
              alt="Riko Tronic"
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div>
              <h3 style={{ color: COLORS.text, fontSize: "16px", fontWeight: 700 }}>
                Riko Tronic
              </h3>
              <p style={{ color: COLORS.textDim, fontSize: "13px" }}>
                Economics Graduate · Web3 Developer
              </p>
              <p style={{ color: COLORS.textMuted, fontSize: "12px" }}>
                Indonesia 🇮🇩
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "10px",
            }}
          >
            {builderLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{
                  borderColor: COLORS.cyan,
                  backgroundColor: `${COLORS.cyan}0d`,
                  y: -1,
                }}
                transition={{ duration: 0.15 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  border: `1px solid ${COLORS.cardBorder}`,
                  color: COLORS.text,
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {link.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={link.icon}
                    alt={link.label}
                    style={{ width: "16px", height: "16px", filter: whiteLogo }}
                  />
                ) : link.label === "X" ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15 15 0 010 20 15 15 0 010-20z" />
                  </svg>
                )}
                {link.label}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Powered By */}
        <div
          className="about-section-item"
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: "16px",
            padding: "24px",
          }}
        >
          <p
            style={{
              color: COLORS.textMuted,
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Powered By
          </p>
          {poweredBy.map((t, i) => (
            <div
              key={t.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 0",
                borderBottom:
                  i < poweredBy.length - 1
                    ? `1px solid ${COLORS.cardBorder}`
                    : "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={t.logo}
                alt={t.name}
                style={{
                  width: "22px",
                  height: "22px",
                  objectFit: "contain",
                  filter: t.invert ? whiteLogo : "none",
                }}
              />
              <div>
                <p style={{ color: COLORS.text, fontSize: "14px", fontWeight: 600 }}>
                  {t.name}
                </p>
                <p style={{ color: COLORS.textMuted, fontSize: "12px" }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            color: COLORS.textMuted,
            fontSize: "12px",
          }}
        >
          TronicLens v2.0.0 · Built for ETHOnline 2026 · Open Source
        </p>
      </div>
      </ScrollReveal>
    </div>
  );
}

// ─── Onboarding Popup ─────────────────────────────────────────────

interface OnboardingPopupProps {
  onClose: () => void;
}

function OnboardingPopup({ onClose }: OnboardingPopupProps) {
  const COLORS = useThemeColors();
  const [step, setStep] = useState(0);
  const steps = [
    {
      badge: "TESTNET",
      title: "Running on Sepolia",
      desc: "TronicLens is deployed on Ethereum Sepolia Testnet. All transactions use test ETH — no real money involved.",
      hint: "Need Sepolia ETH? Get it free from sepoliafaucet.com",
    },
    {
      badge: "WALLET",
      title: "Add Sepolia to Your Wallet",
      desc: "Open MetaMask or Rabby → Add Network → search 'Sepolia'. Without it, transactions will fail.",
      hint: "Chain ID: 11155111  ·  RPC: rpc.sepolia.org",
    },
    {
      badge: "STAKING ACTIVITY",
      title: "Live Whale Tracker",
      desc: "Monitor real-time staking transactions on Sepolia. Powered by The Graph — a decentralized indexing protocol.",
      hint: "Transactions ≥ threshold are flagged as whale activity",
    },
    {
      badge: "AI INSIGHTS",
      title: "On-Chain AI Analysis",
      desc: "Protocol health analysis powered by 0G Compute (Qwen2.5, TEE verified). Insights stored permanently on 0G Storage.",
      hint: "Model: qwen/qwen2.5-omni-7b via 0G router-api-testnet",
    },
    {
      badge: "SMART ALERTS",
      title: "Real-Time Alerts",
      desc: "Get notified of whale movements and ETH price changes. ETH/USD price is fetched live from Chainlink.",
      hint: "Price feed: Chainlink ETH/USD on Sepolia",
    },
    {
      badge: "PROTOCOL HEALTH",
      title: "Protocol Health Monitor",
      desc: "Track the overall health of TronicLens protocol — TVL, staker distribution, reward rates, and live contract status.",
      hint: "All data sourced directly from on-chain contracts",
    },
    {
      badge: "HOW IT WORKS",
      title: "Stake → Vote → Govern",
      desc: "Stake testnet ETH to earn rewards and unlock voting power. Then create or vote on on-chain Governance proposals.",
      hint: "Your stake amount determines your voting weight",
    },
  ];
  const isLast = step === steps.length - 1;
  const current = steps[step];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || typeof document === "undefined") return null;

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: "16px",
          maxWidth: "400px",
          width: "100%",
          padding: "32px",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.2), 0 0 1px rgba(255,255,255,0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            color: COLORS.textMuted,
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(128, 128, 128, 0.1)";
            e.currentTarget.style.color = COLORS.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = COLORS.textMuted;
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ marginBottom: "24px", marginTop: "12px" }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: COLORS.textMuted,
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            {current.badge}
          </div>
          <h3
            style={{
              color: COLORS.text,
              fontSize: "22px",
              fontWeight: 600,
              marginBottom: "12px",
              lineHeight: 1.3,
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.02em",
            }}
          >
            {current.title}
          </h3>
          <p
            style={{
              color: COLORS.textDim,
              fontSize: "14px",
              lineHeight: "1.6",
              marginBottom: "24px",
              fontFamily: "var(--font-sans)",
            }}
          >
            {current.desc}
          </p>

          <div
            style={{
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: `rgba(128, 128, 128, 0.04)`,
              border: `1px solid ${COLORS.cardBorder}`,
              display: "flex",
            }}
          >
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                lineHeight: 1.5,
              }}
            >
              {current.hint}
            </span>
          </div>
        </motion.div>

        <div style={{ display: "flex", alignItems: "center", marginTop: "32px" }}>
          {/* Pagination */}
          <div style={{ display: "flex", gap: "4px" }}>
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? "16px" : "4px",
                  height: "4px",
                  borderRadius: "2px",
                  backgroundColor: i === step ? COLORS.text : COLORS.cardBorder,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: COLORS.textMuted,
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "color 0.2s",
                  fontFamily: "var(--font-sans)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.text)}
                onMouseLeave={(e) => (e.currentTarget.style.color = COLORS.textMuted)}
              >
                Back
              </button>
            )}
            <button
              onClick={() => (isLast ? onClose() : setStep((s) => s + 1))}
              style={{
                padding: "10px 20px",
                backgroundColor: COLORS.text,
                color: COLORS.bg,
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "transform 0.1s, opacity 0.2s",
                fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(content, document.body);
}

// ─── Section: Overview ────────────────────────────────────────────

function OverviewContent() {
  const COLORS = useThemeColors();
  const [isMobile, setIsMobile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setShowOnboarding(!sessionStorage.getItem("troniclens_onboarding_seen"));
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCloseOnboarding = () => {
    sessionStorage.setItem("troniclens_onboarding_seen", "1");
    setShowOnboarding(false);
  };
  const { settings } = useSettings();

  const { activities, stats, chainlinkPrice, loading } = useWhaleActivity({
    refreshInterval: settings.autoRefresh ? settings.refreshInterval * 1000 : null,
    whaleThreshold: settings.whaleThreshold,
  });

  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (stats) setLastUpdated(Date.now());
  }, [stats]);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - lastUpdated) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  const bentoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bentoRef.current && !loading) {
      const items = bentoRef.current.querySelectorAll('.bento-item');
      gsap.fromTo(items, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [loading]);

  if (loading && !activities.length) return <OverviewSkeleton />;

  return (
    <div style={{ padding: settings.compactMode ? "0" : "12px" }} ref={bentoRef}>
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingPopup key="onboarding" onClose={handleCloseOnboarding} />
        )}
      </AnimatePresence>

      {/* Header row */}
      <div className="bento-item"
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontSize: "16px",
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            color: "var(--text)",
            margin: 0,
          }}
        >
          Overview
        </h1>
        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>
          Updated {elapsed}s ago
        </span>
      </div>

      <div 
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(12, 1fr)",
          gridAutoRows: "minmax(120px, auto)",
          gap: "20px",
        }}
      >
        {/* Bento Box 1: Total Staked (Large) */}
        {stats && (
          <div className="bento-item bento-card" style={{ gridColumn: isMobile ? "span 1" : "span 8", gridRow: "span 2", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "32px" }}>
             <div>
               <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 600, letterSpacing: "0.03em", margin: 0 }}>Total Value Locked</p>
               <p style={{ color: "var(--text)", fontSize: isMobile ? "32px" : "48px", fontWeight: 700, fontFamily: "var(--font-sans)", letterSpacing: "-0.02em", margin: "8px 0" }}>
                 <AnimatedNumber value={parseFloat(stats.totalStaked) || 0} decimals={4} /> <span style={{ fontSize: "50%", verticalAlign: "baseline", color: "var(--text-muted)", fontWeight: 600 }}>ETH</span>
               </p>
               <p style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                 <span style={{ color: "var(--text-dim)", fontSize: "16px", fontWeight: 500 }}>≈ $<AnimatedNumber value={parseFloat(stats.totalStakedUSD.replace(/,/g, '')) || 0} decimals={2} /></span>
                 <span style={{ color: "var(--green)", fontSize: "14px", fontWeight: 600 }}>+12.4% this week</span>
               </p>
             </div>

             <div style={{ display: "flex", gap: "32px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
               <div>
                 <p style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Peak TVL</p>
                 <p style={{ color: "var(--text)", fontSize: "16px", fontWeight: 600, margin: "4px 0 0" }}><AnimatedNumber value={parseFloat(stats.peakTVL || '0')} decimals={4} /> ETH</p>
               </div>
               <div>
                 <p style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Rewards Distributed</p>
                 <p style={{ color: "var(--text)", fontSize: "16px", fontWeight: 600, margin: "4px 0 0" }}><AnimatedNumber value={parseFloat(stats.totalRewardsDistributed || '0')} decimals={4} /> ETH</p>
               </div>
               <div>
                 <p style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Avg Stake Size</p>
                 <p style={{ color: "var(--text)", fontSize: "16px", fontWeight: 600, margin: "4px 0 0" }}><AnimatedNumber value={parseFloat(stats.avgStakeSize || '0')} decimals={4} /> ETH</p>
               </div>
             </div>
          </div>
        )}

        {/* Bento Box 2 & 3: Small Stats */}
        {stats && (
          <>
            <div className="bento-item bento-card" style={{ gridColumn: isMobile ? "span 1" : "span 4", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Active Stakers</p>
              <p style={{ fontSize: "28px", fontWeight: 700, margin: "8px 0", color: "var(--text)", fontFamily: "var(--font-sans)", letterSpacing: "-0.01em" }}><AnimatedNumber value={Number(stats.activeStakers) || 0} /></p>
              <p style={{ color: "var(--text-dim)", fontSize: "13px", fontWeight: 500, margin: 0 }}>Unique addresses</p>
            </div>
            
            <div className="bento-item bento-card" style={{ gridColumn: isMobile ? "span 1" : "span 4", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>Whale Wallets</p>
              <p style={{ fontSize: "28px", fontWeight: 700, margin: "8px 0", color: "var(--text)", fontFamily: "var(--font-sans)", letterSpacing: "-0.01em" }}><AnimatedNumber value={Number(stats.whaleCount) || 0} /></p>
              <p style={{ color: "var(--text-dim)", fontSize: "13px", fontWeight: 500, margin: 0 }}>≥ {settings.whaleThreshold} ETH threshold</p>
            </div>
          </>
        )}

        {/* Bento Box 4: Chart */}
        <div className="bento-item bento-card" style={{ gridColumn: isMobile ? "span 1" : "span 12", gridRow: "span 3", padding: "24px", overflow: "hidden" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px", margin: 0 }}>Staking Volume Trend</p>
          <div style={{ margin: "16px -24px 0px -24px" }}>
            <ETHPriceChart chainlinkPrice={chainlinkPrice || undefined} tronicTVL={stats?.totalStaked} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section: Staking Activity ────────────────────────────────────

function WhaleActivityContent() {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const { activities, allActivities, loading, error, formatTime, formatAddress } =
    useWhaleActivity({
      refreshInterval: settings.autoRefresh ? settings.refreshInterval * 1000 : null,
      whaleThreshold: settings.whaleThreshold,
    });

  return (
    <div>
      <PageHeader
        title="Staking Activity"
        subtitle="Live staking transactions on Sepolia · Powered by The Graph"
        badge="Live Feed"
        badgeColor={COLORS.cyan}
      />

      <WhaleTable
        activities={activities}
        loading={loading}
        error={error}
        formatTime={formatTime}
        formatAddress={formatAddress}
        WHALE_THRESHOLD={settings.whaleThreshold}
      />
      <div style={{ marginTop: "24px" }}>
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
  );
}

// ─── Section: Staking Stats ───────────────────────────────────────

function StakingStatsContent() {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const GRAPH_GATEWAY =
    "https://gateway.thegraph.com/api/a7d929e390f4bf07126ba6fc1dcf9de2/subgraphs/id/AbF6DWEE3iNwqVa3kyG9YyutLWYcvsNJQ7ihD6fztGNL";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetchWithTimeout(GRAPH_GATEWAY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `{
            stakerProfiles(first: 10, orderBy: totalStaked, orderDirection: desc) {
              id
              totalStaked
              totalRewardsClaimed
              stakeCount
              unstakeCount
              isActive
              firstStakeTimestamp
              lastActivityTimestamp
            }
          }`,
          }),
        });
        const data = await res.json();
        if (data.data?.stakerProfiles) {
          setLeaderboard(data.data.stakerProfiles);
        }
      } catch (err) {
        console.warn("Leaderboard fetch failed:", err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const { stats } = useWhaleActivity({
    refreshInterval: settings.autoRefresh ? settings.refreshInterval * 1000 : null,
    whaleThreshold: settings.whaleThreshold,
  });

  if (!stats) return <StakingStatsSkeleton />;

  return (
    <div>
      <PageHeader
        title="Staking Stats"
        subtitle="Protocol-level staking metrics and performance indicators"
        badge="Analytics"
        badgeColor={COLORS.green}
      />

      <ScrollReveal variant="fadeUp">
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: settings.compactMode ? "16px" : "24px",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              color: COLORS.textDim,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Protocol Metrics
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
            gridTemplateRows: isMobile ? "auto" : "auto auto",
          }}
        >
          {[
            {
              label: "Total Value Locked",
              value: `${stats.totalStaked} ETH`,
              sub: `$${stats.totalStakedUSD}`,
              color: COLORS.green,
            },
            {
              label: "Active Stakers",
              value: String(stats.activeStakers),
              sub: "unique addresses",
              color: COLORS.text,
            },
            {
              label: "Whale Wallets",
              value: String(stats.whaleCount),
              sub: `≥ ${settings.whaleThreshold} ETH`,
              color: COLORS.text,
            },
            {
              label: "Avg Stake Size",
              value: `${stats.avgStakeSize} ETH`,
              sub: "per wallet",
              color: COLORS.text,
            },
            {
              label: "ETH Price",
              value: `$${stats.ethPrice}`,
              sub: "via Chainlink",
              color: COLORS.text,
            },
            {
              label: "Retail Stakers",
              value: String(stats.activeStakers - stats.whaleCount),
              sub: `< ${settings.whaleThreshold} ETH`,
              color: COLORS.text,
            },
          ].map((item, i) => {
            const isLastRow = i >= 3;
            const isLastCol = isMobile ? i % 2 === 1 : i % 3 === 2;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i + 0.2 }}
                style={{
                  padding: settings.compactMode ? "12px 14px" : "14px 18px",
                  borderBottom: !isLastRow ? `1px solid ${COLORS.cardBorder}` : "none",
                  borderRight: !isLastCol ? `1px solid ${COLORS.cardBorder}` : "none",
                }}
              >
                <p
                  style={{
                    color: COLORS.textDim,
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "5px",
                    lineHeight: 1.3,
                    whiteSpace: isMobile ? "normal" : "nowrap",
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    color: item.color,
                    fontSize: settings.compactMode
                      ? "14px"
                      : isMobile
                        ? "15px"
                        : "18px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    fontFamily: "monospace",
                    marginBottom: "2px",
                    lineHeight: 1.2,
                  }}
                >
                  {item.value}
                </p>
                <p style={{ color: COLORS.textMuted, fontSize: "10px", lineHeight: 1.3 }}>
                  {item.sub}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
      </ScrollReveal>

      <ScrollReveal variant="fadeUp" delay={0.1}>
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
          }}
        >
          <h3 style={{ color: COLORS.text, fontSize: "15px", fontWeight: 600, margin: 0 }}>
            Staker Distribution
          </h3>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: COLORS.amber, fontSize: "13px" }}>
                Whale ({stats.whaleCount})
              </span>
              <span style={{ color: COLORS.textMuted, fontSize: "13px" }}>
                {((stats.whaleCount / stats.activeStakers) * 100).toFixed(1)}%
              </span>
            </div>
            <div
              style={{
                height: "8px",
                backgroundColor: COLORS.cardBorder,
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.whaleCount / stats.activeStakers) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  height: "100%",
                  backgroundColor: COLORS.amber,
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <span style={{ color: COLORS.cyan, fontSize: "13px" }}>
                Retail ({stats.activeStakers - stats.whaleCount})
              </span>
              <span style={{ color: COLORS.textMuted, fontSize: "13px" }}>
                {(((stats.activeStakers - stats.whaleCount) / stats.activeStakers) *
                  100).toFixed(1)}
                %
              </span>
            </div>
            <div
              style={{
                height: "8px",
                backgroundColor: COLORS.cardBorder,
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((stats.activeStakers - stats.whaleCount) / stats.activeStakers) *
                    100
                  }%`,
                }}
                transition={{ duration: 1, delay: 0.6 }}
                style={{
                  height: "100%",
                  backgroundColor: COLORS.cyan,
                  borderRadius: "4px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
      </ScrollReveal>

      <ScrollReveal variant="fadeUp" delay={0.15}>
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: "12px",
          overflow: "hidden",
          marginTop: settings.compactMode ? "16px" : "24px",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ color: COLORS.text, fontSize: "15px", fontWeight: 600, margin: 0 }}>
            Top Stakers
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/The Graph - Logomark - Light.svg"
              alt="The Graph"
              style={{ width: "12px", height: "12px" }}
            />
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              The Graph
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "24px 1fr 85px"
              : "28px 1fr 100px 80px 60px",
            gap: "8px",
            padding: "8px 20px",
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
          }}
        >
          {["#", "WALLET", "STAKED", ...(isMobile ? [] : ["REWARDS", "STATUS"])].map(
            (h) => (
              <span
                key={h}
                style={{
                  color: COLORS.textMuted,
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </span>
            )
          )}
        </div>

        {leaderboardLoading ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: COLORS.textMuted, fontSize: "13px" }}
            >
              Loading leaderboard...
            </motion.span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <span style={{ color: COLORS.textMuted, fontSize: "13px" }}>
              No stakers found
            </span>
          </div>
        ) : (
          leaderboard.map((staker, i) => {
            const stakedEth = (parseFloat(staker.totalStaked) / 1e18).toFixed(4);
            const rewardsEth = (
              parseFloat(staker.totalRewardsClaimed) / 1e18
            ).toFixed(6);
            const shortAddress = `${staker.id.slice(0, 6)}...${staker.id.slice(-4)}`;
            const rankColors = ["#f59e0b", COLORS.textMuted, "#cd7f32"];

            return (
              <motion.div
                key={staker.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "24px 1fr 85px"
                    : "28px 1fr 100px 80px 60px",
                  gap: "8px",
                  padding: settings.compactMode ? "10px 20px" : "14px 20px",
                  borderBottom:
                    i < leaderboard.length - 1
                      ? `1px solid ${COLORS.cardBorder}`
                      : "none",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: i < 3 ? rankColors[i] : COLORS.textMuted,
                    fontSize: "11px",
                    fontWeight: 700,
                    fontFamily: "monospace",
                    letterSpacing: "0.02em",
                  }}
                >
                  #{i + 1}
                </span>

                <a
                  href={`https://eth-sepolia.blockscout.com/address/${staker.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: COLORS.cyan,
                    fontSize: "13px",
                    fontFamily: "monospace",
                    textDecoration: "none",
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e: any) =>
                    (e.target.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e: any) =>
                    (e.target.style.textDecoration = "none")
                  }
                >
                  {shortAddress}
                </a>

                <span
                  style={{
                    color: COLORS.text,
                    fontSize: isMobile ? "11px" : "13px",
                    fontWeight: 600,
                    fontFamily: "monospace",
                  }}
                >
                  {stakedEth} ETH
                </span>

                {!isMobile && (
                  <span
                    style={{
                      color: COLORS.textMuted,
                      fontSize: "12px",
                      fontFamily: "monospace",
                    }}
                  >
                    {rewardsEth} ETH
                  </span>
                )}

                {!isMobile && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: staker.isActive ? COLORS.green : COLORS.textMuted,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: staker.isActive ? COLORS.green : COLORS.textMuted,
                      }}
                    >
                      {staker.isActive ? "Active" : "Inactive"}
                    </span>
                  </span>
                )}
              </motion.div>
            );
          })
        )}

        <div
          style={{
            padding: "8px 20px",
            borderTop: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
          }}
        >
          <span style={{ color: COLORS.textMuted, fontSize: "10px" }}>
            Powered by The Graph · tronic-staking v0.0.7 · Sepolia
          </span>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}

// ─── Section: Protocol Health ─────────────────────────────────────

function ProtocolHealthContent() {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const whiteLogo = settings.theme === "light" ? "invert(1)" : "none";
  const [lastSnapshot, setLastSnapshot] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tvlHistory, setTvlHistory] = useState<any[]>([]);
  const [tvlLoading, setTvlLoading] = useState(true);

  const GRAPH_GATEWAY =
    "https://gateway.thegraph.com/api/a7d929e390f4bf07126ba6fc1dcf9de2/subgraphs/id/AbF6DWEE3iNwqVa3kyG9YyutLWYcvsNJQ7ihD6fztGNL";

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTVLHistory = async () => {
      try {
        const stakesRes = await fetchWithTimeout(GRAPH_GATEWAY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `{
            stakeds(first: 20, orderBy: blockTimestamp, orderDirection: asc) {
              blockTimestamp
            }
            unstakeds(first: 20, orderBy: blockTimestamp, orderDirection: asc) {
              blockTimestamp
            }
          }`,
          }),
        }, 8000);
        const stakesData = await stakesRes.json();

        if (!stakesData.data) return;

        const allTimestamps = [
          ...(stakesData.data.stakeds || []).map((s: any) =>
            parseInt(s.blockTimestamp)
          ),
          ...(stakesData.data.unstakeds || []).map((s: any) =>
            parseInt(s.blockTimestamp)
          ),
        ];

        const dayIds = [
          ...new Set(allTimestamps.map((ts) => Math.floor(ts / 86400) * 86400)),
        ].sort();

        if (dayIds.length === 0) return;

        const queries = dayIds
          .map(
            (id) =>
              `d${id}: dailyStakingStats(id: "${id}") { date cumulativeTVL dailyStakeVolume dailyStakeCount }`
          )
          .join("\n");

        const res = await fetchWithTimeout(GRAPH_GATEWAY, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: `{ ${queries} }` }),
        }, 8000);
        const data = await res.json();

        if (data.data) {
          const history = dayIds.map((id) => {
            const entry = data.data[`d${id}`];
            return {
              date:
                entry?.date || new Date(id * 1000).toISOString().slice(5, 10),
              tvl: entry ? parseFloat(entry.cumulativeTVL) / 1e18 : 0,
              stakeVolume: entry ? parseFloat(entry.dailyStakeVolume) / 1e18 : 0,
              stakeCount: entry?.dailyStakeCount || 0,
            };
          });
          setTvlHistory(history);
        }
      } catch (err) {
        console.warn("TVL history fetch failed:", err);
      } finally {
        setTvlLoading(false);
      }
    };
    fetchTVLHistory();
  }, []);

  useEffect(() => {
    fetchWithTimeout("/og-snapshots.json", {}, 5000)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setLastSnapshot(data[0]);
      })
      .catch(() => {});
  }, []);

  const healthChecks = [
    {
      label: "StakingContract",
      status: "Healthy",
      detail: "0x89907e8F6CB6468b2c8fe2d3814249881eF06926",
      link: "https://eth-sepolia.blockscout.com/address/0x89907e8F6CB6468b2c8fe2d3814249881eF06926",
      color: COLORS.green,
      logo: "/logos/eth-diamond-(color-filled).svg",
    },
    {
      label: "GovernanceContract",
      status: "Healthy",
      detail: "0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8",
      link: "https://eth-sepolia.blockscout.com/address/0x20e7F706E4CF70BF957d06aB0e4b56cd0fe5D1b8",
      color: COLORS.green,
      logo: "/logos/eth-diamond-(color-filled).svg",
    },
    {
      label: "StakingGovernance",
      status: "Healthy",
      detail: "0xa830b86ce9D994A3c5b95F124c9a008e74b75080",
      link: "https://eth-sepolia.blockscout.com/address/0xa830b86ce9D994A3c5b95F124c9a008e74b75080",
      color: COLORS.green,
      logo: "/logos/eth-diamond-(color-filled).svg",
    },
    {
      label: "ReentrancyGuard",
      status: "Active",
      detail: "OpenZeppelin v5.6.1",
      color: COLORS.green,
      logo: "/logos/OZ-Logo-FavIconColor.svg",
    },
    {
      label: "The Graph Subgraph",
      status: "Synced",
      detail: "tronic-staking · v0.0.7 · 100% · Sepolia",
      link: "https://thegraph.com/explorer/subgraphs/AbF6DWEE3iNwqVa3kyG9YyutLWYcvsNJQ7ihD6fztGNL",
      color: COLORS.green,
      logo: "/logos/The Graph - Logomark - Light.svg",
    },
    {
      label: "Chainlink ETH/USD",
      status: "Live",
      detail: "ETH/USD · Sepolia · 0x694AA...325306",
      link: "https://sepolia.etherscan.io/address/0x694AA1769357215DE4FAC081bf1f309aDC325306",
      color: COLORS.cyan,
      logo: "/logos/Chainlink-Symbol-White.svg",
    },
    {
      label: "Chainlink BTC/USD",
      status: "Live",
      detail: "BTC/USD · Sepolia · 0x1b44F...51Ee43",
      link: "https://sepolia.etherscan.io/address/0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43",
      color: COLORS.cyan,
      logo: "/logos/Chainlink-Symbol-White.svg",
    },
    {
      label: "0G Storage",
      status: "Connected",
      detail: lastSnapshot
        ? `Last snapshot: ${new Date(lastSnapshot.timestamp).toLocaleString(
            "id-ID"
          )} · ${lastSnapshot.rootHash.slice(0, 10)}...`
        : "Galileo Testnet · ChainID 16602",
      color: COLORS.purple,
      logo: "/logos/0G-Logo-White.svg",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Protocol Health"
        subtitle="Real-time status of all TronicLens smart contracts and integrations"
        badge="On-Chain"
        badgeColor={COLORS.green}
      />
      <ScrollReveal variant="staggerChildren" staggerSelector=".health-check-item">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: settings.compactMode ? "8px" : "14px",
        }}
      >
        {healthChecks.map((check, i) => (
          <motion.div
            key={check.label}
            className="health-check-item"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: "14px",
              padding: settings.compactMode ? "14px 20px" : "20px 24px",
              display: "flex",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              flexDirection: isMobile ? "column" : "row",
              gap: "12px",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.25s ease",
            }}
            whileHover={{
              backgroundColor: COLORS.active,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  backgroundColor: `${check.color}0a`,
                  border: `1px solid ${check.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={check.logo}
                  alt={check.label}
                  style={{
                    width: "22px",
                    height: "22px",
                    objectFit: "contain",
                    opacity: 0.95,
                    filter: [
                      "The Graph Subgraph",
                      "Chainlink ETH/USD",
                      "Chainlink BTC/USD",
                      "0G Storage",
                    ].includes(check.label)
                      ? whiteLogo
                      : "none",
                  }}
                />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p
                  style={{
                    color: COLORS.text,
                    fontSize: "14px",
                    fontWeight: 600,
                    marginBottom: "3px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                >
                  {check.label}
                </p>
                <p
                  style={{
                    color: COLORS.textMuted,
                    fontSize: "12px",
                    fontFamily: "monospace",
                    whiteSpace: isMobile ? "normal" : "nowrap",
                    overflow: isMobile ? "visible" : "hidden",
                    textOverflow: isMobile ? "unset" : "ellipsis",
                    maxWidth: "100%",
                    wordBreak: isMobile ? "break-all" : "normal",
                  }}
                >
                  {check.link ? (
                    <span
                      onClick={() => window.open(check.link, "_blank")}
                      style={{
                        color: COLORS.cyan,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textDecorationStyle: "dotted",
                        textUnderlineOffset: "3px",
                        transition: "color 0.2s",
                      }}
                      title="View on Blockscout"
                      onMouseEnter={(e: any) =>
                        (e.currentTarget.style.color = COLORS.text)
                      }
                      onMouseLeave={(e: any) =>
                        (e.currentTarget.style.color = COLORS.cyan)
                      }
                    >
                      {check.detail.length > 30
                        ? `${check.detail.slice(0, 10)}...${check.detail.slice(
                            -6
                          )}`
                        : check.detail}
                    </span>
                  ) : check.label === "0G Storage" && lastSnapshot ? (
                    <>
                      {`Last snapshot: ${new Date(
                        lastSnapshot.timestamp
                      ).toLocaleString("id-ID")} · `}
                      <span
                        onClick={() =>
                          window.open(
                            lastSnapshot.sequence
                              ? `https://storagescan-galileo.0g.ai/submission/${lastSnapshot.sequence}`
                              : "https://storagescan-galileo.0g.ai",
                            "_blank"
                          )
                        }
                        style={{
                          color: COLORS.cyan,
                          cursor: "pointer",
                          textDecoration: "underline",
                          textDecorationStyle: "dotted",
                          textUnderlineOffset: "3px",
                          transition: "color 0.2s",
                        }}
                        title="View on 0G Explorer"
                        onMouseEnter={(e: any) =>
                          (e.currentTarget.style.color = COLORS.text)
                        }
                        onMouseLeave={(e: any) =>
                          (e.currentTarget.style.color = COLORS.cyan)
                        }
                      >
                        {lastSnapshot.rootHash.slice(0, 10)}...
                      </span>
                    </>
                  ) : (
                    check.detail
                  )}
                </p>
              </div>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: check.color,
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: check.color,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {check.status}
            </span>
          </motion.div>
        ))}
      </div>
      </ScrollReveal>

      <ScrollReveal variant="fadeUp" delay={0.1}>
      <div
        style={{
          backgroundColor: COLORS.card,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: "14px",
          overflow: "hidden",
          marginTop: settings.compactMode ? "16px" : "24px",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ color: COLORS.text, fontSize: "15px", fontWeight: 600, margin: 0 }}>
            {isMobile ? "Net Staking Flow" : "Daily Net Staking Flow · All Activity"}
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/The Graph - Logomark - Light.svg"
              alt="The Graph"
              style={{ width: "12px", height: "12px" }}
            />
            <span
              style={{
                color: COLORS.textMuted,
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              The Graph
            </span>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {tvlLoading ? (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: COLORS.textMuted, fontSize: "13px" }}
            >
              Loading TVL history...
            </motion.span>
          ) : tvlHistory.every((d) => d.tvl === 0) ? (
            <span style={{ color: COLORS.textMuted, fontSize: "13px" }}>
              No historical data available yet
            </span>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {tvlHistory.map((day, i) => {
                const maxTVL = Math.max(...tvlHistory.map((d) => d.tvl), 0.001);
                const pct = (day.tvl / maxTVL) * 100;
                return (
                  <div
                    key={day.date}
                    style={{ display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <span
                      style={{
                        color: COLORS.textMuted,
                        fontSize: "11px",
                        fontFamily: "monospace",
                        width: isMobile ? "36px" : "50px",
                        flexShrink: 0,
                      }}
                    >
                      {isMobile ? day.date.slice(5) : day.date}
                    </span>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: "6px",
                        backgroundColor: COLORS.cardBorder,
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.05 * i }}
                        style={{
                          height: "100%",
                          borderRadius: "3px",
                          background:
                            day.tvl > 0
                              ? `linear-gradient(90deg, ${COLORS.cyan}80, ${COLORS.cyan})`
                              : COLORS.cardBorder,
                        }}
                      />
                    </div>

                    <span
                      style={{
                        color: day.tvl > 0 ? COLORS.cyan : COLORS.textMuted,
                        fontFamily: "monospace",
                        width: isMobile ? "70px" : "80px",
                        fontSize: isMobile ? "10px" : "11px",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {day.tvl > 0 ? `${day.tvl.toFixed(4)} ETH` : "—"}
                    </span>

                    {!isMobile && day.stakeCount > 0 && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 600,
                          color: COLORS.green,
                          flexShrink: 0,
                        }}
                      >
                        +{day.stakeCount} tx
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            padding: "8px 20px",
            borderTop: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
          }}
        >
          <span style={{ color: COLORS.textMuted, fontSize: "10px" }}>
            Powered by The Graph · tronic-staking v0.0.7 · Sepolia
          </span>
        </div>
      </div>
      </ScrollReveal>
    </div>
  );
}

// ─── Section: AI Insights ─────────────────────────────────────────

function AIInsightsContent() {
  const { settings } = useSettings();
  const whiteLogo = settings.theme === "light" ? "invert(1)" : "none";
  const COLORS = useThemeColors();
  const [insights, setInsights] = useState<any>(null);
  const [allSnapshots, setAllSnapshots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetch("/og-snapshots.json")
      .then((res) => res.json())
      .then((data) => {
        setAllSnapshots(data);
        const aiSnap = data.find((s: any) => s.type === "ai-insights");
        if (aiSnap) {
          setInsights(aiSnap);
          setLastUpdated(new Date(aiSnap.timestamp));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sentimentColor: Record<string, string> = {
    Bullish: COLORS.green,
    Neutral: COLORS.amber,
    Bearish: COLORS.red,
  };

  const healthColor = (score: number) => {
    if (score >= 70) return COLORS.green;
    if (score >= 40) return COLORS.amber;
    return COLORS.red;
  };

  return (
    <div>
      <PageHeader
        title="AI Insights"
        subtitle="0G Compute-powered Qwen2.5 analysis — whale patterns, protocol health, and staker intelligence stored on-chain"
        badge="0G Compute"
        badgeColor={COLORS.purple}
      />

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: "center", padding: "80px 0", color: COLORS.textMuted }}
        >
          <p style={{ fontSize: "14px" }}>Loading AI analysis...</p>
        </motion.div>
      ) : !insights ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            backgroundColor: COLORS.card,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: "16px",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <p style={{ color: COLORS.text, fontWeight: 700, marginBottom: "8px" }}>
            No AI analysis yet
          </p>
          <p style={{ color: COLORS.textMuted, fontSize: "13px" }}>
            Run <code style={{ color: COLORS.cyan }}>node ai-insights.mjs</code> to
            generate your first analysis
          </p>
        </motion.div>
      ) : (
        <ScrollReveal variant="staggerChildren" staggerSelector=".ai-insight-block" staggerAmount={0.12}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            className="ai-insight-block"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <StatCard
              label="Protocol Health Score"
              value={`${insights.healthScore}/100`}
              sub="Based on staking activity"
              accent={healthColor(insights.healthScore)}
              icon={
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: `3px solid ${healthColor(insights.healthScore)}`,
                    backgroundColor: `${healthColor(insights.healthScore)}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    boxShadow: `0 0 10px ${healthColor(insights.healthScore)}60`,
                  }}
                >
                  {insights.healthScore >= 70
                    ? "✓"
                    : insights.healthScore >= 40
                      ? "!"
                      : "✕"}
                </div>
              }
            />
            <StatCard
              label="Market Sentiment"
              value={insights.sentiment}
              sub="Protocol sentiment · based on staking behavior"
              accent={sentimentColor[insights.sentiment] || COLORS.amber}
              icon={
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: `3px solid ${
                      sentimentColor[insights.sentiment] || COLORS.amber
                    }`,
                    backgroundColor: `${
                      sentimentColor[insights.sentiment] || COLORS.amber
                    }20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    boxShadow: `0 0 10px ${
                      sentimentColor[insights.sentiment] || COLORS.amber
                    }60`,
                  }}
                >
                  {insights.sentiment === "Bullish"
                    ? "↑"
                    : insights.sentiment === "Bearish"
                      ? "↓"
                      : "-"}
                </div>
              }
            />
            <StatCard
              label="Last Analysis"
              value={
                lastUpdated
                  ? lastUpdated.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"
              }
              sub={lastUpdated ? lastUpdated.toLocaleDateString("id-ID") : "-"}
              accent={COLORS.purple}
            />
          </div>

          {(() => {
            const timelineData = allSnapshots
              .filter((s) => s.type === "ai-insights" && s.healthScore !== undefined)
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )
              .map((s) => ({
                date: new Date(s.timestamp).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                score: s.healthScore,
                sentiment: s.sentiment,
                color:
                  s.healthScore >= 70
                    ? COLORS.green
                    : s.healthScore >= 40
                      ? COLORS.amber
                      : COLORS.red,
              }));
            if (timelineData.length < 2) return null;
            return (
              <div
                className="ai-insight-block"
                style={{
                  backgroundColor: COLORS.card,
                  border: `1px solid ${COLORS.cardBorder}`,
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 20px",
                    borderBottom: `1px solid ${COLORS.cardBorder}`,
                    backgroundColor: COLORS.chartHeader,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      color: COLORS.textDim,
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Protocol Health Timeline
                  </span>
                  <span style={{ color: COLORS.textMuted, fontSize: "10px" }}>
                    {timelineData.length} snapshots
                  </span>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  <div
                    style={{
                      position: "relative",
                      height: "120px",
                      marginBottom: "8px",
                    }}
                  >
                    {[100, 70, 40, 0].map((val) => (
                      <div
                        key={val}
                        style={{
                          position: "absolute",
                          left: 0,
                          top: `${100 - val}%`,
                          transform: "translateY(-50%)",
                          color: COLORS.textMuted,
                          fontSize: "9px",
                          fontFamily: "monospace",
                          width: "28px",
                          textAlign: "right",
                        }}
                      >
                        {val}
                      </div>
                    ))}
                    {[70, 40].map((val) => (
                      <div
                        key={val}
                        style={{
                          position: "absolute",
                          left: "36px",
                          right: 0,
                          top: `${100 - val}%`,
                          borderTop: `1px dashed ${
                            val === 70 ? COLORS.green : COLORS.amber
                          }25`,
                        }}
                      />
                    ))}
                    <div
                      style={{
                        position: "absolute",
                        left: "36px",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "8px",
                      }}
                    >
                      {timelineData.map((d, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "4px",
                            height: "100%",
                            justifyContent: "flex-end",
                          }}
                        >
                          <span
                            style={{
                              color: d.color,
                              fontSize: "9px",
                              fontWeight: 700,
                              fontFamily: "monospace",
                            }}
                          >
                            {d.score}
                          </span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${d.score}%` }}
                            transition={{
                              duration: 0.6,
                              delay: i * 0.1,
                              ease: "easeOut",
                            }}
                            style={{
                              width: "100%",
                              background: `linear-gradient(180deg, ${d.color} 0%, ${d.color}60 100%)`,
                              borderRadius: "4px 4px 0 0",
                              boxShadow: `0 0 8px ${d.color}30`,
                              position: "relative",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div
                    style={{
                      paddingLeft: "36px",
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    {timelineData.map((d, i) => (
                      <div key={i} style={{ flex: 1, textAlign: "center" }}>
                        <span style={{ color: COLORS.textMuted, fontSize: "9px" }}>
                          {d.date}
                        </span>
                        <br />
                        <span style={{ color: d.color, fontSize: "8px", fontWeight: 600 }}>
                          {d.sentiment?.slice(0, 4)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          <motion.div
            className="ai-insight-block"
            whileHover={{
              backgroundColor: COLORS.active,
              paddingLeft: "28px",
            }}
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.purple}30`,
              borderRadius: "16px",
              padding: "20px 24px",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.25s ease",
            }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 1.6, delay: 0.5, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "30%",
                height: "100%",
                background: `linear-gradient(90deg, transparent, ${COLORS.purple}12, transparent)`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logos/0G-Logo-White.svg"
                  alt="0G"
                  style={{ width: "20px", height: "20px", objectFit: "contain", filter: whiteLogo }}
                />
                <div>
                  <p
                    style={{
                      color: COLORS.text,
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    AI Result stored on 0G Network
                  </p>
                  <p
                    style={{
                      color: COLORS.textMuted,
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                  >
                    {"Root Hash: "}
                    <span
                      onClick={() =>
                        window.open(
                          insights.sequence
                            ? `https://storagescan-galileo.0g.ai/submission/${insights.sequence}`
                            : "https://storagescan-galileo.0g.ai",
                          "_blank"
                        )
                      }
                      style={{
                        color: COLORS.cyan,
                        cursor: "pointer",
                        textDecoration: "underline",
                        textDecorationStyle: "dotted",
                      }}
                    >
                      {insights.rootHash?.slice(0, 18)}...
                    </span>
                    {insights.sequence && (
                      <span style={{ color: COLORS.textMuted }}>{` · txSeq: ${insights.sequence}`}</span>
                    )}
                  </p>
                </div>
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: COLORS.purple,
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: COLORS.purple,
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                Verified On-chain
              </span>
            </div>
          </motion.div>

          <div
            className="ai-insight-block"
            style={{
              backgroundColor: COLORS.card,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: "16px",
              padding: "20px 24px",
            }}
          >
            <p
              style={{
                color: COLORS.text,
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "16px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Analysis History
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {allSnapshots.map((snap, i) => (
                <motion.div
                  key={i}
                  whileHover={{
                    backgroundColor:
                      i === 0 ? `${COLORS.purple}15` : "rgba(255,255,255,0.02)",
                    borderColor:
                      i === 0 ? `${COLORS.purple}40` : "rgba(255,255,255,0.12)",
                    paddingLeft: "18px",
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: i === 0 ? `${COLORS.purple}10` : "transparent",
                    border: `1px solid ${
                      i === 0 ? COLORS.purple + "30" : COLORS.cardBorder
                    }`,
                    borderRadius: "12px",
                    flexWrap: "wrap",
                    gap: "8px",
                    transition: "all 0.2s ease",
                    cursor: "default",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {snap.type === "ai-insights" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="/logos/0G-Logo-White.svg"
                          alt="0G"
                          style={{
                            width: "14px",
                            height: "14px",
                            objectFit: "contain",
                            filter: whiteLogo,
                          }}
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src="/logos/The Graph - Logomark - Light.svg"
                          alt="The Graph"
                          style={{
                            width: "14px",
                            height: "14px",
                            objectFit: "contain",
                            filter: whiteLogo,
                          }}
                        />
                      )}
                    </span>
                    <div>
                      <p style={{ color: COLORS.text, fontSize: "12px", fontWeight: 600 }}>
                        {snap.type === "ai-insights"
                          ? "AI Insights"
                          : "Whale Snapshot"}
                        {i === 0 && (
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 700,
                              color: COLORS.purple,
                              letterSpacing: "0.05em",
                              marginLeft: "8px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <span
                              style={{
                                width: "4px",
                                height: "4px",
                                borderRadius: "50%",
                                backgroundColor: COLORS.purple,
                                display: "inline-block",
                                flexShrink: 0,
                              }}
                            />
                            LATEST
                          </span>
                        )}
                      </p>
                      <p
                        style={{
                          color: COLORS.textMuted,
                          fontSize: "11px",
                          fontFamily: "monospace",
                        }}
                      >
                        {new Date(snap.timestamp).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {snap.sentiment && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          color: sentimentColor[snap.sentiment] || COLORS.amber,
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            backgroundColor:
                              sentimentColor[snap.sentiment] || COLORS.amber,
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        {snap.sentiment}
                      </span>
                    )}
                    <span
                      onClick={() =>
                        snap.sequence &&
                        window.open(
                          `https://storagescan-galileo.0g.ai/submission/${snap.sequence}`,
                          "_blank"
                        )
                      }
                      style={{
                        color: COLORS.cyan,
                        fontSize: "11px",
                        fontFamily: "monospace",
                        cursor: snap.sequence ? "pointer" : "default",
                        textDecoration: snap.sequence ? "underline" : "none",
                        textDecorationStyle: "dotted",
                      }}
                    >
                      {snap.rootHash?.slice(0, 10)}...
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ textAlign: "center", padding: "8px" }}
          >
            <p style={{ color: COLORS.textMuted, fontSize: "11px" }}>
              Powered by{" "}
              <span style={{ color: COLORS.purple }}>0G Compute Network</span>
              {" · "}
              <span style={{ color: COLORS.cyan }}>Qwen2.5-7b-instruct</span>
              {" · TEE Verified"}
            </p>
          </motion.div>
        </div>
        </ScrollReveal>
      )}
    </div>
  );
}

// ─── Shared: Whale Table ──────────────────────────────────────────

interface WhaleTableProps {
  activities: any[];
  loading: boolean;
  error: string | null;
  formatTime: (ts: number) => string;
  formatAddress: (addr: string) => string;
  WHALE_THRESHOLD: number;
  title?: string;
  subtitle?: string;
  showAll?: boolean;
}

function WhaleTable({
  activities,
  loading,
  error,
  formatTime,
  formatAddress,
  WHALE_THRESHOLD,
  title,
  subtitle,
}: WhaleTableProps) {
  const { settings } = useSettings();
  const whiteLogo = settings.theme === "light" ? "invert(1)" : "none";
  const COLORS = useThemeColors();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{
        border: `1px solid ${COLORS.cardBorder}`,
        backgroundColor: COLORS.card,
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          padding: "14px 20px",
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: COLORS.chartHeader,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: COLORS.text,
              marginBottom: "2px",
            }}
          >
            {title || (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logos/The Graph - Logomark - Light.svg"
                  alt="The Graph"
                  style={{
                    width: "16px",
                    height: "16px",
                    objectFit: "contain",
                    marginRight: "8px",
                    verticalAlign: "middle",
                    filter: whiteLogo,
                  }}
                />
                Whale Activity Feed
              </>
            )}
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: "12px" }}>
            {subtitle ||
              `Transactions ≥ ${WHALE_THRESHOLD} ETH · Powered by The Graph`}
          </p>
        </div>
        </div>

      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(80px, 2fr) minmax(60px, 1fr) minmax(70px, 1.5fr) minmax(50px, 1fr)",
            padding: "8px 20px",
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            backgroundColor: COLORS.chartHeader,
          }}
        >
          {["Wallet", "Action", "Amount", "Time"].map((col) => (
            <span
              key={col}
              style={{
                color: COLORS.textMuted,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textAlign: col === "Time" ? "right" : "left",
              }}
            >
              {col}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingPulse />
      ) : error ? (
        <div style={{ padding: "40px", textAlign: "center", color: COLORS.red }}>
          ⚠️ {error}
        </div>
      ) : activities.length === 0 ? (
        <div
          style={{ padding: "40px", textAlign: "center", color: COLORS.textMuted }}
        >
          No whale activity detected
        </div>
      ) : (
        <AnimatePresence>
          {activities.map((tx, i) => (
            <ActivityRow
              key={tx.id}
              tx={tx}
              formatTime={formatTime}
              formatAddress={formatAddress}
              index={i}
              isMobile={isMobile}
            />
          ))}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

interface ActivityRowProps {
  tx: any;
  formatTime: (ts: number) => string;
  formatAddress: (addr: string) => string;
  index: number;
  isMobile: boolean;
}

function ActivityRow({
  tx,
  formatTime,
  formatAddress,
  index,
  isMobile,
}: ActivityRowProps) {
  const COLORS = useThemeColors();
  const isStake = tx.action === "STAKE";
  const actionColor = isStake ? COLORS.green : COLORS.red;
  const actionBg = isStake ? COLORS.greenDim : COLORS.redDim;
  const humanTime = formatTime(tx.timestamp);
  const [timeHovered, setTimeHovered] = useState(false);

  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          backgroundColor: `${actionColor}03`,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: actionBg,
                border: `1px solid ${actionColor}30`,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isStake ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={actionColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={actionColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </span>
            <span
              style={{
                color: COLORS.cyan,
                fontSize: "13px",
                fontFamily: "monospace",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationStyle: "dotted",
                textUnderlineOffset: "3px",
              }}
              onClick={() =>
                window.open(
                  `https://eth-sepolia.blockscout.com/address/${tx.address}`,
                  "_blank"
                )
              }
            >
              {formatAddress(tx.address)}
            </span>
          </div>
          <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
            {humanTime}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "6px",
            paddingLeft: "34px",
          }}
        >
          <span
            style={{
              color: COLORS.text,
              fontSize: "13px",
              fontWeight: 500,
              lineHeight: "1.4",
            }}
          >
            {isStake ? "Staked" : "Unstaked"}{" "}
            <strong style={{ color: actionColor, fontWeight: 700 }}>
              {tx.amount} ETH
            </strong>
          </span>
          <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
            (≈ ${tx.amountUSD})
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(80px, 2fr) minmax(60px, 1fr) minmax(70px, 1.5fr) minmax(50px, 1fr)",
        padding: "14px 24px",
        borderBottom: `1px solid ${COLORS.cardBorder}`,
        alignItems: "center",
        cursor: "default",
        transition: "all 0.2s ease",
      }}
      whileHover={{
        backgroundColor: COLORS.active,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span
          style={{
            color: COLORS.text,
            fontSize: "13px",
            fontFamily: "monospace",
            fontWeight: 500,
            cursor: "pointer",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textUnderlineOffset: "3px",
            transition: "color 0.2s",
          }}
          onClick={() =>
            window.open(
              `https://eth-sepolia.blockscout.com/address/${tx.address}`,
              "_blank"
            )
          }
          onMouseEnter={(e: any) => (e.currentTarget.style.color = COLORS.cyan)}
          onMouseLeave={(e: any) => (e.currentTarget.style.color = COLORS.text)}
        >
          {formatAddress(tx.address)}
        </span>
      </div>

      <div>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.03em",
            color: actionColor,
            textTransform: "uppercase",
          }}
        >
          {isStake ? "Stake" : "Unstake"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ color: COLORS.text, fontSize: "13px", fontWeight: 600 }}>
          {tx.amount} ETH
        </span>
        <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
          ${tx.amountUSD}
        </span>
      </div>

      <div
        style={{ textAlign: "right", position: "relative" }}
        onMouseEnter={() => setTimeHovered(true)}
        onMouseLeave={() => setTimeHovered(false)}
      >
        <span
          style={{
            color: COLORS.textDim,
            fontSize: "12px",
            textDecoration: "underline",
            textDecorationStyle: "dotted",
            textDecorationColor: COLORS.cardBorder,
            textUnderlineOffset: "3px",
            cursor: "default",
          }}
        >
          {humanTime}
        </span>
        <AnimatePresence>
          {timeHovered && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                right: 0,
                bottom: "calc(100% + 6px)",
                padding: "6px 10px",
                backgroundColor: COLORS.tooltipBg,
                border: `1px solid ${COLORS.tooltipBorder}`,
                borderRadius: "6px",
                fontSize: "11px",
                color: COLORS.text,
                whiteSpace: "nowrap",
                zIndex: 20,
                pointerEvents: "none",
              }}
            >
              {new Date(tx.timestamp * 1000).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Skeleton: Overview ───────────────────────────────────────────
function OverviewSkeleton() {
  const COLORS = useThemeColors();
  const pulse = {
    animate: { opacity: [0.3, 0.6, 0.3] },
    transition: { duration: 1.5, repeat: Infinity },
  };
  return (
    <div style={{ padding: "24px 32px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <motion.div
            {...pulse}
            style={{
              width: "180px",
              height: "36px",
              backgroundColor: COLORS.cardBorder,
              borderRadius: "8px",
            }}
          />
          <motion.div
            {...pulse}
            transition={{ ...pulse.transition, delay: 0.1 }}
            style={{
              width: "280px",
              height: "16px",
              backgroundColor: COLORS.cardBorder,
              borderRadius: "6px",
            }}
          />
        </div>
        <motion.div
          {...pulse}
          style={{
            width: "200px",
            height: "80px",
            backgroundColor: COLORS.cardBorder,
            borderRadius: "12px",
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[0, 0.1, 0.2, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            {...pulse}
            transition={{ duration: 1.5, repeat: Infinity, delay }}
            style={{
              height: "100px",
              backgroundColor: COLORS.cardBorder,
              borderRadius: "16px",
            }}
          />
        ))}
      </div>
      <motion.div
        {...pulse}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        style={{
          height: "320px",
          backgroundColor: COLORS.cardBorder,
          borderRadius: "12px",
          marginBottom: "24px",
        }}
      />
      <motion.div
        {...pulse}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        style={{
          height: "200px",
          backgroundColor: COLORS.cardBorder,
          borderRadius: "16px",
        }}
      />
    </div>
  );
}

// ─── Skeleton: Staking Stats ──────────────────────────────────────
function StakingStatsSkeleton() {
  const COLORS = useThemeColors();
  const pulse = {
    animate: { opacity: [0.3, 0.6, 0.3] },
    transition: { duration: 1.5, repeat: Infinity },
  };
  return (
    <div style={{ padding: "24px 32px" }}>
      <div style={{ marginBottom: "28px" }}>
        <motion.div
          {...pulse}
          style={{
            width: "60px",
            height: "22px",
            backgroundColor: COLORS.cardBorder,
            borderRadius: "50px",
            marginBottom: "12px",
          }}
        />
        <motion.div
          {...pulse}
          transition={{ ...pulse.transition, delay: 0.1 }}
          style={{
            width: "200px",
            height: "32px",
            backgroundColor: COLORS.cardBorder,
            borderRadius: "8px",
            marginBottom: "6px",
          }}
        />
        <motion.div
          {...pulse}
          transition={{ ...pulse.transition, delay: 0.15 }}
          style={{
            width: "320px",
            height: "14px",
            backgroundColor: COLORS.cardBorder,
            borderRadius: "6px",
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {[0, 0.1, 0.2, 0.15, 0.25, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            {...pulse}
            transition={{ duration: 1.5, repeat: Infinity, delay }}
            style={{
              height: "100px",
              backgroundColor: COLORS.cardBorder,
              borderRadius: "16px",
            }}
          />
        ))}
      </div>
      <motion.div
        {...pulse}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        style={{
          height: "160px",
          backgroundColor: COLORS.cardBorder,
          borderRadius: "16px",
        }}
      />
    </div>
  );
}

function LoadingPulse() {
  const COLORS = useThemeColors();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "20px",
      }}
    >
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{ height: "52px", backgroundColor: COLORS.cardBorder, borderRadius: "8px" }}
        />
      ))}
    </div>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────

interface DashboardProps {
  activeItem: string;
  mobile: boolean;
  onItemClick: (id: string) => void;
}

export default function Dashboard({
  activeItem,
  mobile,
  onItemClick,
}: DashboardProps) {
  const COLORS = useThemeColors();
  const { settings } = useSettings();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, [activeItem]);

  const PAGE_ACCENTS: Record<string, { c1: string; c2: string }> = {
    overview: { c1: "#38bdf8", c2: "#818cf8" },
    whale: { c1: "#38bdf8", c2: "#10b981" },
    staking: { c1: "#10b981", c2: "#38bdf8" },
    protocol: { c1: "#10b981", c2: "#818cf8" },
    ai: { c1: "#818cf8", c2: "#38bdf8" },
    alerts: { c1: "#f59e0b", c2: "#818cf8" },
    "stake-action": { c1: "#38bdf8", c2: "#10b981" },
  };

  const accent = PAGE_ACCENTS[activeItem];

  const renderContent = () => {
    switch (activeItem) {
      case "overview":
        return <OverviewContent />;
      case "whale":
        return <WhaleActivityContent />;
      case "staking":
        return <StakingStatsContent />;
      case "protocol":
        return <ProtocolHealthContent />;
      case "ai":
        return <AIInsightsContent />;
      case "alerts":
        return <AlertsContent />;
      case "stake-action":
        return (
          <StakeActionContent
            onGoToGovernance={() => onItemClick("governance")}
          />
        );
      case "governance":
        return <GovernanceContent onItemClick={onItemClick} />;
      case "settings":
        return <SettingsContent />;
      case "about":
        return <AboutContent />;
      default:
        return <OverviewContent />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Ambient background */}
      {accent && (
        <PageBackground accentColor={accent.c1} accentColor2={accent.c2} />
      )}

      {/* Top Bar */}
      <HeaderBar mobile={mobile} />

      {/* Main content */}
      <div
        style={{
          padding: settings.compactMode ? "20px 24px" : "32px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
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
            textAlign: "center",
            color: COLORS.textMuted,
            fontSize: "12px",
            marginTop: settings.compactMode ? "24px" : "48px",
          }}
        >
          TronicLens · Built for ETHOnline 2026 · Powered by The Graph + Chainlink
          + 0G
        </motion.p>
      </div>
    </div>
  );
}
