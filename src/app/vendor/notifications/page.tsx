'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell, X, CheckCircle2 } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function VendorNotificationsPage() {
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
      const response = await fetch('/api/vendor/notifications')
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
      const response = await fetch(`/api/vendor/notifications/${id}/read`, { method: 'PUT' })
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
      const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
      const results = await Promise.all(unreadIds.map(id => fetch(`/api/vendor/notifications/${id}/read`, { method: 'PUT' })))
      if (results.some(r => !r.ok)) {
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
    const config: Record<string, { variant: 'secondary' | 'default' | 'outline' | 'destructive' }> = {
      INFO: { variant: 'secondary' },
      SUCCESS: { variant: 'default' },
      WARNING: { variant: 'outline' },
      ERROR: { variant: 'destructive' },
    }
    return config[type] || config.INFO
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay updated with your assignments and important updates</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button onClick={markAllAsRead} disabled={markingAll} variant="outline">Mark All as Read</Button>
        )}
      </div>
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
            <p className="text-gray-600 dark:text-gray-300">You're all caught up! Check back later for updates.</p>
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
                    <div className="flex items-center gap-2 mb-2">
                      {!notification.isRead && <div className="w-2 h-2 bg-emerald-600 rounded-full flex-shrink-0" />}
                      <h4 className={`font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {notification.title}
                      </h4>
                      <Badge {...getTypeBadge(notification.type)} className="ml-2">
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button variant="ghost" size="icon" disabled={markingId === notification.id} onClick={() => markAsRead(notification.id)} className="flex-shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
