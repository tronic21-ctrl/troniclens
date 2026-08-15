import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/src/components/LenisProvider";
import CustomCursor from "@/src/components/CustomCursor";
import MouseTrail from "@/src/components/MouseTrail";

export const metadata: Metadata = {
  title: "TronicLens | On-Chain Intelligence",
  description:
    "On-chain DeFi analytics dashboard with staking intelligence, whale activity monitoring, Chainlink price feeds, and AI-powered insights. ETHOnline 2026 submission.",
  openGraph: {
    title: "TronicLens | On-Chain Intelligence",
    description:
      "On-chain DeFi analytics dashboard with staking intelligence, whale activity monitoring, and AI-powered insights.",
    type: "website",
    url: "https://troniclens.vercel.app",
    images: [
      {
        url: "https://troniclens.vercel.app/logos/troniclens-logo-transparent.svg",
        width: 512,
        height: 512,
        alt: "TronicLens Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TronicLens — DeFi Intelligence",
    description: "On-chain DeFi analytics with AI insights.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{
          fontFamily: "var(--font-sans), system-ui, -apple-system, sans-serif",
          minHeight: "100dvh",
          overflowX: "hidden"
        }}
      >
        <LenisProvider>
          <CustomCursor />
          <MouseTrail />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
