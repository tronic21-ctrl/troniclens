// ETHPriceChart.tsx
// TronicLens — ETH/USD Price Chart with Candlestick, Volume, TVL
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { createChart, CandlestickSeries } from "lightweight-charts";
import { useThemeColors, useSettings } from "../context/SettingsContext";
import { fetchWithTimeout } from "../utils/fetchWithTimeout";

const TIME_RANGES = [
  { label: "1H", days: "0.04" },
  { label: "1D", days: "1" },
  { label: "1W", days: "7" },
  { label: "1M", days: "30" },
  { label: "1Y", days: "365" },
];

const TABS = ["Price", "Volume", "TVL"];

function fmt$(v: any) {
  if (!v && v !== 0) return "—";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3)
    return (
      "$" +
      v.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  return "$" + v.toFixed(2);
}

function fmtTime(ts: any, days: any) {
  const d = new Date(ts);
  const n = parseFloat(days);
  if (n <= 0.04)
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (n <= 1)
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (n <= 7)
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  if (n <= 30)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: any;
  tab: string;
  range: string;
}

function ChartTooltip({ active, payload, label, tab, range }: ChartTooltipProps) {
  const C = useThemeColors();
  if (!active || !payload?.length) return null;

  let formattedLabel = label;
  if (typeof label === "number") {
    const d = new Date(label);
    const days = TIME_RANGES.find((x) => x.label === range)?.days || "1";
    const n = parseFloat(days);

    if (n <= 0.04) {
      formattedLabel = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } else if (n <= 1) {
      formattedLabel = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (n <= 7) {
      formattedLabel = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (n <= 30) {
      formattedLabel = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      formattedLabel = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return (
    <div
      style={{
        background: C.tooltipBg,
        border: `1px solid ${C.tooltipBorder}`,
        borderRadius: "8px",
        padding: "10px 14px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.4)",
      }}
    >
      <p style={{ color: C.textDim, fontSize: "11px", marginBottom: "4px" }}>
        {formattedLabel}
      </p>
      {tab === "Volume" ? (
        <p
          style={{
            color: C.purple,
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
          }}
        >
          {fmt$(payload[0]?.value)}
        </p>
      ) : tab === "TVL" ? (
        <>
          {payload.map((p, i) => (
            <p
              key={i}
              style={{
                color: p.color,
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              {p.name}: {fmt$(p.value)}
            </p>
          ))}
        </>
      ) : (
        <p
          style={{
            color: C.cyan,
            fontSize: "13px",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
          }}
        >
          {fmt$(payload[0]?.value)}
        </p>
      )}
    </div>
  );
}

interface CandlestickChartProps {
  ohlcData: any[];
  isPositive: boolean;
  fullscreen?: boolean;
}

function CandlestickChart({
  ohlcData,
  isPositive,
  fullscreen = false,
}: CandlestickChartProps) {
  const C = useThemeColors();
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !ohlcData?.length) return;

    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (e) {}
      chartRef.current = null;
      seriesRef.current = null;
    }

    let initialized = false;

    const initChart = () => {
      if (initialized || !containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (!width || width <= 0) return;

      initialized = true;

      const parentH = containerRef.current?.parentElement?.clientHeight;
      let calculatedHeight = 220;
      if (fullscreen) {
        if (parentH && parentH > 0) {
          calculatedHeight = parentH;
        } else {
          const isMobilePortrait =
            window.innerWidth < 768 && window.innerHeight > window.innerWidth;
          calculatedHeight = isMobilePortrait
            ? window.innerWidth - 100
            : window.innerHeight - 120;
        }
      }

      const chart = createChart(containerRef.current, {
        width,
        height: calculatedHeight,
        layout: { background: { color: "transparent" }, textColor: C.textDim },
        grid: {
          vertLines: { color: C.chartGrid },
          horzLines: { color: C.chartGrid },
        },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: C.chartGrid },
        timeScale: { borderColor: C.chartGrid, timeVisible: true },
      });

      const series = chart.addSeries(CandlestickSeries, {
        upColor: C.green,
        downColor: C.red,
        borderUpColor: C.green,
        borderDownColor: C.red,
        wickUpColor: C.green,
        wickDownColor: C.red,
      });

      const formatted = ohlcData
        .map(([ts, o, h, l, c]) => ({
          time: Math.floor(ts / 1000),
          open: o,
          high: h,
          low: l,
          close: c,
        }))
        .sort((a, b) => a.time - b.time);

      series.setData(formatted as any);
      chart.timeScale().fitContent();

      chartRef.current = chart;
      seriesRef.current = series;

      const handleResize = () => {
        if (containerRef.current && chartRef.current) {
          try {
            const parentH = containerRef.current?.parentElement?.clientHeight;
            let h = 220;
            if (fullscreen) {
              if (parentH && parentH > 0) {
                h = parentH;
              } else {
                const isMobilePortrait =
                  window.innerWidth < 768 &&
                  window.innerHeight > window.innerWidth;
                h = isMobilePortrait
                  ? window.innerWidth - 100
                  : window.innerHeight - 120;
              }
            }
            chartRef.current.resize(containerRef.current.clientWidth, h);
          } catch (e) {}
        }
      };
      window.addEventListener("resize", handleResize);
      (containerRef.current as any)._handleResize = handleResize;
    };

    initChart();

    const observer = new ResizeObserver(() => {
      if (!initialized) initChart();
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (containerRef.current && (containerRef.current as any)._handleResize) {
        window.removeEventListener(
          "resize",
          (containerRef.current as any)._handleResize
        );
      }
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {}
        chartRef.current = null;
      }
    };
  }, [ohlcData, C.chartGrid, C.green, C.red, C.textDim, fullscreen]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: fullscreen ? "100%" : "220px" }}
    />
  );
}

// Simple in-memory cache untuk dev
const devCache: Record<string, any> = {};
const globalRetryTimer = { retryAt: 0 };

interface ETHPriceChartProps {
  chainlinkPrice?: { price: any; updatedAt: string };
  tronicTVL?: any;
}

export default function ETHPriceChart({
  chainlinkPrice,
  tronicTVL,
}: ETHPriceChartProps) {
  const C = useThemeColors();
  const { settings } = useSettings();
  const isLight = settings.theme === "light";
  const [range, setRange] = useState("1D");
  const [tab, setTab] = useState("Price");
  const [chartType, setChartType] = useState("line"); // 'line' | 'candle'
  const [priceData, setPriceData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [ohlcData, setOhlcData] = useState<any[]>([]);
  const [tvlData, setTvlData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryIn, setRetryIn] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [priceChange, setPriceChange] = useState({
    value: "0.00",
    pct: "0.00",
    positive: true,
  });
  const [coin, setCoin] = useState("ETH"); // 'ETH' | 'BTC'
  const [btcPriceData, setBtcPriceData] = useState<any[]>([]);
  const [btcVolumeData, setBtcVolumeData] = useState<any[]>([]);
  const [btcOhlcData, setBtcOhlcData] = useState<any[]>([]);
  const [btcPriceChange, setBtcPriceChange] = useState({
    value: "0.00",
    pct: "0.00",
    positive: true,
  });

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const fetchPriceData = useCallback(async (r: string) => {
    setLoading(true);
    setError(null);
    setPriceData([]);
    setVolumeData([]);
    setOhlcData([]);
    try {
      const days = TIME_RANGES.find((x) => x.label === r)?.days || "1";
      const isDev = process.env.NODE_ENV === "development";

      if (isDev) {
        const cacheKey = `price-${days}`;
        if (devCache[cacheKey]) {
          const cached = devCache[cacheKey];
          setPriceData(cached.prices);
          setVolumeData(cached.volumes);
          setOhlcData(cached.ohlc);
          setPriceChange(cached.priceChange);
          setLoading(false);
          return;
        }

        const [priceRes, ohlcRes] = await Promise.all([
          fetchWithTimeout(
            `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}`, {}, 10000
          ),
          fetchWithTimeout(
            `https://api.coingecko.com/api/v3/coins/ethereum/ohlc?vs_currency=usd&days=${
              days === "0.04" ? "1" : days
            }`, {}, 10000
          ),
        ]);

        if (!priceRes.ok) {
          const retryAfter = parseInt(
            priceRes.headers.get("Retry-After") || "60"
          );
          const err = new Error("Rate limit reached") as any;
          err.retryAfter = retryAfter;
          throw err;
        }

        const priceJson = await priceRes.json();
        const ohlcJson = ohlcRes.ok ? await ohlcRes.json() : [];
        const filteredOhlc =
          days === "0.04"
            ? ohlcJson.filter(([ts]: [number]) => ts >= Date.now() - 60 * 60 * 1000)
            : ohlcJson;

        const prices = priceJson.prices.map(([ts, p]: [number, number]) => ({
          time: fmtTime(ts, days),
          price: parseFloat(p.toFixed(2)),
          timestamp: ts,
        }));
        const volumes = priceJson.total_volumes.map(([ts, v]: [number, number]) => ({
          time: fmtTime(ts, days),
          volume: parseFloat(v.toFixed(0)),
          timestamp: ts,
        }));
        const first = prices[0]?.price;
        const last = prices[prices.length - 1]?.price;
        const change = last - first;
        const pc = {
          value: Math.abs(change).toFixed(2),
          pct: Math.abs((change / first) * 100).toFixed(2),
          positive: change >= 0,
        };

        devCache[cacheKey] = {
          prices,
          volumes,
          ohlc: filteredOhlc,
          priceChange: pc,
        };
        setPriceData(prices);
        setVolumeData(volumes);
        setOhlcData(filteredOhlc);
        setPriceChange(pc);
      } else {
        const res = await fetchWithTimeout(`/api/price-history?days=${days}`, {}, 10000);
        const data = await res.json();

        const prices = data.prices.map(([ts, p]: [number, number]) => ({
          time: fmtTime(ts, days),
          price: parseFloat(p.toFixed(2)),
          timestamp: ts,
        }));
        const volumes = (data.volumes || []).map(([ts, v]: [number, number]) => ({
          time: fmtTime(ts, days),
          volume: parseFloat(v.toFixed(0)),
          timestamp: ts,
        }));

        setPriceData(prices);
        setVolumeData(volumes);
        setOhlcData(data.ohlc || []);

        const first = prices[0]?.price;
        const last = prices[prices.length - 1]?.price;
        const change = last - first;
        setPriceChange({
          value: Math.abs(change).toFixed(2),
          pct: Math.abs((change / first) * 100).toFixed(2),
          positive: change >= 0,
        });
      }
    } catch (err: any) {
      setError(err.message);
      const retryAfter = err.retryAfter || 60;
      if (globalRetryTimer.retryAt <= Date.now()) {
        globalRetryTimer.retryAt = Date.now() + retryAfter * 1000;
        setRetryIn(retryAfter);
      } else {
        const remaining = Math.ceil(
          (globalRetryTimer.retryAt - Date.now()) / 1000
        );
        setRetryIn(remaining);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBTCData = useCallback(async (r: string) => {
    setLoading(true);
    setError(null);
    setBtcPriceData([]);
    setBtcVolumeData([]);
    setBtcOhlcData([]);
    try {
      const days = TIME_RANGES.find((x) => x.label === r)?.days || "1";
      const isDev = process.env.NODE_ENV === "development";

      if (isDev) {
        const cacheKey = `btc-price-${days}`;
        if (devCache[cacheKey]) {
          const cached = devCache[cacheKey];
          setBtcPriceData(cached.prices);
          setBtcVolumeData(cached.volumes);
          setBtcOhlcData(cached.ohlc);
          setBtcPriceChange(cached.priceChange);
          setLoading(false);
          return;
        }
        const [priceRes, ohlcRes] = await Promise.all([
          fetch(
            `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
          ),
          fetch(
            `https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=${
              days === "0.04" ? "1" : days
            }`
          ),
        ]);
        if (!priceRes.ok) {
          const retryAfter = parseInt(
            priceRes.headers.get("Retry-After") || "60"
          );
          const err = new Error("Rate limit reached") as any;
          err.retryAfter = retryAfter;
          throw err;
        }
        const priceJson = await priceRes.json();
        const ohlcJson = ohlcRes.ok ? await ohlcRes.json() : [];
        const filteredOhlc =
          days === "0.04"
            ? ohlcJson.filter(([ts]: [number]) => ts >= Date.now() - 60 * 60 * 1000)
            : ohlcJson;
        const prices = priceJson.prices.map(([ts, p]: [number, number]) => ({
          time: fmtTime(ts, days),
          price: parseFloat(p.toFixed(2)),
          timestamp: ts,
        }));
        const volumes = priceJson.total_volumes.map(([ts, v]: [number, number]) => ({
          time: fmtTime(ts, days),
          volume: parseFloat(v.toFixed(0)),
          timestamp: ts,
        }));
        const first = prices[0]?.price;
        const last = prices[prices.length - 1]?.price;
        const change = last - first;
        const pc = {
          value: Math.abs(change).toFixed(2),
          pct: Math.abs((change / first) * 100).toFixed(2),
          positive: change >= 0,
        };
        devCache[cacheKey] = {
          prices,
          volumes,
          ohlc: filteredOhlc,
          priceChange: pc,
        };
        setBtcPriceData(prices);
        setBtcVolumeData(volumes);
        setBtcOhlcData(filteredOhlc);
        setBtcPriceChange(pc);
      } else {
        const res = await fetchWithTimeout(`/api/price-history?days=${days}&coin=bitcoin`, {}, 10000);
        const data = await res.json();
        const prices = data.prices.map(([ts, p]: [number, number]) => ({
          time: fmtTime(ts, days),
          price: parseFloat(p.toFixed(2)),
          timestamp: ts,
        }));
        const volumes = (data.volumes || []).map(([ts, v]: [number, number]) => ({
          time: fmtTime(ts, days),
          volume: parseFloat(v.toFixed(0)),
          timestamp: ts,
        }));
        setBtcPriceData(prices);
        setBtcVolumeData(volumes);
        setBtcOhlcData(data.ohlc || []);
        const first = prices[0]?.price;
        const last = prices[prices.length - 1]?.price;
        const change = last - first;
        setBtcPriceChange({
          value: Math.abs(change).toFixed(2),
          pct: Math.abs((change / first) * 100).toFixed(2),
          positive: change >= 0,
        });
      }
    } catch (err: any) {
      setError(err.message);
      const retryAfter = err.retryAfter || 60;
      if (globalRetryTimer.retryAt <= Date.now()) {
        globalRetryTimer.retryAt = Date.now() + retryAfter * 1000;
        setRetryIn(retryAfter);
      } else {
        setRetryIn(Math.ceil((globalRetryTimer.retryAt - Date.now()) / 1000));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTVL = useCallback(async () => {
    try {
      const isDev = process.env.NODE_ENV === "development";
      const days = TIME_RANGES.find((x) => x.label === range)?.days || "1";
      const daysNum = parseFloat(days);
      const cutoff = Date.now() - daysNum * 24 * 60 * 60 * 1000;

      const url = isDev
        ? "https://api.llama.fi/v2/historicalChainTvl/ethereum"
        : "/api/tvl-history";

      const res = await fetchWithTimeout(url, {}, 10000);
      const data = await res.json();
      const raw = isDev ? data : data.tvl || [];

      const filtered = raw
        .filter(({ date }: any) => date * 1000 >= cutoff)
        .map(({ date, tvl }: any) => ({
          time: fmtTime(date * 1000, days),
          globalTVL: parseFloat((tvl / 1e9).toFixed(2)),
          tronicTVL: tronicTVL ? parseFloat(tronicTVL) : 0,
          timestamp: date * 1000,
        }));

      setTvlData(filtered);
    } catch (err) {
      console.error("TVL fetch error:", err);
    }
  }, [range, tronicTVL]);

  useEffect(() => {
    if (retryIn <= 0) return;
    const timer = setInterval(() => {
      setRetryIn((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          fetchPriceData(range);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [retryIn, range, fetchPriceData]);

  useEffect(() => {
    if (coin === "ETH") {
      fetchPriceData(range);
    }
  }, [range, coin, fetchPriceData]);

  useEffect(() => {
    if (coin === "BTC") {
      fetchBTCData(range);
    }
  }, [range, coin, fetchBTCData]);

  useEffect(() => {
    if (tab === "TVL") fetchTVL();
  }, [tab, fetchTVL]);

  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullscreen]);

  const activePriceData = coin === "ETH" ? priceData : btcPriceData;
  const activeVolumeData = coin === "ETH" ? volumeData : btcVolumeData;
  const activeOhlcData = coin === "ETH" ? ohlcData : btcOhlcData;
  const activePriceChange = coin === "ETH" ? priceChange : btcPriceChange;
  const activeIsPositive = activePriceChange.positive;
  const activeLineColor = activeIsPositive ? C.green : C.red;
  const activeCurrentPrice =
    activePriceData[activePriceData.length - 1]?.price ||
    (coin === "ETH" && chainlinkPrice?.price
      ? parseFloat(String(chainlinkPrice.price).replace(/,/g, ""))
      : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{
        backgroundColor: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderTop: isLight ? `1px solid ${C.cardBorder}` : `1px solid rgba(255, 255, 255, 0.1)`,
        borderRadius: "16px",
        backdropFilter: isLight ? "none" : "blur(16px)",
        boxShadow: isLight
          ? "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)"
          : "0 8px 32px 0 rgba(0, 0, 0, 0.35)",
        overflow: "hidden",
        marginBottom: "0px",
        height: isMobile ? "auto" : "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @media (max-width: 768px) and (orientation: portrait) {
          .fullscreen-chart-overlay {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            right: auto !important;
            bottom: auto !important;
            width: 100dvh !important;
            height: 100dvw !important;
            transform: translate(-50%, -50%) rotate(90deg) !important;
            transform-origin: center !important;
          }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div
        style={{
          padding: isMobile ? "12px 16px 8px" : "16px 20px 12px",
          borderBottom: `1px solid ${C.chartBorder}`,
          backgroundColor: C.chartHeader,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  background: C.inputBg,
                  borderRadius: "8px",
                  padding: "3px",
                }}
              >
                {["ETH", "BTC"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCoin(c)}
                    style={{
                      padding: isMobile ? "4px 8px" : "3px 12px",
                      borderRadius: "6px",
                      border: "none",
                      background: coin === c ? C.card : "none",
                      color: coin === c ? C.cyan : C.textDim,
                      fontSize: "12px",
                      fontWeight: coin === c ? 700 : 400,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        c === "ETH"
                          ? "/logos/eth-circle-white.svg"
                          : "/logos/bitcoin-logo.svg"
                      }
                      alt={c}
                      style={{ width: "14px", height: "14px", objectFit: "contain" }}
                    />
                    {isMobile ? c : `${c} / USD`}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
              <span
                style={{
                  color: C.text,
                  fontSize: isMobile ? "22px" : "26px",
                  fontWeight: 800,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "-0.02em",
                }}
              >
                {activeCurrentPrice ? fmt$(activeCurrentPrice) : "—"}
              </span>
              {!loading && tab === "Price" && (
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: activeIsPositive ? C.green : C.red,
                  }}
                >
                  {activeIsPositive ? "+" : "-"}${activePriceChange.value} (
                  {activeIsPositive ? "+" : "-"}{activePriceChange.pct}%)
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "4px",
              alignSelf: "center",
              background: C.inputBg,
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            {tab === "Price" && (
              <>
                {[
                  {
                    type: "line",
                    icon: (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      </svg>
                    ),
                  },
                  {
                    type: "candle",
                    icon: (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <rect x="4" y="7" width="4" height="10" rx="1" />
                        <line x1="6" y1="4" x2="6" y2="7" />
                        <line x1="6" y1="17" x2="6" y2="20" />
                        <rect x="16" y="5" width="4" height="8" rx="1" />
                        <line x1="18" y1="2" x2="18" y2="5" />
                        <line x1="18" y1="13" x2="18" y2="20" />
                      </svg>
                    ),
                  },
                ].map(({ type, icon }) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    style={{
                      width: "32px",
                      height: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "6px",
                      background: chartType === type ? C.card : "none",
                      border: "1px solid transparent",
                      color: chartType === type ? C.cyan : C.textDim,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </>
            )}
            <button
              onClick={() => setIsFullscreen(true)}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                border: `1px solid ${C.chartBorder}`,
                background: "none",
                color: C.textDim,
                cursor: "pointer",
              }}
              title="Fullscreen"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "2px",
              background: C.inputBg,
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            {TABS.filter((t) => !(coin === "BTC" && t === "TVL")).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: tab === t ? C.chartGrid : "none",
                  color: tab === t ? C.text : C.textDim,
                  fontSize: "12px",
                  fontWeight: tab === t ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "2px",
              background: C.inputBg,
              borderRadius: "8px",
              padding: "3px",
            }}
          >
            {TIME_RANGES.map(({ label }) => {
              const disabledForTVL = tab === "TVL" && label === "1H";
              return (
                <button
                  key={label}
                  onClick={() => !disabledForTVL && setRange(label)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background:
                      range === label && !disabledForTVL ? C.card : "none",
                    border: "1px solid transparent",
                    color: disabledForTVL
                      ? "#1e3a5f"
                      : range === label
                        ? C.cyan
                        : C.textDim,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: disabledForTVL ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    opacity: disabledForTVL ? 0.4 : 1,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CHART AREA ── */}
      <div style={{ padding: "8px 0 12px", height: "240px", position: "relative" }}>
        {loading && tab !== "TVL" && activePriceData.length === 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ color: C.textDim, fontSize: "13px" }}
            >
              Loading chart...
            </motion.span>
          </div>
        ) : error && tab !== "TVL" && activePriceData.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              gap: "12px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.amber}
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p style={{ color: C.textDim, fontSize: "13px", textAlign: "center" }}>
              CoinGecko rate limit reached
            </p>
            {retryIn > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: C.amber,
                  }}
                />
                <span
                  style={{
                    color: C.amber,
                    fontSize: "12px",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                  }}
                >
                  Retrying in {retryIn}s...
                </span>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fetchPriceData(range)}
                style={{
                  padding: "6px 16px",
                  background: `${C.cyan}15`,
                  border: `1px solid ${C.cyan}40`,
                  borderRadius: "8px",
                  color: C.cyan,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Retry now
              </motion.button>
            )}
          </div>
        ) : tab === "Price" && chartType === "candle" ? (
          <div style={{ padding: "0 8px" }}>
            <CandlestickChart
              ohlcData={activeOhlcData}
              isPositive={activeIsPositive}
            />
          </div>
        ) : tab === "Price" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activePriceData}
              margin={{ top: 4, right: 16, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={activeLineColor}
                    stopOpacity={0.25}
                  />
                  <stop offset="100%" stopColor={activeLineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.chartGrid}
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) =>
                  fmtTime(ts, TIME_RANGES.find((x) => x.label === range)?.days || "1")
                }
                tick={{ fill: C.textDim, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickCount={6}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: C.textDim, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => "$" + v.toLocaleString()}
                width={72}
              />
              <Tooltip
                content={<ChartTooltip tab="Price" range={range} />}
                cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: "4 4" }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={activeLineColor}
                strokeWidth={2}
                fill="url(#priceGrad)"
                dot={false}
                activeDot={{ r: 4, fill: activeLineColor, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1200}
                animationEasing="ease-out"
                animationBegin={100}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : tab === "Volume" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={activeVolumeData}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={C.chartGrid}
                vertical={false}
              />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) =>
                  fmtTime(ts, TIME_RANGES.find((x) => x.label === range)?.days || "1")
                }
                tick={{ fill: C.textDim, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickCount={6}
              />
              <YAxis
                tick={{ fill: C.textDim, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmt$(v)}
                width={72}
              />
              <Tooltip
                content={<ChartTooltip tab="Volume" range={range} />}
                cursor={{ fill: `${C.purple}10` }}
              />
              <Bar
                dataKey="volume"
                fill={C.purple}
                fillOpacity={0.8}
                radius={[2, 2, 0, 0]}
                isAnimationActive={true}
                animationDuration={1000}
                animationEasing="ease-out"
                animationBegin={150}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : tab === "TVL" ? (
          tvlData.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <motion.span
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ color: C.textDim, fontSize: "13px" }}
              >
                Loading TVL...
              </motion.span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={tvlData}
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="globalTVLGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.cyan} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="tronicTVLGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={C.chartGrid}
                  vertical={false}
                />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) =>
                    fmtTime(ts, TIME_RANGES.find((x) => x.label === range)?.days || "1")
                  }
                  tick={{ fill: C.textDim, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickCount={6}
                />
                <YAxis
                  tick={{ fill: C.textDim, fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v + "B"}
                  width={56}
                />
                <Tooltip
                  content={<ChartTooltip tab="TVL" range={range} />}
                  cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="globalTVL"
                  name="ETH Ecosystem"
                  stroke={C.cyan}
                  strokeWidth={2}
                  fill="url(#globalTVLGrad)"
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  animationBegin={100}
                />
                <Area
                  type="monotone"
                  dataKey="tronicTVL"
                  name="TronicLens"
                  stroke={C.green}
                  strokeWidth={2}
                  fill="url(#tronicTVLGrad)"
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                  animationBegin={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : null}
      </div>

      {/* ── LEGEND (TVL only) ── */}
      {tab === "TVL" && tvlData.length > 0 && (
        <div style={{ padding: "4px 20px 8px", display: "flex", gap: "16px" }}>
          {[
            { color: C.cyan, label: "ETH Ecosystem TVL (Billions)" },
            { color: C.green, label: "TronicLens TVL (ETH)" },
          ].map(({ color, label }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <div
                style={{
                  width: "10px",
                  height: "2px",
                  background: color,
                  borderRadius: "1px",
                }}
              />
              <span style={{ color: C.textDim, fontSize: "10px" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div
        style={{
          padding: "6px 20px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "4px",
        }}
      >
        <span style={{ color: C.textDim, fontSize: "10px" }}>
          {tab === "TVL"
            ? "ETH Ecosystem TVL via DeFiLlama · TronicLens TVL via The Graph"
            : tab === "Volume"
              ? "Volume data via CoinGecko"
              : chartType === "candle"
                ? "OHLC data via CoinGecko · Chart by TradingView"
                : "Historical price data via CoinGecko"}
        </span>
        {chainlinkPrice?.updatedAt && (
          <span style={{ color: C.textDim, fontSize: "10px" }}>
            Updated {chainlinkPrice.updatedAt}
          </span>
        )}
      </div>

      {/* Fullscreen overlay */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isFullscreen && (
            <motion.div
              key="fullscreen-overlay"
              className="fullscreen-chart-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              backgroundColor: C.bg,
              display: "flex",
              flexDirection: "column",
              fontFamily: "var(--font-sans)",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${C.chartBorder}`,
                backgroundColor: C.chartHeader,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Coin switcher in fullscreen */}
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    background: C.inputBg,
                    borderRadius: "8px",
                    padding: "3px",
                  }}
                >
                  {["ETH", "BTC"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setCoin(c)}
                      style={{
                        padding: "3px 12px",
                        borderRadius: "6px",
                        border: "none",
                        background: coin === c ? C.card : "none",
                        color: coin === c ? C.cyan : C.textDim,
                        fontSize: "12px",
                        fontWeight: coin === c ? 700 : 400,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c === "ETH" ? "/logos/eth-circle-white.svg" : "/logos/bitcoin-logo.svg"}
                        alt={c}
                        style={{ width: "14px", height: "14px", objectFit: "contain" }}
                      />
                      {c} / USD
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    color: C.text,
                    fontSize: "20px",
                    fontWeight: 700,
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {activeCurrentPrice ? fmt$(activeCurrentPrice) : "—"}
                </span>
                {tab === "Price" && (
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      background: C.inputBg,
                      borderRadius: "8px",
                      padding: "3px",
                    }}
                  >
                    {[
                      {
                        type: "line",
                        icon: (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                          </svg>
                        ),
                      },
                      {
                        type: "candle",
                        icon: (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <rect x="4" y="7" width="4" height="10" rx="1" />
                            <line x1="6" y1="4" x2="6" y2="7" />
                            <line x1="6" y1="17" x2="6" y2="20" />
                            <rect x="16" y="5" width="4" height="8" rx="1" />
                            <line x1="18" y1="2" x2="18" y2="5" />
                            <line x1="18" y1="13" x2="18" y2="20" />
                          </svg>
                        ),
                      },
                    ].map(({ type, icon }) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        style={{
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "6px",
                          background: chartType === type ? C.card : "none",
                          border: "1px solid transparent",
                          color: chartType === type ? C.cyan : C.textDim,
                          cursor: "pointer",
                        }}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setIsFullscreen(false)}
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    border: `1px solid ${C.chartBorder}`,
                    background: "none",
                    color: C.textDim,
                    cursor: "pointer",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="4 14 10 14 10 20" />
                    <polyline points="20 10 14 10 14 4" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                    <line x1="3" y1="21" x2="14" y2="10" />
                  </svg>
                </button>
              </div>
            </div>

            <div
              style={{
                padding: "10px 16px",
                borderBottom: `1px solid ${C.chartBorder}`,
                backgroundColor: C.chartHeader,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  background: C.inputBg,
                  borderRadius: "8px",
                  padding: "3px",
                }}
              >
                {TABS.filter((t) => !(coin === "BTC" && t === "TVL")).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: "4px 14px",
                      borderRadius: "6px",
                      border: "none",
                      background: tab === t ? C.chartGrid : "none",
                      color: tab === t ? C.text : C.textDim,
                      fontSize: "13px",
                      fontWeight: tab === t ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  background: C.inputBg,
                  borderRadius: "8px",
                  padding: "3px",
                }}
              >
                {TIME_RANGES.map(({ label }) => {
                  const disabledForTVL = tab === "TVL" && label === "1H";
                  return (
                    <button
                      key={label}
                      onClick={() => !disabledForTVL && setRange(label)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "6px",
                        background:
                          range === label && !disabledForTVL ? C.card : "none",
                        border: "1px solid transparent",
                        color: disabledForTVL
                          ? "#1e3a5f"
                          : range === label
                            ? C.cyan
                            : C.textDim,
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: disabledForTVL ? "not-allowed" : "pointer",
                        opacity: disabledForTVL ? 0.4 : 1,
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                flex: isMobile ? "none" : 1,
                height: isMobile ? "220px" : "auto",
                padding: "8px 0",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
              }}
            >
              {loading && activePriceData.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                  }}
                >
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ color: C.textDim, fontSize: "13px" }}
                  >
                    Loading chart...
                  </motion.span>
                </div>
              ) : error && activePriceData.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                    gap: "8px",
                  }}
                >
                  <span style={{ color: C.textDim, fontSize: "13px" }}>
                    CoinGecko rate limit reached
                  </span>
                  {retryIn > 0 && (
                    <span
                      style={{
                        color: C.amber,
                        fontSize: "12px",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Retrying in {retryIn}s...
                    </span>
                  )}
                </div>
              ) : tab === "Price" && chartType === "candle" ? (
                <div style={{ padding: "0 8px", flex: 1, minHeight: 0 }}>
                  <CandlestickChart
                    ohlcData={activeOhlcData}
                    isPositive={activeIsPositive}
                    fullscreen={true}
                  />
                </div>
              ) : tab === "Price" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activePriceData}
                    margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor={activeLineColor}
                          stopOpacity={0.25}
                        />
                        <stop
                          offset="100%"
                          stopColor={activeLineColor}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.chartGrid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(ts) =>
                        fmtTime(
                          ts,
                          TIME_RANGES.find((x) => x.label === range)?.days || "1"
                        )
                      }
                      tick={{ fill: C.textDim, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      tickCount={8}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      tick={{ fill: C.textDim, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => "$" + v.toLocaleString()}
                      width={76}
                    />
                    <Tooltip
                      content={<ChartTooltip tab="Price" range={range} />}
                      cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={activeLineColor}
                      strokeWidth={2}
                      fill="url(#fsGrad)"
                      dot={false}
                      activeDot={{ r: 5, fill: activeLineColor, strokeWidth: 0 }}
                      isAnimationActive={true}
                      animationDuration={600}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : tab === "Volume" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activeVolumeData}
                    margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.chartGrid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(ts) =>
                        fmtTime(
                          ts,
                          TIME_RANGES.find((x) => x.label === range)?.days || "1"
                        )
                      }
                      tick={{ fill: C.textDim, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      tickCount={8}
                    />
                    <YAxis
                      tick={{ fill: C.textDim, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => fmt$(v)}
                      width={76}
                    />
                    <Tooltip
                      content={<ChartTooltip tab="Volume" range={range} />}
                      cursor={{ fill: `${C.purple}10` }}
                    />
                    <Bar
                      dataKey="volume"
                      fill={C.purple}
                      fillOpacity={0.8}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={tvlData}
                    margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fsTVL1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.cyan} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fsTVL2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.green} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.chartGrid}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(ts) =>
                        fmtTime(
                          ts,
                          TIME_RANGES.find((x) => x.label === range)?.days || "1"
                        )
                      }
                      tick={{ fill: C.textDim, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      tickCount={8}
                    />
                    <YAxis
                      tick={{ fill: C.textDim, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => v + "B"}
                      width={56}
                    />
                    <Tooltip
                      content={<ChartTooltip tab="TVL" range={range} />}
                      cursor={{ stroke: C.cyan, strokeWidth: 1, strokeDasharray: "4 4" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="globalTVL"
                      name="ETH Ecosystem"
                      stroke={C.cyan}
                      strokeWidth={2}
                      fill="url(#fsTVL1)"
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={600}
                      animationEasing="ease-in-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="tronicTVL"
                      name="TronicLens"
                      stroke={C.green}
                      strokeWidth={2}
                      fill="url(#fsTVL2)"
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={600}
                      animationEasing="ease-in-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div
              style={{
                padding: "8px 16px",
                borderTop: `1px solid ${C.chartBorder}`,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: C.textDim, fontSize: "10px" }}>
                {tab === "TVL"
                  ? "ETH Ecosystem TVL via DeFiLlama · TronicLens TVL via The Graph"
                  : tab === "Volume"
                    ? "Volume data via CoinGecko"
                    : chartType === "candle"
                      ? "OHLC data via CoinGecko · Chart by TradingView"
                      : "Historical price data via CoinGecko"}
              </span>
              {isMobile && (
                <span style={{ color: C.textDim, fontSize: "10px" }}>
                  Rotate device for best experience
                </span>
              )}
            </div>
          </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
