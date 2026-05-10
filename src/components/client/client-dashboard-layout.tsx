'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Sparkles, Home, FileText, Clock, Bell, User, LogOut, Menu, X, MapPin, Ticket, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CurrencySelector } from '@/components/shared/currency-selector'

interface SidebarItem {
  title: string
  href: string
  icon: any
  badge?: string
  section?: string
}

const clientSidebarItems: SidebarItem[] = [
  {
    title: 'Overview',
    href: '/client/dashboard',
    icon: Home,
  },
  {
    title: 'My Services',
    href: '/client/services',
    icon: FileText,
    section: 'Services',
  },
  {
    title: 'Tracking',
    href: '/client/tracking',
    icon: MapPin,
  },
  {
    title: 'Receipts',
    href: '/client/receipts',
    icon: Clock,
  },
  {
    title: 'Tickets',
    href: '/client/tickets',
    icon: Ticket,
    section: 'Support',
  },
  {
    title: 'Notifications',
    href: '/client/notifications',
    icon: Bell,
    badge: 'New',
  },
  {
    title: 'Profile',
    href: '/client/profile',
    icon: User,
    section: 'Account',
  },
]

export function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getInitials = (name?: string) => {
    if (!name) return 'C'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 transition-all duration-300 ease-out shadow-sm',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16',
        isMobile && !sidebarOpen && '-translate-x-full'
      )}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-4 md:p-3 border-b border-border/50">
            <Link href="/client/dashboard" className="flex items-center gap-3 group">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-400 rounded-lg blur-sm opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-primary to-emerald-500 rounded-lg p-1.5">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className={cn("transition-all duration-300", !sidebarOpen && 'md:hidden')}>
                <h1 className="text-lg font-bold tracking-tight">Client Portal</h1>
                <p className="text-xs text-muted-foreground">Global Green Services</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {clientSidebarItems.map((item, idx) => {
              const isActive = pathname === item.href
              const showSection = item.section && (idx === 0 || clientSidebarItems[idx - 1].section !== item.section)

              return (
                <div key={item.href}>
                  {showSection && (
                    <p className={cn(
                      "px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 transition-all duration-300",
                      !sidebarOpen && 'md:hidden'
                    )}>
                      {item.section}
                    </p>
                  )}
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                  >
                    <item.icon className={cn('h-4.5 w-4.5 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                    <span className={cn("transition-all duration-300", !sidebarOpen && 'md:hidden')}>{item.title}</span>
                    {item.badge && (
                      <span className={cn(
                        "ml-auto px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary rounded-full",
                        !sidebarOpen && 'md:hidden'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-border/50">
            <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300", !sidebarOpen && 'md:justify-center')}>
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-white text-xs font-semibold">
                  {getInitials(session?.user?.name ?? undefined)}
                </AvatarFallback>
              </Avatar>
              <div className={cn("flex-1 min-w-0 transition-all duration-300", !sidebarOpen && 'md:hidden')}>
                <p className="text-sm font-medium truncate">{session?.user?.name?.split(' ')[0] || 'Client'}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={cn("w-full justify-start mt-1 text-muted-foreground hover:text-destructive transition-all duration-300", !sidebarOpen && 'md:justify-center')}
              onClick={() => signOut({ callbackUrl: '/auth/login' })}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn("ml-2 transition-all duration-300", !sidebarOpen && 'md:hidden')}>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-out',
        sidebarOpen ? 'md:ml-64' : 'md:ml-16'
      )}>
        {/* Top Header */}
        <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
          <div className="px-4 md:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden md:flex"
              >
                {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold tracking-tight">
                {clientSidebarItems.find(item => item.href === pathname)?.title || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <CurrencySelector />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full border-2 border-card" />
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href="/">
                  <Home className="h-4 w-4 mr-1.5" />
                  View Site
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
