// App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

// ─── Splash Screen ────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: '#060d1a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
        gap: '24px',
      }}
    >
      {/* Ambient glow behind logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #38bdf815 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Logo */}
      <motion.img
        src="/logos/troniclens-logo-transparent.svg"
        alt="TronicLens"
        initial={{ opacity: 0, scale: 0.6, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: '90px', height: '90px',
          filter: 'drop-shadow(0 0 24px #38bdf860)',
          position: 'relative', zIndex: 1,
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <h1 style={{
          fontSize: '28px', fontWeight: 800,
          background: 'linear-gradient(135deg, #e2e8f0, #38bdf8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.03em',
          margin: '0 0 6px',
        }}>
          TronicLens
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            color: '#64748b', fontSize: '12px',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}
        >
          On-chain intelligence
        </motion.p>
      </motion.div>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        style={{
          position: 'relative', zIndex: 1,
          width: '120px', height: '2px',
          backgroundColor: '#0e2040',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '0%' }}
          transition={{ delay: 1.1, duration: 1.2, ease: 'easeInOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #38bdf8, #38bdf8)',
            borderRadius: '2px',
          }}
        />
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
          <Route path="/" element={<Dashboard activeItem={activeItem} />} />
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
  )
}

export default App
