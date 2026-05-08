'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, LayoutDashboard, FileText, Bell, CheckCircle2, Loader2, X } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function AdminNotificationsPage() {
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
      const response = await fetch('/api/admin/notifications')
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
      const response = await fetch(`/api/admin/notifications/${id}/read`, {
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
      const response = await fetch('/api/admin/notifications/mark-all-read', {
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
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-gray-950/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Green Services
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              System Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor important system events and user actions
            </p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <Button onClick={markAllAsRead} disabled={markingAll} variant="outline">
              Mark All as Read
            </Button>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You're all caught up!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${!notification.isRead ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
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
