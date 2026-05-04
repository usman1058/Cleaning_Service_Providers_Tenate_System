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
import { Sparkles, Home, FileText, ArrowLeft, Save, Loader2, AlertTriangle, CheckCircle2, Calendar, Clock, TrendingUp, X } from 'lucide-react'

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
}

export default function AdminServiceDetail() {
  const params = useParams()
  const router = useRouter()
  const serviceSlug = params.id as string

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
    coverage: '',
    locations: '',
    isActive: true,
  })

  useEffect(() => {
    if (serviceSlug) {
      fetchService()
    }
  }, [serviceSlug])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/admin/services/${serviceSlug}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
        setFormData({
          name: data.name,
          description: data.description,
          longDescription: data.longDescription || '',
          startingPrice: data.startingPrice.toString(),
          duration: data.duration || '',
          coverage: data.coverage || '',
          locations: data.locations || '',
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

    if (!service) return

    try {
      const response = await fetch(`/api/admin/services/${service.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess('Service updated successfully')
        setTimeout(() => {
          router.push('/admin/services')
        }, 1500)
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
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    if (!service) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/services/${service.slug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSuccess('Service deleted successfully')
        setTimeout(() => {
          router.push('/admin/services')
        }, 1500)
      } else {
        setError('Failed to delete service')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
        <div className="container mx-auto px-4 py-4">
          <Link href="/admin/dashboard">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Green Services
              </h1>
            </div>
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
            <Link href="/admin/services" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
              <FileText className="h-4 w-4" />
              Services
            </Link>
            <Link href="/admin/clients" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              Users
            </Link>
            <Link href="/admin/receipts" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4" />
              Receipt Verification
            </Link>
            <Link href="/admin/vendors" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              Users
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
        <div className="max-w-4xl mx-auto">
          <Link href="/admin/services" className="inline-flex items-center text-emerald-600 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Link>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading service details...</p>
            </div>
          ) : service ? (
            <>
              {/* Messages */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 mb-6">
                  <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Service Info */}
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle>Edit Service</CardTitle>
                      <CardDescription>
                        Service ID: {service.id.slice(0, 8).toUpperCase()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        service.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Created: {new Date(service.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Service Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="e.g., Residential Cleaning"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug">Service Slug</Label>
                        <Input
                          id="slug"
                          value={service.slug}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Auto-generated from name. Cannot be changed.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Short Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description shown in service cards"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longDescription">Long Description</Label>
                      <Textarea
                        id="longDescription"
                        value={formData.longDescription}
                        onChange={(e) => handleInputChange('longDescription', e.target.value)}
                        placeholder="Detailed description shown in service detail page"
                        rows={6}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="startingPrice">Starting Price ($) *</Label>
                        <Input
                          id="startingPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.startingPrice}
                          onChange={(e) => handleInputChange('startingPrice', parseFloat(e.target.value))}
                          placeholder="99.99"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Input
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => handleInputChange('duration', e.target.value)}
                          placeholder="e.g., 2-3 hours"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverage">Coverage Notes</Label>
                      <Textarea
                        id="coverage"
                        value={formData.coverage}
                        onChange={(e) => handleInputChange('coverage', e.target.value)}
                        placeholder="Coverage and service area information"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locations">Service Locations</Label>
                      <Input
                        id="locations"
                        value={formData.locations}
                        onChange={(e) => handleInputChange('locations', e.target.value)}
                        placeholder="e.g., New York, Los Angeles, Chicago"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Comma-separated list of cities where this service is available
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isActive" className="cursor-pointer">
                        Service is active and visible to users
                      </Label>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  onClick={() => router.push('/admin/services')}
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              {/* Delete Service */}
              <Card className="mt-6 border-red-200 dark:border-red-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Deleting a service will remove it from all client-facing pages.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    This action cannot be undone. Make sure you want to permanently delete this service.
                  </p>
                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    disabled={saving}
                    className="w-full sm:w-auto"
                  >
                    Delete Service
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Service Not Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The service you're looking for doesn't exist or has been deleted.
                </p>
                <Link href="/admin/services">
                  <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    Back to Services
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
