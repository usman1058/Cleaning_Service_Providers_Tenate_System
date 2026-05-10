'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Calendar, Loader2, CheckCircle2, Image as ImageIcon, Eye } from 'lucide-react'
import Link from 'next/link'

interface LiveService {
  id: string
  serviceName: string
  vendorName: string
  clientName: string
  location: string
  status: string
  startedAt?: string
  scheduledDate: string
  images: { type: string; url: string }[]
}

export default function AdminMonitoringPage() {
  const [services, setServices] = useState<LiveService[]>([])
  const [loading, setLoading] = useState(true)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLiveServices()
    const interval = setInterval(fetchLiveServices, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchLiveServices = async () => {
    try {
      setError('')
      const response = await fetch('/api/admin/monitoring/live')
      if (!response.ok) {
        setError('Failed to load active services.')
        return
      }
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Failed to fetch live services:', error)
      setError('Failed to load active services.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to approve this service as complete?')) return

    try {
      setCompletingId(assignmentId)
      setError('')
      const response = await fetch(`/api/admin/monitoring/${assignmentId}/complete`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || 'Failed to approve completion.')
        return
      }
      setServices(services.filter(s => s.id !== assignmentId))
    } catch (error) {
      console.error('Failed to complete service:', error)
      setError('Failed to approve completion.')
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Service Monitoring
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Track ongoing services and review completion
        </p>
      </div>

      {/* Live Services */}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Active Services
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No services are currently in progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {services.map((service) => (
            <Card key={service.id} className="border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-emerald-600" />
                      {service.serviceName}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Vendor: {service.vendorName} | Client: {service.clientName}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={service.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                  >
                    {service.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{service.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>Scheduled: {new Date(service.scheduledDate).toLocaleString()}</span>
                    </div>
                  </div>

                  {service.startedAt && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>Started: {new Date(service.startedAt).toLocaleString()}</span>
                    </div>
                  )}

                  {/* Images */}
                  {(service.images ?? []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Service Images</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {(service.images ?? []).map((image, idx) => (
                          <div key={idx} className="relative group cursor-pointer">
                            <img
                              src={image.url}
                              alt={`${image.type} image`}
                              className="w-full h-24 object-cover rounded-lg border hover:border-emerald-500 transition-colors"
                            />
                            <Badge variant="outline" className="absolute top-1 left-1 bg-white/80 backdrop-blur text-[8px] px-1">
                              {image.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    <Link href={`/admin/monitoring/${service.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Full Details
                      </Button>
                    </Link>

                    {service.status === 'IN_PROGRESS' && (
                      <Button
                        onClick={() => handleComplete(service.id)}
                        disabled={completingId === service.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      >
                        {completingId === service.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        {completingId === service.id ? 'Approving...' : 'Approve Completion'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
