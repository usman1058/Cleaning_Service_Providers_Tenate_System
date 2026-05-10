'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Loader2, 
  Check, 
  CheckCircle2, 
  UserPlus, 
  Search,
  Filter,
  AlertCircle,
  Briefcase
} from 'lucide-react'
import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout'
import { useCurrency } from '@/components/providers/currency-provider'
import { Input } from '@/components/ui/input'

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
  price: number
}

interface Vendor {
  id: string
  userId: string
  companyName: string
  serviceLocations: string
  isActive: boolean
}

export default function AdminAssignmentsPage() {
  const { convert } = useCurrency()
  const [services, setServices] = useState<Service[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredServices = services.filter(s => 
    s.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-0">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Service Assignments</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Assign verified service requests to available and approved vendors.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium uppercase tracking-wider">Unassigned Requests</p>
              <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">{services.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by service, client or location..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {filteredServices.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-20 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Pending Assignments</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                All verified service requests have been assigned. New requests will appear here once verified.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{service.serviceName}</h3>
                        <p className="text-sm text-emerald-600 font-medium">Value: {convert(service.price)}</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 uppercase text-[10px]">
                        Verified
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Location</p>
                          <p className="text-sm">{service.location}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Requested Date</p>
                          <p className="text-sm">
                            {service.preferredDate ? new Date(service.preferredDate).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Time Slot</p>
                          <p className="text-sm">{service.preferredTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Client</p>
                          <p className="text-sm font-medium">{service.clientName}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-900/40 p-6 flex flex-col justify-center gap-4">
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase text-gray-500 tracking-wider">Assign Vendor</p>
                      <Select 
                        onValueChange={(val) => setAssignments({ ...assignments, [service.id]: val })}
                        value={assignments[service.id] || ''}
                      >
                        <SelectTrigger className="bg-white dark:bg-gray-800 h-11">
                          <SelectValue placeholder="Select a vendor..." />
                        </SelectTrigger>
                        <SelectContent>
                          {vendors.length === 0 ? (
                            <SelectItem value="none" disabled>No vendors available</SelectItem>
                          ) : (
                            vendors.map((vendor) => (
                              <SelectItem key={vendor.userId} value={vendor.userId}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{vendor.companyName}</span>
                                  <span className="text-[10px] text-gray-500">{vendor.serviceLocations || 'All Regions'} • {vendor.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700" 
                      onClick={() => handleAssign(service.id, assignments[service.id])}
                      disabled={!assignments[service.id] || assigningId === service.id}
                    >
                      {assigningId === service.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Confirm Assignment
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
    </div>
  )
}
