import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Wrench } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#111111]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-amber-500 focus:text-black focus:font-semibold focus:text-sm"
      >
        Saltar al contenido
      </a>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Content area offset by sidebar on desktop */}
      <div className="md:ml-[220px] min-h-screen flex flex-col">
        {/* Mobile top bar */}
        <header
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3"
          style={{
            background: '#0d0d0d',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: '#1e1e1e',
                border: '1px solid rgba(245,158,11,0.2)',
                boxShadow: '0 0 12px -4px rgba(245,158,11,0.25)',
              }}
            >
              <Wrench size={13} className="text-amber-500" />
            </div>
            <span className="text-white text-sm font-semibold tracking-tight">Electroteca</span>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-auto">
          <div key={location.pathname} className="animate-slide-up-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
