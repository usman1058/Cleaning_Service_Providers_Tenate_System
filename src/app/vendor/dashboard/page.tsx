'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Home, Briefcase, Calendar, CheckCircle2, Loader2, Clock, TrendingUp } from 'lucide-react'

interface VendorStats {
  assignedJobs: number
  inProgress: number
  completed: number
  totalEarnings?: number
  monthlyEarnings?: number
}

interface AssignedService {
  id: string
  serviceName: string
  clientName: string
  location: string
  scheduledDate: string
  status: string
}

import { VendorDashboardLayout } from '@/components/vendor/vendor-dashboard-layout'
import { useCurrency } from '@/components/providers/currency-provider'

export default function VendorDashboard() {
  const { convert } = useCurrency()
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [recentAssignments, setRecentAssignments] = useState<AssignedService[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, assignmentsRes] = await Promise.all([
        fetch('/api/vendor/stats'),
        fetch('/api/vendor/assignments?limit=5'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (assignmentsRes.ok) {
        const assignmentsData = await assignmentsRes.json()
        setRecentAssignments(assignmentsData)
      }
    } catch (error) {
      console.error('Failed to fetch vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      ASSIGNED: { variant: 'secondary', label: 'Assigned' },
      ACCEPTED: { variant: 'default', label: 'Accepted' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'default', label: 'Completed' },
    }

    const config = statusConfig[status] || { variant: 'secondary', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-0">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Home className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Vendor Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your assigned jobs
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.assignedJobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Jobs waiting to be accepted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.inProgress || 0}</div>
              <p className="text-xs text-muted-foreground">
                Currently being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completed || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total jobs completed
              </p>
            </CardContent>
          </Card>

          <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Total Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {convert(stats?.totalEarnings || 0)}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {convert(stats?.monthlyEarnings || 0)} this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
            <CardDescription>Latest jobs assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAssignments.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-300 py-8">
                No recent assignments
              </p>
            ) : (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {assignment.serviceName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Location: {assignment.location}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Scheduled: {new Date(assignment.scheduledDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(assignment.status)}
                      <Link href={`/vendor/execution/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  )
}
