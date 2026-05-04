'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, FileText, Bell, User, Calendar, MapPin, Clock, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Receipt } from 'lucide-react'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  longDescription?: string
  startingPrice: number
  duration?: string
  coverage?: string
  locations?: string
  isActive: boolean
}

interface ServiceRequest {
  id: string
  serviceName: string
  status: string
  scheduledDate?: string
  preferredDate: string
  preferredTime: string
  location: string
  additionalNotes?: string
  createdAt: string
  updatedAt: string
  receiptStatus?: string
}

export default function ClientServiceDetail() {
  const params = useParams()
  const router = useRouter()
  const serviceSlug = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (serviceSlug) {
      fetchServiceData()
    }
  }, [serviceSlug])

  const fetchServiceData = async () => {
    try {
      const [serviceRes, requestsRes] = await Promise.all([
        fetch(`/api/services/${serviceSlug}`),
        fetch(`/api/client/my-services/${serviceSlug}`),
      ])

      if (serviceRes.ok) {
        const serviceData = await serviceRes.json()
        setService(serviceData)
      }

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json()
        setRequests(requestsData)
      }
    } catch (error) {
      console.error('Failed to fetch service data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; color: string }> = {
      PENDING_VERIFICATION: { variant: 'secondary', label: 'Pending Verification', color: 'gray' },
      VERIFIED: { variant: 'default', label: 'Verified', color: 'blue' },
      ASSIGNED: { variant: 'default', label: 'Assigned', color: 'purple' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress', color: 'orange' },
      COMPLETED: { variant: 'default', label: 'Completed', color: 'green' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled', color: 'red' },
    }

    const config = statusConfig[status] || statusConfig.PENDING_VERIFICATION
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

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

      <nav className="bg-white dark:bg-gray-950 border-b overflow-x-auto">
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
            <Link href="/client/receipts" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Clock className="h-4 w-4" />
              Receipts & Payments
            </Link>
            <Link href="/client/notifications" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Bell className="h-4 w-4" />
              Notifications
            </Link>
            <Link href="/client/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <User className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-8">
        <Link href="/client/services" className="inline-flex items-center text-emerald-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Services
        </Link>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading service details...</p>
          </div>
        ) : !service ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Service Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The service you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/client/services">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Service Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{service.name}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    ${service.startingPrice.toFixed(2)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {service.longDescription && (
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      About This Service
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {service.longDescription}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {service.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Estimated Duration</p>
                        <p className="font-medium text-gray-900 dark:text-white">{service.duration}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Starting Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                    ${(service.startingPrice ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {service.coverage && (
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Coverage Details
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">{service.coverage}</p>
                  </div>
                )}

                {service.locations && (
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                      Service Locations
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300">{service.locations}</p>
                  </div>
                )}

                <div className="pt-6 border-t">
                  <Link href={`/book-service?service=${service.slug}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg">
                      Book This Service
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* My Requests for This Service */}
            {requests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Requests for {service.name}</CardTitle>
                  <CardDescription>
                    Track your requests for this specific service
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(requests ?? []).map((request) => (
                      <div key={request.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                Request #{request.id.slice(0, 8).toUpperCase()}
                              </p>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Made on {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Preferred Date</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(request.preferredDate).toLocaleDateString()} at {request.preferredTime}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {request.location}
                            </p>
                          </div>
                        </div>

                        {request.scheduledDate && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              <span className="font-medium">Scheduled:</span> {new Date(request.scheduledDate).toLocaleString()}
                            </p>
                          </div>
                        )}

                        {request.receiptStatus === 'PENDING' && request.status === 'PENDING_VERIFICATION' && (
                          <Link href={`/receipt-upload?request=${request.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              Upload Receipt
                            </Button>
                          </Link>
                        )}

                        <Link href={`/client/tracking/${request.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {requests.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Requests Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You haven't requested this service yet. Book it now to get started.
                  </p>
                  <Link href={`/book-service?service=${service.slug}`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Book {service.name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
