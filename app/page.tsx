// app/page.tsx
// TronicLens — Main Cockpit Entry Point
"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { SettingsProvider, useThemeColors } from "../src/context/SettingsContext";
import Web3Provider from "../src/components/Web3Provider";

// Dynamic imports for client-only components
const SplashScreen = dynamic(
  () => import("../src/components/SplashScreen"),
  { ssr: false }
);
const Sidebar = dynamic(() => import("../src/components/Sidebar"), {
  ssr: false,
});
const Dashboard = dynamic(() => import("../src/components/Dashboard"), {
  ssr: false,
});

function AppInner() {
  const COLORS = useThemeColors();
  const isMobile = () =>
    typeof window !== "undefined" && window.innerWidth < 768;
  const [activeItem, setActiveItem] = useState("overview");
  const [collapsed, setCollapsed] = useState(isMobile());
  const [mobile, setMobile] = useState(isMobile());

  useEffect(() => {
    const handleResize = () => {
      const m = isMobile();
      setMobile(m);
      if (m) setCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (id: string) => {
    setActiveItem(id);
    if (mobile) setCollapsed(true);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: COLORS.bg,
        position: "relative",
        transition: "background-color 0.35s ease",
      }}
    >
      <div
        style={{
          position: mobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: mobile ? 100 : "auto",
        }}
      >
        <Sidebar
          activeItem={activeItem}
          onItemClick={handleItemClick}
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />
      </div>

      {mobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 99,
          }}
        />
      )}

      <div
        id="main-content"
        style={{
          flex: 1,
          marginLeft: mobile
            ? collapsed
              ? "76px"
              : "0px"
            : collapsed
              ? "76px"
              : "260px",
          minHeight: "100vh",
          transition: "margin-left 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        <Dashboard
          activeItem={activeItem}
          mobile={mobile}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === "undefined") return true;
    return !sessionStorage.getItem("troniclens_splash_seen");
  });

  const handleSplashDone = () => {
    sessionStorage.setItem("troniclens_splash_seen", "1");
    setShowSplash(false);
  };

  return (
    <SettingsProvider>
      <Web3Provider>
        <AnimatePresence mode="wait">
          {showSplash ? (
            <SplashScreen key="splash" onDone={handleSplashDone} />
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ minHeight: "100vh" }}
            >
              <AppInner />
            </motion.div>
          )}
        </AnimatePresence>
      </Web3Provider>
    </SettingsProvider>
  );
}
