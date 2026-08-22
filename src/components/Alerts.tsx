// Alerts.tsx
// TronicLens — Smart Alerts
// Data: The Graph + Chainlink | AI Commentary: 0G Compute (Qwen2.5-7b)
"use client";

import { useState, useEffect, useRef } from "react";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";
import { motion, AnimatePresence } from "framer-motion";
import { useWhaleActivity } from "../hooks/useWhaleActivity";
import { useSettings, useThemeColors } from "../context/SettingsContext";

function shortAddr(address: string | null) {
  if (!address) return "0x????...????";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getSeverity(alert: any) {
  if (alert.type === "price") return null;
  if (alert.amountEth >= 0.5) return { label: "HIGH", color: "#f43f5e" };
  if (alert.amountEth >= 0.1) return { label: "MED", color: "#f59e0b" };
  return { label: "LOW", color: "#10b981" };
}

async function fetchAICommentary(alert: any, ethPrice: any) {
  const prompt =
    alert.type === "price"
      ? `You are a DeFi analyst for TronicLens. Current ETH price from Chainlink oracle is $${alert.amountUSD}. In 2-3 sentences, provide brief market context and what this price level means for stakers. Be concise and actionable.`
      : `You are a DeFi analyst for TronicLens, an on-chain staking intelligence tool.

  Alert detected:
  - Type: ${alert.type}
  - Action: ${alert.action}
  - Amount: ${alert.amountEth.toFixed(4)} ETH ($${alert.amountUSD})
  - Wallet: ${alert.address}
  - ETH Price: $${ethPrice || "unknown"}

  In 2-3 sentences, provide a brief, insightful commentary on what this alert might indicate for stakers monitoring this protocol. Be concise and actionable.`;

  try {
    const res = await fetchWithTimeout("/api/ai-insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    }, 15000);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    return null;
  }
}

interface AlertCardProps {
  alert: any;
  ethPrice: any;
  index: number;
  priceChange24h: string | null;
}

function AlertCard({
  alert,
  ethPrice,
  index,
  priceChange24h,
}: AlertCardProps) {
  const COLORS = useThemeColors();
  const { settings } = useSettings();
  const isLight = settings.theme === "light";
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fetchedRef = useRef(false);

  const isStake = alert.action === "STAKE";
  const isWhale = alert.type === "whale";
  const isPrice = alert.type === "price";

  const accentColor = isPrice
    ? "#627eea"
    : isStake
      ? COLORS.green
      : COLORS.red;

  const accentBg = isPrice
    ? "#627eea20"
    : isStake
      ? COLORS.greenDim
      : COLORS.redDim;

  const handleAskAI = async () => {
    if (fetchedRef.current) {
      setExpanded((e) => !e);
      return;
    }
    setExpanded(true);
    setAiLoading(true);
    fetchedRef.current = true;
    const comment = await fetchAICommentary(alert, ethPrice);
    setAiComment(
      comment || "AI commentary unavailable — 0G Compute may be busy."
    );
    setAiLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      style={{
        backgroundColor: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: "14px",
        boxShadow: isLight
          ? "0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.03)"
          : "0 8px 24px -4px rgba(0, 0, 0, 0.3)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: accentBg,
                border: `1px solid ${accentColor}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {isPrice ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/logos/eth-diamond-(color-filled).svg"
                  alt="ETH"
                  style={{ width: "20px", height: "20px", objectFit: "contain" }}
                />
              ) : (
                <svg width="24" height="20" viewBox="0 0 205 95" fill="none">
                  <path
                    d="M 30 45 Q 80 20 150 35 Q 185 42 200 52 Q 185 62 150 68 Q 80 80 30 55 Z"
                    fill={accentColor}
                  />
                  <path
                    d="M 30 50 L 0 30 L 14 50 Z"
                    fill={isStake ? "#0d9668" : "#e11d48"}
                  />
                  <path
                    d="M 30 50 L 0 70 L 14 50 Z"
                    fill={isStake ? "#0d9668" : "#e11d48"}
                  />
                  <path
                    d="M 95 28 L 108 4 L 125 30 Z"
                    fill={isStake ? "#0d9668" : "#e11d48"}
                  />
                  <path
                    d="M 130 62 L 138 82 L 158 66 Z"
                    fill={isStake ? "#0d9668" : "#e11d48"}
                  />
                  <circle
                    cx="175"
                    cy="49"
                    r="5"
                    fill={isStake ? "#34d399" : "#fb7185"}
                  />
                  <circle
                    cx="176"
                    cy="48"
                    r="2"
                    fill={isStake ? "#059669" : "#be123c"}
                  />
                </svg>
              )}
            </span>
            <div>
              <p
                style={{
                  color: COLORS.text,
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "2px",
                }}
              >
                {isPrice ? (
                  <span style={{ color: COLORS.textMuted, fontWeight: 600 }}>
                    ETH / USD
                  </span>
                ) : (
                  `${alert.action} · ${alert.amountEth.toFixed(4)} ETH`
                )}
              </p>
              {isPrice && (
                <p
                  style={{
                    color: COLORS.cyan,
                    fontSize: "15px",
                    fontWeight: 700,
                    marginBottom: "2px",
                  }}
                >
                  ${alert.amountUSD}
                </p>
              )}
              {isPrice && priceChange24h !== null && (
                <p
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color:
                      parseFloat(priceChange24h) >= 0
                        ? COLORS.green
                        : COLORS.red,
                    marginBottom: "2px",
                  }}
                >
                  {parseFloat(priceChange24h) >= 0 ? "▲" : "▼"}{" "}
                  {Math.abs(parseFloat(priceChange24h))}% (24h)
                </p>
              )}
              <p
                style={{
                  color: COLORS.textMuted,
                  fontSize: "12px",
                  marginBottom: getSeverity(alert) ? "6px" : "0",
                }}
              >
                {isPrice ? (
                  "Chainlink · ETH/USD"
                ) : (
                  <span
                    style={{
                      color: COLORS.cyan,
                      cursor: "pointer",
                      textDecoration: "underline",
                      textDecorationStyle: "dotted",
                      textUnderlineOffset: "3px",
                    }}
                    onClick={() =>
                      window.open(
                        `https://eth-sepolia.blockscout.com/address/${alert.address}`,
                        "_blank"
                      )
                    }
                  >
                    {shortAddr(alert.address)}
                  </span>
                )}
              </p>
              {getSeverity(alert) && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: getSeverity(alert)!.color,
                    letterSpacing: "0.05em",
                  }}
                >
                  {getSeverity(alert)!.label === "MED"
                    ? "MEDIUM"
                    : getSeverity(alert)!.label}{" "}
                  SEVERITY
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: accentColor,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {isPrice ? "PRICE" : alert.action}
            </span>
            <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
              {alert.timeAgo}
            </span>
          </div>
        </div>

        {!isPrice && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "10px",
              paddingBottom: "12px",
              borderTop: `1px solid ${COLORS.cardBorder}`,
              marginBottom: "12px",
            }}
          >
            <span style={{ color: COLORS.textMuted, fontSize: "12px" }}>
              USD Value
            </span>
            <span
              style={{ color: COLORS.text, fontSize: "13px", fontWeight: 600 }}
            >
              ${alert.amountUSD}
            </span>
          </div>
        )}

        <button
          onClick={handleAskAI}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: expanded
              ? `${COLORS.purple}25`
              : `${COLORS.purple}12`,
            border: `1px solid ${COLORS.purple}50`,
            borderRadius: "6px",
            padding: "7px 14px",
            color: COLORS.purple,
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "background-color 0.2s, border-color 0.2s",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/0G-Logo-White.svg"
            alt="0G"
            style={{
              width: "13px",
              height: "13px",
              objectFit: "contain",
              filter:
                "brightness(0) saturate(100%) invert(58%) sepia(60%) saturate(400%) hue-rotate(200deg) brightness(110%)",
            }}
          />
          <span>{expanded ? "Hide AI Insight" : "Ask 0G AI"}</span>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  marginTop: "12px",
                  backgroundColor: COLORS.purpleDim,
                  border: `1px solid ${COLORS.purple}30`,
                  borderRadius: "10px",
                  padding: "14px",
                }}
              >
                {aiLoading ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{
                        width: "14px",
                        height: "14px",
                        border: `2px solid ${COLORS.purple}`,
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                      }}
                    />
                    <span style={{ color: COLORS.purple, fontSize: "13px" }}>
                      Querying 0G Compute...
                    </span>
                  </div>
                ) : (
                  <>
                    <p
                      style={{
                        color: COLORS.textDim,
                        fontSize: "13px",
                        lineHeight: 1.7,
                        marginBottom: "8px",
                      }}
                    >
                      {aiComment}
                    </p>
                    <p style={{ color: COLORS.textMuted, fontSize: "11px" }}>
                      ✦ Powered by{" "}
                      <span style={{ color: COLORS.purple }}>0G Compute</span> ·
                      Qwen2.5-omni
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function AlertsContent() {
  const { settings } = useSettings();
  const COLORS = useThemeColors();
  const whiteLogo = settings.theme === "light" ? "invert(1)" : "none";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { activities, stats, chainlinkPrice, loading, error, formatTime } =
    useWhaleActivity({
      refreshInterval: null,
      whaleThreshold: settings.whaleThreshold,
    });

  const ethPrice = stats?.ethPrice;
  const [priceChange24h, setPriceChange24h] = useState<string | null>(null);
  const [globalAI, setGlobalAI] = useState<string | null>(null);
  const [globalAILoading, setGlobalAILoading] = useState(false);
  const [globalAIExpanded, setGlobalAIExpanded] = useState(false);
  const globalFetchedRef = useRef(false);

  const alerts: any[] = [];

  activities.forEach((tx) => {
    alerts.push({
      id: tx.id,
      type: "whale",
      action: tx.action,
      address: tx.address,
      amountEth: tx.amountEth,
      amountUSD: tx.amountUSD,
      blockNumber: tx.blockNumber,
      timeAgo: formatTime(tx.timestamp),
    });
  });

  if (chainlinkPrice) {
    alerts.unshift({
      id: "chainlink-price",
      type: "price",
      action: "PRICE",
      address: null,
      amountEth: 0,
      amountUSD: chainlinkPrice.price,
      blockNumber: 0,
      timeAgo: isMobile
        ? chainlinkPrice.updatedAt.split(",")[1]?.trim().replace(" UTC", "") +
          " UTC"
        : chainlinkPrice.updatedAt,
    });
  }

  const handleAnalyzeAll = async () => {
    if (globalFetchedRef.current) {
      setGlobalAIExpanded((e) => !e);
      return;
    }
    setGlobalAIExpanded(true);
    setGlobalAILoading(true);
    globalFetchedRef.current = true;

    const alertSummary = alerts
      .map((a) =>
        a.type === "price"
          ? `ETH/USD Price: $${a.amountUSD}${
              priceChange24h ? ` (24h change: ${priceChange24h}%)` : ""
            }`
          : `${a.action}: ${a.amountEth.toFixed(4)} ETH ($${
              a.amountUSD
            }) by ${shortAddr(a.address)}`
      )
      .join("\n");

    const prompt = `You are a DeFi analyst for TronicLens, an on-chain staking intelligence dashboard.

    Current alerts detected on Ethereum Sepolia:
    ${alertSummary}

    ETH Price: $${ethPrice || "unknown"}
    Active Stakers: ${stats?.activeStakers || "unknown"}
    Total TVL: ${stats?.totalStaked || "unknown"} ETH

    In 3-4 sentences, provide a comprehensive analysis of the current protocol state based on ALL these alerts combined. What is the overall market sentiment? What should stakers be aware of right now? Be specific and data-driven.`;

    try {
      const res = await fetchWithTimeout("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      }, 15000);
      const data = await res.json();
      setGlobalAI(
        data?.choices?.[0]?.message?.content || "Analysis unavailable."
      );
    } catch {
      setGlobalAI("0G Compute unavailable. Please try again.");
    }
    setGlobalAILoading(false);
  };

  useEffect(() => {
    fetchWithTimeout("/api/price-history?days=1", {}, 8000)
      .then((r) => r.json())
      .then((data) => {
        if (data.prices && data.prices.length >= 2) {
          const first = data.prices[0][1];
          const last = data.prices[data.prices.length - 1][1];
          const change = ((last - first) / first) * 100;
          setPriceChange24h(change.toFixed(2));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: settings.compactMode ? "16px" : "20px" }}>
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
          Smart Alerts
        </h1>
        <p
          style={{
            color: COLORS.textMuted,
            fontSize: "13px",
            margin: 0,
          }}
        >
          Whale movements ≥ {settings.whaleThreshold} ETH · ETH/USD via Chainlink
          · AI insight via 0G Compute
        </p>
      </div>

      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            backgroundColor: COLORS.bg,
            border: `1px solid ${COLORS.cardBorder}`,
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "20px",
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
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Alert Summary
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
            }}
          >
            {[
              { label: "Total Alerts", value: alerts.length, color: COLORS.text },
              {
                label: "Whale Alerts",
                value: activities.length,
                color: COLORS.text,
              },
              {
                label: "ETH Price",
                value: chainlinkPrice ? `$${chainlinkPrice.price}` : "—",
                color: COLORS.text,
              },
              {
                label: "Threshold",
                value: `≥ ${settings.whaleThreshold} ETH`,
                color: COLORS.text,
              },
            ].map((item, i) => {
              const totalCols = isMobile ? 2 : 4;
              const isLastCol = i % totalCols === totalCols - 1;
              const isLastRow = isMobile ? i >= 2 : true;
              return (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    borderRight: !isLastCol
                      ? `1px solid ${COLORS.cardBorder}`
                      : "none",
                    borderBottom: !isLastRow
                      ? `1px solid ${COLORS.cardBorder}`
                      : "none",
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
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      color: item.color,
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: 700,
                      fontFamily: "monospace",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            marginBottom: "20px",
            border: `1px solid ${COLORS.purple}30`,
            borderRadius: "12px",
            overflow: "hidden",
            backgroundColor: COLORS.card,
          }}
        >
          <button
            onClick={handleAnalyzeAll}
            style={{
              width: "100%",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: globalAIExpanded
                ? `linear-gradient(135deg, ${COLORS.purple}20, ${COLORS.purple}08)`
                : `linear-gradient(135deg, ${COLORS.purple}12, ${COLORS.purple}04)`,
              border: "none",
              cursor: "pointer",
              borderBottom: globalAIExpanded
                ? `1px solid ${COLORS.purple}25`
                : "none",
              transition: "background 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logos/0G-Logo-White.svg"
                alt="0G"
                style={{
                  width: "16px",
                  height: "16px",
                  objectFit: "contain",
                  filter:
                    "brightness(0) saturate(100%) invert(58%) sepia(60%) saturate(400%) hue-rotate(200deg) brightness(110%)",
                }}
              />
              <span
                style={{
                  color: COLORS.purple,
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Analyze All Alerts
              </span>
              <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
                · {alerts.length} alerts · 0G Compute
              </span>
            </div>
            <motion.span
              animate={{ rotate: globalAIExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: COLORS.purple, fontSize: "12px" }}
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {globalAIExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ padding: "16px 20px" }}>
                  {globalAILoading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          width: "16px",
                          height: "16px",
                          border: `2px solid ${COLORS.purple}`,
                          borderTopColor: "transparent",
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: COLORS.purple, fontSize: "13px" }}>
                        Analyzing all alerts via 0G Compute...
                      </span>
                    </div>
                  ) : (
                    <>
                      <p
                        style={{
                          color: COLORS.textDim,
                          fontSize: "13px",
                          lineHeight: 1.8,
                          marginBottom: "10px",
                        }}
                      >
                        {globalAI}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/logos/0G-Logo-White.svg"
                          alt="0G"
                          style={{
                            width: "12px",
                            height: "12px",
                            objectFit: "contain",
                            filter:
                              "brightness(0) saturate(100%) invert(58%) sepia(60%) saturate(400%) hue-rotate(200deg) brightness(110%)",
                          }}
                        />
                        <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
                          Powered by{" "}
                          <span style={{ color: COLORS.purple }}>0G Compute</span>{" "}
                          · Qwen2.5-omni-7b · {alerts.length} alerts analyzed
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              style={{
                height: "90px",
                backgroundColor: COLORS.card,
                borderRadius: "14px",
              }}
            />
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "40px", textAlign: "center", color: COLORS.red }}>
          ⚠️ {error}
        </div>
      ) : alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: COLORS.textMuted,
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔔</div>
          <p
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: COLORS.textDim,
              marginBottom: "8px",
            }}
          >
            No alerts detected
          </p>
          <p style={{ fontSize: "13px" }}>
            Whale threshold: ≥ {settings.whaleThreshold} ETH · Adjust in Settings
          </p>
        </motion.div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {alerts.map((alert, i) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              ethPrice={ethPrice}
              index={i}
              priceChange24h={alert.type === "price" ? priceChange24h : null}
            />
          ))}
        </div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            color: COLORS.textMuted,
            fontSize: "12px",
            textAlign: "center",
            marginTop: "32px",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <span style={{ color: COLORS.textMuted, fontSize: "12px" }}>
              The Graph
            </span>
            <span style={{ color: COLORS.textMuted }}>·</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/Chainlink-Symbol-White.svg"
              alt="Chainlink"
              style={{
                width: "14px",
                height: "14px",
                objectFit: "contain",
                filter: whiteLogo,
              }}
            />
            <span style={{ color: COLORS.textMuted, fontSize: "12px" }}>
              Chainlink
            </span>
            <span style={{ color: COLORS.textMuted }}>·</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <span style={{ color: COLORS.textMuted, fontSize: "12px" }}>
              0G Compute (Qwen2.5-7b)
            </span>
          </span>
        </motion.p>
      )}
    </div>
  );
}
