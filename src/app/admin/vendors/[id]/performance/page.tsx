'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Sparkles, Home, FileText, Users, CheckCircle2, Calendar, Clock, ArrowLeft, Star, TrendingUp, TrendingDown, Users2, Award, Loader2, AlertTriangle, X } from 'lucide-react'

interface VendorPerformance {
  id: string
  vendorName: string
  companyName: string
  email: string
  phone?: string
  serviceLocations: string
  servicesOffered: string
  teamSize: number
  dailyCapacity: number
  availabilitySchedule: string

  // Performance metrics
  totalJobsAssigned: number
  jobsCompleted: number
  jobsInProgress: number
  jobsCancelled: number
  completionRate: number
  averageRating: number
  totalEarnings: number
  monthlyEarnings: number
  onTimeCompletionRate: number
  averageJobDuration: number
  isActive: boolean
  createdAt: string

  // Job history (last 10 jobs)
  recentJobs: Array<{
    id: string
    serviceName: string
    scheduledDate: string
    completedDate?: string
    duration: number
    rating?: number
    onTime: boolean
  }>
}

export default function AdminVendorPerformance() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string

  const [performance, setPerformance] = useState<VendorPerformance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (vendorId) {
      fetchPerformance()
    }
  }, [vendorId])

  const fetchPerformance = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/performance`)
      if (response.ok) {
        const data = await response.json()
        setPerformance(data)
      }
    } catch (error) {
      console.error('Failed to fetch vendor performance:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRatingStars = (rating: number) => {
    const stars: React.ReactNode[] = []
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />)
      }
    }
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading vendor performance...</p>
      </div>
    )
  }

  if (!performance) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
          <div className="container mx-auto px-4">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 py-4">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Green Services
              </h1>
            </Link>
          </div>
        </header>

        <section className="container mx-auto px-4 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Vendor Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The vendor you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/admin/vendors">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              Back to Vendors
            </Button>
          </Link>
        </section>
      </div>
    )
  }

  const completionRate = Math.round((performance.jobsCompleted / performance.totalJobsAssigned) * 100) || 0
  const onTimeRate = Math.round(performance.onTimeCompletionRate * 100) || 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-emerald-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Global Green Services
            </h1>
          </Link>
        </div>
      </header>

      <nav className="bg-white dark:bg-gray-950 border-b overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/admin/services" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <FileText className="h-4 w-4" />
              Services
            </Link>
            <Link href="/admin/clients" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Users className="h-4 w-4" />
              Clients
            </Link>
            <Link href="/admin/receipts" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4" />
              Receipt Verification
            </Link>
            <Link href="/admin/vendors" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
              <Users2 className="h-4 w-4" />
              Vendors
            </Link>
            <Link href="/admin/assignments" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              Assignments
            </Link>
            <Link href="/admin/monitoring" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Clock className="h-4 w-4" />
              Monitoring
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              Reports
            </Link>
            <Link href="/admin/tickets" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <X className="h-4 w-4" />
              Support Tickets
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin/vendors" className="inline-flex items-center text-emerald-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Link>
        </div>

        {/* Vendor Info Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{performance.vendorName}</CardTitle>
                  <CardTitle className="text-lg text-gray-600 dark:text-gray-300">{performance.companyName}</CardTitle>
                  <Badge variant={performance.isActive ? 'default' : 'secondary'} className={performance.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                    {performance.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>
                  {performance.email}
                  {performance.phone && ` • ${performance.phone}`}
                </CardDescription>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Member since: {new Date(performance.createdAt).toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Jobs</p>
                <p className="text-2xl font-bold">{performance.totalJobsAssigned}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{performance.jobsCompleted}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{performance.jobsInProgress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{performance.jobsCancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Completion Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Overall Rate</span>
                  <span className="text-3xl font-bold text-emerald-600">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Client Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Average Rating</span>
                  <span className="text-3xl font-bold text-yellow-500">
                    {(performance.averageRating ?? 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-center gap-1">
                  {getRatingStars(Math.round(performance.averageRating))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Lifetime</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${performance.totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${performance.monthlyEarnings.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* On-Time Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                On-Time Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">On-Time Rate</span>
                  <span className="text-3xl font-bold text-emerald-600">{onTimeRate}%</span>
                </div>
                <Progress value={onTimeRate} className="h-2" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Avg. Job Duration: {(performance.averageJobDuration ?? 0).toFixed(1)} hrs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Capacity */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-emerald-600" />
              Team & Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Team Size</p>
                <p className="text-2xl font-bold">{performance.teamSize}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cleaning staff</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Daily Capacity</p>
                <p className="text-2xl font-bold">{performance.dailyCapacity}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Jobs per day</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Services Offered</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                  {JSON.parse(performance.servicesOffered).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Locations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Service Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{performance.serviceLocations}</p>
          </CardContent>
        </Card>

        {/* Recent Job History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Recent Job History
            </CardTitle>
            <CardDescription>
              Last 10 jobs completed by this vendor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {performance.recentJobs.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Jobs Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This vendor hasn't completed any jobs yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {performance.recentJobs.map((job, index) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {job.serviceName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.completedDate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {job.duration}h
                          </span>
                        )}
                        {job.onTime ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3">
                      {job.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {job.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Awaiting rating
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href={`/admin/assignments?vendor=${performance.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="py-6 text-center">
                <Calendar className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">View Assignments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  All jobs assigned to this vendor
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/admin/vendors/profiles/${performance.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="py-6 text-center">
                <Users2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Edit Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Update vendor information and settings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href={`/admin/vendors/profiles/${performance.id}`}>
            <Button
              variant="outline"
              className="w-full py-6"
            >
              Deactivate Vendor
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
