// SplashScreen.tsx
// TronicLens — Minimalist, Premium Reveal
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useThemeColors } from "../context/SettingsContext";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const COLORS = useThemeColors();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: onDone,
          });
        },
      });

      // Initial state
      gsap.set(logoRef.current, { opacity: 0, scale: 0.95, filter: "blur(8px)" });
      gsap.set(titleRef.current, { opacity: 0, y: 10, filter: "blur(4px)" });
      gsap.set(subtitleRef.current, { opacity: 0, y: 5 });

      // Animate Logo
      tl.to(logoRef.current, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.out",
      });

      // Animate Title & Subtitle with a slight stagger
      tl.to(
        [titleRef.current, subtitleRef.current],
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
        },
        "-=0.6"
      );

      // Hold for reading
      tl.to({}, { duration: 1.2 });
    }, containerRef);

    return () => ctx.revert();
  }, [onDone]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: COLORS.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999, // extremely high to cover everything
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={logoRef}
          src="/logos/troniclens-logo-transparent.svg"
          alt="TronicLens Logo"
          style={{
            width: "72px",
            height: "72px",
            // Invert if we are in light theme
            filter: COLORS.bg === "#f1f5f9" ? "invert(1) brightness(0.2)" : "drop-shadow(0 0 10px rgba(56, 189, 248, 0.2))", 
          }}
        />
        <div style={{ textAlign: "center" }}>
          <h1
            ref={titleRef}
            style={{
              fontSize: "28px",
              fontWeight: 600,
              color: COLORS.text,
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.03em",
              margin: "0 0 8px 0",
            }}
          >
            TronicLens
          </h1>
          <p
            ref={subtitleRef}
            style={{
              fontSize: "13px",
              color: COLORS.textMuted,
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.02em",
              margin: 0,
              fontWeight: 500,
            }}
          >
            On-Chain Intelligence
          </p>
        </div>
      </div>
    </div>
  );
}
