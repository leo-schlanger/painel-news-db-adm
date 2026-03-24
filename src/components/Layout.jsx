import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Menu, Command } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

const SIDEBAR_KEY = 'news_admin_sidebar_collapsed'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_KEY)
    return saved === 'true'
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, collapsed.toString())
  }, [collapsed])

  const toggleSidebar = () => {
    setCollapsed(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed left-0 top-0 h-screen z-40 transform transition-transform duration-200 md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-200',
          collapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        {/* Top Bar (Mobile) */}
        <header className="sticky top-0 z-20 h-16 bg-[hsl(var(--background))]/80 backdrop-blur-md border-b border-[hsl(var(--border))] flex items-center justify-between px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-[hsl(var(--foreground))]">News Manager</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
              document.dispatchEvent(event)
            }}
          >
            <Command className="w-5 h-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
