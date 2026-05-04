'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Home, FileText, Clock, CheckCircle2, AlertCircle, Calendar, MapPin, Loader2, User } from 'lucide-react'

interface ServiceRequest {
  id: string
  serviceName: string
  status: string
  scheduledDate?: string
  preferredDate: string
  preferredTime: string
  location: string
  createdAt: string
  receiptStatus?: string
}

export default function ClientServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    if (session?.user) {
      fetchServices(filter)
    }
  }, [session, filter])

  const fetchServices = async (statusFilter: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/client/services?${params}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
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
            <Link href="/client/services" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium">
              <FileText className="h-4 w-4" />
              My Services
            </Link>
            <Link href="/client/receipts" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <Clock className="h-4 w-4" />
              Receipts & Payments
            </Link>
            <Link href="/client/notifications" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Notifications
            </Link>
            <Link href="/client/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <User className="h-4 w-4" />
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Services
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Track and manage all your service requests
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="PENDING_VERIFICATION">Pending Verification</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Services List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No services found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {filter === 'all'
                  ? 'You have not requested any services yet.'
                  : `No services with status "${filter}".`}
              </p>
              {filter === 'all' && (
                <Link href="/services">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Browse Services
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {service.serviceName}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <Calendar className="h-4 w-4" />
                            <span>Preferred: {new Date(service.preferredDate).toLocaleDateString()} at {service.preferredTime}</span>
                          </div>
                          {service.scheduledDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <Clock className="h-4 w-4" />
                              <span>Scheduled: {new Date(service.scheduledDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4" />
                            <span>{service.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(service.status)}
                          {service.receiptStatus === 'PENDING' && (
                            <Badge variant="outline" className="text-amber-600">
                              Receipt Pending
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/client/tracking/${service.id}`}>
                        <Button variant="outline" size="sm">
                          Track
                        </Button>
                      </Link>
                      {service.status === 'PENDING_VERIFICATION' && !service.receiptStatus && (
                        <Link href={`/receipt-upload?request=${service.id}`}>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            Upload Receipt
                          </Button>
                        </Link>
                      )}
                    </div>
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
