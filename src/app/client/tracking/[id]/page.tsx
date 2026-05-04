'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, FileText, Bell, User, Clock, Calendar, CheckCircle2, AlertCircle, ArrowLeft, MapPin, Loader2, Truck, Hourglass, Navigation, TrendingUp } from 'lucide-react'

interface TrackingData {
  serviceRequest: {
    id: string
    serviceName: string
    serviceDescription: string
    serviceStartingPrice: number
    status: string
    preferredDate: string
    preferredTime: string
    scheduledDate?: string
    location: {
      address: string
      city: string
      state: string
      zipCode: string
      latitude?: number
      longitude?: number
    }
    createdAt: string
    estimatedDuration?: string
  }
  receipt: {
    id: string
    status: string
    imageUrl: string
    adminRemarks: string
    reviewedAt: string
    reviewedBy: string
  }
  assignment: {
    id: string
    status: string
    vendor: {
      name: string
      phone: string
      email: string
      companyName: string
    }
    vendorAcceptedAt?: string
    startedAt?: string
    completedAt?: string
    beforeImage?: string
    afterImage?: string
    vendorNotes?: string
  }
}

interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: string
  status: 'completed' | 'pending' | 'in-progress'
  icon: any
}

export default function ClientTracking() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (requestId) {
      fetchTrackingData()
    }

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh && requestId) {
        fetchTrackingData()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [requestId, autoRefresh])

  const fetchTrackingData = async () => {
    try {
      setError('')
      const response = await fetch(`/api/client/tracking/${requestId}`)
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || 'Unable to load tracking details right now.')
        return
      }
      const data = await response.json()
      setTrackingData(data)
      setLastUpdate(new Date().toLocaleTimeString())
    } catch (error) {
      console.error('Failed to fetch tracking data:', error)
      setError('Unable to load tracking details right now.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; color: string }> = {
      PENDING_VERIFICATION: { variant: 'secondary', label: 'Pending Verification', color: 'gray' },
      VERIFIED: { variant: 'default', label: 'Verified', color: 'blue' },
      ASSIGNED: { variant: 'default', label: 'Assigned to Vendor', color: 'purple' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress', color: 'orange' },
      COMPLETED: { variant: 'default', label: 'Completed', color: 'green' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled', color: 'red' },
    }

    const config = statusConfig[status] || statusConfig.PENDING_VERIFICATION
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getEstimatedArrival = () => {
    if (!trackingData || !trackingData.assignment) {
      return null
    }

    const { assignment, serviceRequest } = trackingData

    if (serviceRequest.status === 'ASSIGNED' || serviceRequest.status === 'IN_PROGRESS') {
      // Calculate estimated arrival based on assignment
      const assignmentTime = assignment.startedAt || assignment.vendorAcceptedAt || serviceRequest.scheduledDate
      
      if (assignmentTime && assignment.vendor) {
        // Estimated: 30 mins after assignment accepted or scheduled date + buffer
        const baseTime = new Date(assignmentTime)
        baseTime.setMinutes(baseTime.getMinutes() + 30)
        
        return {
          time: baseTime,
          message: assignment.startedAt
            ? 'Our cleaning team is on the way!'
            : 'Your service has been assigned.',
          vendorName: assignment.vendor.companyName,
          vendorContact: assignment.vendor.phone,
        }
      }
    }

    return null
  }

  const getTimeline = (): TimelineEvent[] => {
    if (!trackingData) return []

    const { serviceRequest, receipt, assignment } = trackingData
    const events: TimelineEvent[] = []

    // 1. Service Requested
    events.push({
      id: '1',
      title: 'Service Requested',
      description: `You requested ${serviceRequest.serviceName || 'your service'} for ${serviceRequest.location?.address || 'your location'}${serviceRequest.location?.city ? `, ${serviceRequest.location.city}` : ''}`,
      timestamp: serviceRequest.createdAt,
      status: 'completed',
      icon: FileText,
    })

    // 2. Receipt Verification
    if (receipt) {
      const receiptStatus = receipt.status === 'APPROVED' ? 'completed' : receipt.status === 'PENDING' ? 'in-progress' : 'pending'
      events.push({
        id: '2',
        title: receipt.status === 'APPROVED' ? 'Payment Verified' : 'Payment Under Review',
        description: receipt.status === 'APPROVED'
          ? 'Your payment has been verified and service is pending assignment.'
          : 'Our team is reviewing your payment receipt.',
        timestamp: receipt.reviewedAt || serviceRequest.createdAt,
        status: receiptStatus,
        icon: receipt.status === 'APPROVED' ? CheckCircle2 : Clock,
      })
    }

    // 3. Service Assigned
    if (assignment && assignment.status === 'ASSIGNED') {
      events.push({
        id: '3',
        title: 'Service Assigned to Vendor',
        description: `Your service has been assigned to ${assignment.vendor?.companyName || assignment.vendor?.name || 'a vendor'}. Vendor will arrive at scheduled time.`,
        timestamp: new Date().toISOString(), // No createdAt on assignment, using current time as placeholder
        status: receipt?.status === 'APPROVED' ? 'in-progress' : 'pending',
        icon: User,
      })
    }

    // 4. Vendor on the way
    if (assignment?.startedAt && assignment.status === 'IN_PROGRESS') {
      events.push({
        id: '4',
        title: 'Vendor Arriving',
        description: `${assignment.vendor?.companyName || assignment.vendor?.name || 'Your vendor'} is currently on their way to your location. Estimated arrival time: ${new Date(new Date(assignment.startedAt).getTime() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: assignment.startedAt,
        status: 'completed',
        icon: Truck,
      })
    }

    // 5. Service Completed
    if (assignment?.status === 'COMPLETED' && assignment.completedAt) {
      events.push({
        id: '5',
        title: 'Service Completed',
        description: `Your service has been completed successfully. Please check the before/after photos in your dashboard.`,
        timestamp: assignment.completedAt,
        status: 'completed',
        icon: CheckCircle2,
      })
    }

    return events
  }

  const estimatedArrival = getEstimatedArrival()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
              <Link href="/">
                <Button variant="ghost">Home</Button>
              </Link>
              <Link href="/client/dashboard">
                <Button variant="ghost">Back to Dashboard</Button>
              </Link>
            </nav>
          </div>
        </header>

        <section className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Service Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The service you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/client/dashboard">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </div>
    )
  }

  const timeline = getTimeline()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <nav className="bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/client/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/client/services" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <FileText className="h-4 w-4" />
              My Services
            </Link>
            <Link href="/client/tracking" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              Tracking
            </Link>
            <Link href="/client/receipts" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Clock className="h-4 w-4" />
              Receipts
            </Link>
            <Link href="/client/notifications" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Bell className="h-4 w-4" />
              Notifications
            </Link>
            <Link href="/client/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/client/services" className="inline-flex items-center text-emerald-600 hover:underline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Services
          </Link>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchTrackingData}>Retry</Button>
            </CardContent>
          </Card>
        )}

        {/* Estimated Arrival Card */}
        {estimatedArrival && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex-shrink-0">
                <Navigation className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                  {estimatedArrival.message}
                </h3>
                <p className="text-emerald-700 dark:text-emerald-200 mb-3">
                  {estimatedArrival.vendorName}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Estimated Arrival
                    </p>
                    <p className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
                      {estimatedArrival.time.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </p>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                      {trackingData.serviceRequest.location.address}, {trackingData.serviceRequest.location.city}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-700 dark:text-emerald-200">
                    Vendor: {estimatedArrival.vendorName} • Phone: {estimatedArrival.vendorContact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Details */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle>Service Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Service</p>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    {trackingData.serviceRequest.serviceName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {trackingData.serviceRequest.serviceDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      {trackingData.serviceRequest.status === 'COMPLETED' ? 'Completed On' : 'Status'}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {getStatusBadge(trackingData.serviceRequest.status)}
                    </p>
                  </div>
                  {trackingData.serviceRequest.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Clock className="h-8 w-8 text-blue-600 flex-shrink-0 animate-pulse" />
                  )}
                </div>

                <div className="text-2xl font-bold text-emerald-600">
                  ${(trackingData.serviceRequest?.serviceStartingPrice ?? 0).toFixed(2)}
                </div>

                {trackingData.serviceRequest.estimatedDuration && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Estimated Duration
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {trackingData.serviceRequest.estimatedDuration}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Service Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Address
                  </p>
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    {trackingData.serviceRequest.location.address}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">City</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trackingData.serviceRequest.location.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">State</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trackingData.serviceRequest.location.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">ZIP Code</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trackingData.serviceRequest.location.zipCode}
                    </p>
                  </div>
                  {trackingData.serviceRequest.location.latitude && trackingData.serviceRequest.location.longitude && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trackingData.serviceRequest.location.latitude + ',' + trackingData.serviceRequest.location.longitude)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-600 hover:underline"
                    >
                      Open in Google Maps →
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Requested</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(trackingData.serviceRequest.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    {trackingData.serviceRequest.status === 'COMPLETED' ? 'Completed On' : 'Scheduled For'}
                  </p>
                  {trackingData.serviceRequest.scheduledDate ? (
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {new Date(trackingData.serviceRequest.scheduledDate).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  ) : (
                    <p className="font-semibold text-lg text-gray-900 dark:text-white">
                      {trackingData.serviceRequest.preferredDate} at {trackingData.serviceRequest.preferredTime}
                    </p>
                  )}
                </div>

                {trackingData.serviceRequest.estimatedDuration && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Duration
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {trackingData.serviceRequest.estimatedDuration}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Information */}
        {trackingData.assignment && trackingData.assignment.vendor && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Vendor Information
              </CardTitle>
              {getStatusBadge(trackingData.assignment.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Company</p>
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    {trackingData.assignment.vendor.companyName}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Contact Person</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trackingData.assignment.vendor.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {trackingData.assignment.vendor.phone}
                    </p>
                  </div>
                </div>

                {trackingData.assignment.vendorNotes && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Vendor Notes</p>
                    <p className="text-gray-900 dark:text-white text-sm">
                      {trackingData.assignment.vendorNotes}
                    </p>
                  </div>
                )}

                {trackingData.assignment.beforeImage && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Before Photo</p>
                    <img
                      src={trackingData.assignment.beforeImage}
                      alt="Before cleaning"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {trackingData.assignment.afterImage && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">After Photo</p>
                    <img
                      src={trackingData.assignment.afterImage}
                      alt="After cleaning"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Service Progress Timeline</CardTitle>
            <CardDescription>
              Last updated: {lastUpdate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${
                      event.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                      event.status === 'in-progress' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <event.icon className={`h-5 w-5 ${
                        event.status === 'completed' ? 'text-emerald-600' :
                        event.status === 'in-progress' ? 'text-blue-600' :
                        'text-gray-400'
                      }`} />
                    </div>
                    {index < timeline.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-700 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {event.description}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auto Refresh Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Auto-refresh every 30 seconds
            </span>
          </label>
          {lastUpdate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Last update: {lastUpdate}
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/client/services">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="py-6 text-center">
                <FileText className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  View All Services
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage all your bookings
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/client/notifications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="py-6 text-center">
                <Bell className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Check Notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  View all system updates
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/contact">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="py-6 text-center">
                <MapPin className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Contact Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Need help? Get in touch
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
