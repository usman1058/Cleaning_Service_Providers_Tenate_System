'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, CheckCircle, AlertCircle, Calendar, MapPin, Loader2 } from 'lucide-react'
import Link from 'next/link'

type ServiceRequest = {
  id: string
  name: string
  status: string
  location: string
  preferredDate: string | null
  scheduledDate: string | null
  createdAt: string
}

const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string; icon: React.ReactNode }> = {
  COMPLETED: { variant: 'default', label: 'Completed', icon: <CheckCircle className="h-3 w-3" /> },
  IN_PROGRESS: { variant: 'default', label: 'In Progress', icon: <Clock className="h-3 w-3" /> },
  ASSIGNED: { variant: 'default', label: 'Assigned', icon: <AlertCircle className="h-3 w-3" /> },
  VERIFIED: { variant: 'default', label: 'Verified', icon: <CheckCircle className="h-3 w-3" /> },
  PENDING_VERIFICATION: { variant: 'secondary', label: 'Pending Verification', icon: <Clock className="h-3 w-3" /> },
  PENDING: { variant: 'secondary', label: 'Pending', icon: <Clock className="h-3 w-3" /> },
  CANCELLED: { variant: 'destructive', label: 'Cancelled', icon: <AlertCircle className="h-3 w-3" /> },
}

export default function ClientTrackingPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [services, setServices] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/client/tracking')
    }
    if (authStatus === 'authenticated') {
      fetchServices()
    }
  }, [authStatus, router])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/client/my-services')
      if (!response.ok) {
        throw new Error('Failed to load services')
      }
      const data = await response.json()
      setServices(data)
    } catch (error) {
      setError('Unable to load your services. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service) =>
    (service.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.location ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (authStatus === 'loading' || loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Track Your Services</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor the progress of your service requests
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by service name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchServices} className="mt-2">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-500">
              {searchTerm ? 'No services found matching your search.' : 'No service requests found.'}
            </div>
            {!searchTerm && (
              <Link href="/services">
                <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                  Browse Services
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {filteredServices.map((service) => {
            const config = statusConfig[service.status] || { variant: 'secondary' as const, label: service.status, icon: <Clock className="h-3 w-3" /> }
            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-lg md:text-xl truncate">{service.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{service.location}</span>
                      </CardDescription>
                    </div>
                    <Badge variant={config.variant} className="flex-shrink-0">
                      <span className="flex items-center gap-1">
                        {config.icon}
                        {config.label}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {service.scheduledDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Scheduled: {new Date(service.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    ) : service.preferredDate ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span>Preferred: {new Date(service.preferredDate).toLocaleDateString()}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>Requested: {new Date(service.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/client/tracking/${service.id}`}>
                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
