// App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter, queryClient } from './config/reown'

// ─── Splash Screen ────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: '#060d1a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes beamScan {
          0% { top: -4px; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes beamTrail {
          0% { top: -30%; }
          100% { top: 110%; }
        }
        @keyframes revealContent {
          0% { opacity: 0; filter: brightness(0); }
          100% { opacity: 1; filter: brightness(1); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Beam line */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, #38bdf830 15%, #38bdf8 40%, #ffffff 50%, #38bdf8 60%, #38bdf830 85%, transparent 100%)',
        animation: 'beamScan 1.2s ease-in-out 0.2s forwards',
        zIndex: 10,
        boxShadow: '0 0 20px #38bdf8, 0 0 40px #38bdf860',
      }} />

      {/* Beam trail glow */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0,
        height: '120px',
        background: 'linear-gradient(180deg, transparent, #38bdf808, #38bdf815, #38bdf808, transparent)',
        animation: 'beamTrail 1.2s ease-in-out 0.2s forwards',
        zIndex: 9,
        pointerEvents: 'none',
      }} />

      {/* Content - revealed after beam */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '20px',
          position: 'relative', zIndex: 5,
        }}
      >
        {/* Ambient glow */}
        <div style={{
          position: 'absolute',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #38bdf820 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'glowPulse 2s ease-in-out infinite',
          zIndex: -1,
        }} />

        {/* Logo */}
        <motion.img
          src="/logos/troniclens-logo-transparent.svg"
          alt="TronicLens"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.5, ease: 'easeOut' }}
          style={{
            width: '100px', height: '100px',
            filter: 'drop-shadow(0 0 20px #38bdf860)',
          }}
        />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{
            fontSize: '30px', fontWeight: 800,
            background: 'linear-gradient(135deg, #e2e8f0 0%, #38bdf8 60%, #818cf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '-0.02em',
            margin: '0 0 8px',
          }}>
            TronicLens
          </h1>
          <p style={{
            color: '#38bdf890',
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            margin: 0,
          }}>
            On-Chain Intelligence
          </p>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.3 }}
          style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '6px',
          }}
        >
          <div style={{
            width: '140px', height: '2px',
            backgroundColor: '#38bdf815',
            borderRadius: '2px', overflow: 'hidden',
            border: '1px solid #38bdf825',
          }}>
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 1.8, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #1e40af, #38bdf8, #93c5fd)',
                borderRadius: '2px',
                boxShadow: '0 0 10px #38bdf8',
              }}
            />
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9, duration: 0.3 }}
            style={{
              color: '#38bdf850', fontSize: '9px',
              fontFamily: 'monospace', letterSpacing: '0.15em',
            }}
          >
            LOADING INTELLIGENCE...
          </motion.span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── App Inner ────────────────────────────────────────────────────
function AppInner() {
  const isMobile = () => window.innerWidth < 768
  const [activeItem, setActiveItem] = useState('overview')
  const [collapsed, setCollapsed] = useState(isMobile())
  const [mobile, setMobile] = useState(isMobile())

  useEffect(() => {
    const handleResize = () => {
      const m = isMobile()
      setMobile(m)
      if (m) setCollapsed(true)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleItemClick = (id) => {
    setActiveItem(id)
    if (mobile) setCollapsed(true)
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#060d1a',
      position: 'relative',
    }}>
      <div style={{
        position: mobile ? 'fixed' : 'relative',
        top: 0, left: 0,
        height: '100vh',
        zIndex: mobile ? 100 : 'auto',
      }}>
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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      <div
        id="main-content"
        style={{
          flex: 1,
          marginLeft: mobile ? (collapsed ? '64px' : '0px') : (collapsed ? '64px' : '220px'),
          minHeight: '100vh',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard activeItem={activeItem} mobile={mobile} onItemClick={handleItemClick} />} />
        </Routes>
      </div>
    </div>
  )
}

// ─── App Root ─────────────────────────────────────────────────────
function App() {
  // Splash hanya muncul sekali per sesi — refresh tidak trigger ulang
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('troniclens_splash_seen')
  })

  const handleSplashDone = () => {
    sessionStorage.setItem('troniclens_splash_seen', '1')
    setShowSplash(false)
  }

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              {showSplash ? (
                <SplashScreen key="splash" onDone={handleSplashDone} />
              ) : (
                <motion.div
                  key="app"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ minHeight: '100vh' }}
                >
                  <AppInner />
                </motion.div>
              )}
            </AnimatePresence>
          </BrowserRouter>
        </SettingsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
