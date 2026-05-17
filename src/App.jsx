// App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

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

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App
