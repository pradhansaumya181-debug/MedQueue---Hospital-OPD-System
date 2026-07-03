// src/components/common/DashboardLayout.jsx
// Shared layout — Navbar + Sidebar + Content
// Saare dashboard pages isko wrap karenge

import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--surface-2)' }}>
      <Navbar onMenuClick={() => setSidebarOpen(v => !v)} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
