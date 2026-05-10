'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Sparkles, Menu, X, Search, User, Bell, LogOut, LayoutDashboard, ChevronDown, BellRing } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { CurrencySelector } from '@/components/shared/currency-selector'
import { ThemeToggle } from '@/components/shared/theme-toggle'

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!session?.user?.id) return
    const role = session.user.role?.toLowerCase() || 'client'
    fetch(`/api/${role}/notifications`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) setUnreadCount(data.filter((n: any) => !n.isRead).length)
      })
      .catch(() => {})
  }, [session])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  const getLinks = () => {
    if (!session?.user?.role) return { dashboard: '/client/dashboard', profile: '/client/profile' }
    switch (session.user.role) {
      case 'ADMIN':
        return { dashboard: '/admin/dashboard', profile: '/admin/profile' }
      case 'VENDOR':
        return { dashboard: '/vendor/dashboard', profile: '/vendor/profile' }
      case 'CLIENT':
      default:
        return { dashboard: '/client/dashboard', profile: '/client/profile' }
    }
  }

  const { dashboard, profile } = getLinks()
  const router = useRouter()
  
  console.log('Navbar render - dashboard:', dashboard, 'session:', session?.user?.role)

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-border/30 shadow-sm'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
              <motion.div
                className="relative bg-gradient-to-br from-primary to-emerald-500 rounded-2xl p-2.5 shadow-md"
                whileHover={{ boxShadow: '0 10px 40px -10px rgba(5, 150, 105, 0.5)' }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-emerald-500 bg-clip-text text-transparent leading-tight">
                Global Green Services
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">Professional Cleaning Excellence</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      'text-sm font-medium transition-all duration-200 py-2 relative group',
                      isActive
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground hover:text-primary'
                    )}
                  >
                    {link.label}
                    <motion.span
                      className="absolute bottom-0 left-0 h-0.5 bg-primary rounded-full"
                      initial={{ width: isActive ? '100%' : '0%' }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.2 }}
                    />
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <CurrencySelector />
            <ThemeToggle />
            {status === 'loading' ? (
              <div className="h-10 w-24 bg-muted rounded-xl animate-pulse" />
            ) : session ? (
              <>
                <Link
                  href={`/${session.user.role?.toLowerCase() || 'client'}/notifications`}
                  className="relative inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted/50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground rounded-full px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 h-10 px-3 rounded-xl hover:bg-muted/50 transition-colors hover:scale-102 active:scale-98">
                      <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-white text-sm font-semibold">
                          {getInitials(session.user?.name ?? undefined)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:inline text-sm font-medium">
                        {session.user?.name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold">{session.user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={dashboard} className="cursor-pointer">
                        <LayoutDashboard className="mr-2.5 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={profile} className="cursor-pointer">
                        <User className="mr-2.5 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2.5 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 hover:scale-105 active:scale-98 transition-all">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:scale-105 active:scale-98 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-muted transition-colors active:scale-90"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background border-b border-border/30 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-5">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search services..."
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium text-muted-foreground">Currency</span>
                  <CurrencySelector />
                </div>
                <div className="flex justify-between items-center px-4 py-2 bg-muted/30 rounded-xl">
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="border-t border-border/30" />
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ staggerChildren: 0.05 }}
                  className="space-y-1"
                >
                  {navLinks.map((link, index) => {
                    const isActive = pathname === link.href
                    return (
                      <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'block px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-primary'
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    )
                  })}
                </motion.div>
                <div className="border-t border-border/30" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  {status === 'loading' ? (
                    <div className="h-10 w-full bg-muted rounded-xl animate-pulse" />
                  ) : session ? (
                    <>
                      <div className="px-4 py-3 bg-primary/5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-emerald-500 text-white font-semibold">
                              {getInitials(session.user?.name ?? undefined)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link href={dashboard} onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary">
                        <LayoutDashboard className="h-4 w-4 mr-3" />Dashboard
                      </Link>
                      <Link 
                        href={`/${session.user.role?.toLowerCase() || 'client'}/notifications`} 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary"
                      >
                        <div className="flex items-center">
                          <Bell className="h-4 w-4 mr-3" />Notifications
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href={profile} onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary">
                        <User className="h-4 w-4 mr-3" />Profile
                      </Link>
                      <button onClick={() => { signOut({ callbackUrl: '/' }); setMobileMenuOpen(false) }} className="flex items-center w-full px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4 mr-3" />Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-primary">
                        Login to Your Account
                      </Link>
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-primary">Sign Up Now</Button>
                      </Link>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
