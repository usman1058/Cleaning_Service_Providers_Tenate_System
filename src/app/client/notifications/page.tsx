'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, FileText, Clock, CheckCircle2, Loader2, X } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function ClientNotificationsPage() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      setError('')
      const response = await fetch('/api/client/notifications')
      if (!response.ok) {
        setError('Failed to load notifications.')
        return
      }
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setError('Failed to load notifications.')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      setMarkingId(id)
      const response = await fetch(`/api/client/notifications/${id}/read`, {
        method: 'PUT',
      })
      if (!response.ok) {
        setError('Failed to update notification.')
        return
      }
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      console.error('Failed to mark as read:', error)
      setError('Failed to update notification.')
    } finally {
      setMarkingId(null)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAll(true)
      const response = await fetch('/api/client/notifications/mark-all-read', {
        method: 'PUT',
      })
      if (!response.ok) {
        setError('Failed to mark all notifications as read.')
        return
      }
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      setError('Failed to mark all notifications as read.')
    } finally {
      setMarkingAll(false)
    }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { variant: any }> = {
      INFO: { variant: 'secondary' as const },
      SUCCESS: { variant: 'default' as const },
      WARNING: { variant: 'outline' as const },
      ERROR: { variant: 'destructive' as const },
    }
    return typeConfig[type] || typeConfig.INFO
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Green Services
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/client/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            <Link href="/client/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/client/services" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <FileText className="h-4 w-4" />
              My Services
            </Link>
            <Link href="/client/receipts" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <Clock className="h-4 w-4" />
              Receipts & Payments
            </Link>
            <Link href="/client/notifications" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Notifications
            </Link>
            <Link href="/client/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              User
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with your service status and important announcements
            </p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <Button onClick={markAllAsRead} disabled={markingAll} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>
        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You're all caught up! Check back later for updates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${!notification.isRead ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0" />
                            )}
                            <h4 className={`font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </h4>
                            <Badge {...getTypeBadge(notification.type)} className="ml-2">
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={markingId === notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
