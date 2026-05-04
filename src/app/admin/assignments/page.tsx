'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, MapPin, Clock, Loader2, Check, CheckCircle2 } from 'lucide-react'

interface Service {
  id: string
  serviceName: string
  clientName: string
  clientEmail: string
  location: string
  preferredDate: string
  preferredTime: string
  status: string
  createdAt: string
}

interface Vendor {
  id: string
  companyName: string
  serviceLocations: string
  isActive: boolean
}

export default function AdminAssignmentsPage() {
  const [services, setServices] = useState<Service[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [assigningId, setAssigningId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setError('')
      const [servicesRes, vendorsRes] = await Promise.all([
        fetch('/api/admin/assignments/pending'),
        fetch('/api/admin/vendors/profiles'),
      ])

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      } else {
        setError('Failed to load pending assignments.')
      }

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json()
        setVendors(vendorsData)
      } else {
        setError('Failed to load vendors.')
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load assignment data.')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (serviceId: string, vendorId: string) => {
    if (!vendorId) return

    try {
      setAssigningId(serviceId)
      const response = await fetch(`/api/admin/assignments/${serviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || 'Failed to assign service.')
        return
      }
      setServices(services.filter(s => s.id !== serviceId))
      setAssignments({ ...assignments, [serviceId]: vendorId })
    } catch (error) {
      console.error('Failed to assign service:', error)
      setError('Failed to assign service.')
    } finally {
      setAssigningId(null)
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Service Assignments
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Assign verified services to approved vendors
        </p>
      </div>

      {/* Services List */}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Assignments
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              All verified services have been assigned to vendors.
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
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      {service.serviceName}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {service.clientName} - {service.clientEmail}
                    </CardDescription>
                  </div>
                  <Badge>Verified</Badge>
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
                      <Clock className="h-4 w-4" />
                      <span>{new Date(service.preferredDate).toLocaleDateString()} at {service.preferredTime}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Assign Vendor</label>
                    <Select
                      value={assignments[service.id] || ''}
                      onValueChange={(value) => setAssignments({ ...assignments, [service.id]: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors
                          .filter(v => v.isActive)
                          .map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.companyName} ({vendor.serviceLocations})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => handleAssign(service.id, assignments[service.id])}
                    disabled={!assignments[service.id] || assigningId === service.id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {assigningId === service.id ? 'Assigning...' : 'Assign Service'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
