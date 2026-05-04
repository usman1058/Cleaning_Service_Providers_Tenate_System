'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, FileText, Bell, User, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface DashboardStats {
  activeServices: number
  pendingVerification: number
  completedServices: number
}

interface ServiceRequest {
  id: string
  serviceName: string
  status: string
  scheduledDate?: string
  createdAt: string
}

export default function ClientDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentServices, setRecentServices] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, servicesRes] = await Promise.all([
        fetch('/api/client/dashboard'),
        fetch('/api/client/services?limit=5'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setRecentServices(servicesData)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      PENDING_VERIFICATION: { variant: 'secondary', label: 'Pending Verification' },
      VERIFIED: { variant: 'default', label: 'Verified' },
      ASSIGNED: { variant: 'default', label: 'Assigned' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' },
    }

    const config = statusConfig[status] || { variant: 'secondary', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Home className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {session?.user?.name?.split(' ')[0] || 'there'}!
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your cleaning services
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeServices || 0}</div>
            <p className="text-xs text-muted-foreground">
              Services currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingVerification || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting receipt verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Services</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedServices || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total services completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Services */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Services
          </h2>
          <Link href="/client/services">
            <Button variant="ghost" className="text-emerald-600">
              View All →
            </Button>
          </Link>
        </div>
      </div>

      {recentServices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No services requested yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You haven't requested any cleaning services yet. Browse our services to get started.
            </p>
            <Link href="/services">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Browse Services
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 mb-8">
          {recentServices.map((service) => (
            <Card key={service.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {service.serviceName || 'Custom Service'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Requested on {new Date(service.createdAt).toLocaleDateString()}
                    </p>
                    {service.scheduledDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Scheduled for {new Date(service.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(service.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/services">
              <Button variant="outline" className="w-full h-full py-6 flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Book New Service</span>
              </Button>
            </Link>
            <Link href="/client/receipts">
              <Button variant="outline" className="w-full h-full py-6 flex flex-col items-center gap-2">
                <Clock className="h-6 w-6" />
                <span>View Receipts</span>
              </Button>
            </Link>
            <Link href="/client/notifications">
              <Button variant="outline" className="w-full h-full py-6 flex flex-col items-center gap-2">
                <Bell className="h-6 w-6" />
                <span>Check Notifications</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
