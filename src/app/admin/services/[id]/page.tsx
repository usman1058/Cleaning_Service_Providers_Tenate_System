'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileText, Edit, Loader2, Save, Trash2, CheckCircle2, X, TrendingUp, Users, Clock, Star, DollarSign, Calendar, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout'
import { useCurrency } from '@/components/providers/currency-provider'
import { OverviewChart } from '@/components/admin/overview-chart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Camera, Image as ImageIcon } from 'lucide-react'

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
  createdAt: string
  updatedAt: string
  vendors?: any[]
  history?: any[]
  stats?: {
    totalRequests: number
    completedRequests: number
    totalRevenue: number
    activeAssignments: number
  }
  revenueTrend?: any[]
  statusDistribution?: any[]
}

export default function AdminServiceDetail() {
  const params = useParams()
  const router = useRouter()
  const serviceId = params.id as string

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    startingPrice: '',
    duration: '',
    isActive: true,
  })

  const { convert } = useCurrency()

  useEffect(() => {
    if (serviceId) {
      fetchService()
    }
  }, [serviceId])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
        setFormData({
          name: data.name,
          description: data.description,
          longDescription: data.longDescription || '',
          startingPrice: data.startingPrice.toString(),
          duration: data.duration || '',
          isActive: data.isActive,
        })
      } else {
        setError('Service not found')
      }
    } catch (error) {
      console.error('Failed to fetch service:', error)
      setError('Failed to load service')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess('Service updated successfully')
        fetchService() // Refresh data
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update service')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure? This will permanently delete the service.')) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/services')
      } else {
        setError('Failed to delete service')
      }
    } catch (error) {
      setError('An error occurred.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="p-0">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {service?.name || 'Service Details'}
              </h1>
              {service && (
                <Badge variant={service.isActive ? 'default' : 'secondary'}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage service configuration, view vendor performance, and tracking history.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/admin/services')}>
              Back to Services
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Service
            </Button>
          </div>
        </div>

        {service && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Requests</span>
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold">{service.stats?.totalRequests || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold">{convert(service.stats?.totalRevenue || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">From completed jobs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Active Jobs</span>
                  <Clock className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold">{service.stats?.activeAssignments || 0}</div>
                <div className="mt-2">
                   <Progress value={service.stats?.totalRequests ? ((service.stats.activeAssignments / service.stats.totalRequests) * 100) : 0} className="h-1" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Completion Rate</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold">
                  {service.stats?.totalRequests ? Math.round((service.stats.completedRequests / service.stats.totalRequests) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">Success percentage</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 border">
            <TabsTrigger value="overview">Overview & Edit</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="history">Assignment History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Service Configuration</CardTitle>
                <CardDescription>Update the basic details and pricing for this service.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                  )}
                  {success && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <p className="text-emerald-800 dark:text-emerald-200">{success}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Service Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g., Deep Kitchen Cleaning"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startingPrice">Starting Price (USD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="startingPrice"
                            type="number"
                            className="pl-9"
                            value={formData.startingPrice}
                            onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Estimated Duration</Label>
                        <Input
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          placeholder="e.g., 2-3 hours"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600"
                        />
                        <Label htmlFor="isActive">Service is active and visible to clients</Label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">Short Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Brief summary for service cards..."
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="longDescription">Full Description</Label>
                        <Textarea
                          id="longDescription"
                          value={formData.longDescription}
                          onChange={(e) => handleInputChange('longDescription', e.target.value)}
                          placeholder="Detailed information for service page..."
                          rows={6}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card>
              <CardHeader>
                <CardTitle>Top Vendors for this Service</CardTitle>
                <CardDescription>Vendors who have been assigned to this service recently.</CardDescription>
              </CardHeader>
              <CardContent>
                {!service?.vendors || service.vendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No vendors have performed this service yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor / Company</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Assigned</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {service.vendors.map((vendor: any) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div className="font-medium">{vendor.companyName}</div>
                            <div className="text-xs text-muted-foreground">{vendor.name}</div>
                          </TableCell>
                          <TableCell>{vendor.email}</TableCell>
                          <TableCell>
                            <Badge variant={vendor.status === 'APPROVED' ? 'default' : 'secondary'}>
                              {vendor.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(vendor.lastAssigned).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/vendors/${vendor.id}`}>View Profile</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Assignment History</CardTitle>
                <CardDescription>Detailed log of all bookings for this service.</CardDescription>
              </CardHeader>
              <CardContent>
                {!service?.history || service.history.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assignment history found.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Proof</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {service.history.map((req: any) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div className="font-medium">{req.user?.name}</div>
                            <div className="text-xs text-muted-foreground">{req.email}</div>
                          </TableCell>
                          <TableCell>
                            {req.assignment?.vendor?.vendorProfile?.companyName || 'Not Assigned'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              req.status === 'COMPLETED' ? 'default' :
                              req.status === 'CANCELLED' ? 'destructive' :
                              'secondary'
                            }>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {req.assignment?.beforeImage ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 px-2 text-emerald-600">
                                    <Camera className="h-4 w-4 mr-1" />
                                    View Proof
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Completion Proof - {req.user?.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">Before Photo</p>
                                      <div className="aspect-video relative rounded-lg overflow-hidden border bg-muted">
                                        <img 
                                          src={req.assignment.beforeImage} 
                                          alt="Before" 
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground">After Photo</p>
                                      <div className="aspect-video relative rounded-lg overflow-hidden border bg-muted">
                                        <img 
                                          src={req.assignment.afterImage} 
                                          alt="After" 
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  {req.assignment.vendorNotes && (
                                    <div className="mt-4 p-3 bg-muted rounded-lg">
                                      <p className="text-sm font-medium mb-1">Vendor Notes:</p>
                                      <p className="text-sm text-muted-foreground">{req.assignment.vendorNotes}</p>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No Proof</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {convert(service.startingPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OverviewChart 
                data={service?.revenueTrend || []} 
                title="Revenue Trend" 
                description="Monthly revenue for this specific service over the last 6 months"
              />
              <OverviewChart 
                data={service?.statusDistribution || []} 
                title="Status Distribution" 
                description="Distribution of all requests by their current status"
                color="#3b82f6"
              />
            </div>
          </TabsContent>
        </Tabs>
    </div>
  )
}
