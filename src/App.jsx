// App.jsx
// TronicLens — DeFi Staking Intelligence Cockpit

import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import './index.css'

function App() {
  const [activeItem, setActiveItem] = useState('overview')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#060d1a',
      }}>
        {/* Sidebar */}
        <Sidebar 
          activeItem={activeItem} 
          onItemClick={setActiveItem}
          collapsed={collapsed}
          onCollapse={setCollapsed}
        />

        {/* Main content — offset by sidebar width */}
        <div
          id="main-content"
          style={{
            flex: 1,
            marginLeft: collapsed ? '64px' : '220px',
            minHeight: '100vh',
            transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard activeItem={activeItem} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App