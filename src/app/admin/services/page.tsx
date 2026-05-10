'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Plus, Edit, Loader2, Search, X, Percent, Star, Folder, FolderOpen, Eye } from 'lucide-react'
import Link from 'next/link'
import { useCurrency } from '@/components/providers/currency-provider'

interface ServiceCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  isActive: boolean
  displayOrder: number
}

interface ServiceSubcategory {
  id: string
  name: string
  slug: string
  description?: string
  categoryId: string
  isActive: boolean
  displayOrder: number
}

interface Service {
  id: string
  name: string
  slug: string
  description: string
  startingPrice: number
  duration?: string
  locations?: string
  isActive: boolean
  createdAt: string
  isCombined?: boolean
  discountType?: string
  discountValue?: number
  featured?: boolean
  categoryId?: string
  subcategoryId?: string
  category?: ServiceCategory
  subcategory?: ServiceSubcategory
}

export default function AdminServicesPage() {
  const { convert, symbol } = useCurrency()
  const [isEditing, setIsEditing] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    longDescription: '',
    startingPrice: '',
    duration: '',
    coverage: '',
    locations: '',
    isCombined: false,
    discountType: 'NONE',
    discountValue: '',
    featured: false,
    categoryId: '',
    subcategoryId: '',
  })

  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/services'),
        fetch('/api/admin/service-categories'),
      ])

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServices(servicesData)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/admin/service-categories/${categoryId}/subcategories`)
      if (response.ok) {
        const data = await response.json()
        setSubcategories(data.subcategories || [])
      }
    } catch (error) {
      console.error('Failed to fetch subcategories:', error)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const parsedStartingPrice = Number.parseFloat(formData.startingPrice)
      const parsedDiscountValue = formData.discountType === 'NONE' ? 0 : Number.parseFloat(formData.discountValue)
      if (Number.isNaN(parsedStartingPrice) || parsedStartingPrice < 0) {
        setError('Starting price must be a valid non-negative number')
        return
      }
      if (Number.isNaN(parsedDiscountValue) || parsedDiscountValue < 0) {
        setError('Discount value must be a valid non-negative number')
        return
      }

      const response = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startingPrice: parsedStartingPrice,
          discountValue: parsedDiscountValue,
          categoryId: formData.categoryId || null,
          subcategoryId: formData.subcategoryId || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create service')
        return
      }

      const data = await response.json()
      setServices([...services, data])
      resetForm()
      setIsEditing(false)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!editingService) {
      setError('No service selected for update')
      return
    }
    setSubmitting(true)

    try {
      const parsedStartingPrice = Number.parseFloat(formData.startingPrice)
      const parsedDiscountValue = formData.discountType === 'NONE' ? 0 : Number.parseFloat(formData.discountValue)
      if (Number.isNaN(parsedStartingPrice) || parsedStartingPrice < 0) {
        setError('Starting price must be a valid non-negative number')
        return
      }
      if (Number.isNaN(parsedDiscountValue) || parsedDiscountValue < 0) {
        setError('Discount value must be a valid non-negative number')
        return
      }

      const response = await fetch(`/api/admin/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startingPrice: parsedStartingPrice,
          discountValue: parsedDiscountValue,
          categoryId: formData.categoryId || null,
          subcategoryId: formData.subcategoryId || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update service')
        return
      }

      const data = await response.json()
      setServices(services.map(s => s.id === data.id ? data : s))
      resetForm()
      setIsEditing(false)
      setEditingService(null)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      longDescription: '',
      startingPrice: '',
      duration: '',
      coverage: '',
      locations: '',
      isCombined: false,
      discountType: 'NONE',
      discountValue: '',
      featured: false,
      categoryId: '',
      subcategoryId: '',
    })
    setSubcategories([])
  }

  const startEdit = (service: Service) => {
    setEditingService(service)
    const categoryId = service.categoryId || ''
    setFormData({
      name: service.name,
      slug: service.slug,
      description: service.description,
      longDescription: '',
      startingPrice: service.startingPrice.toString(),
      duration: service.duration || '',
      coverage: '',
      locations: service.locations || '',
      isCombined: service.isCombined || false,
      discountType: service.discountType || 'NONE',
      discountValue: service.discountValue?.toString() || '',
      featured: service.featured || false,
      categoryId,
      subcategoryId: service.subcategoryId || '',
    })
    if (categoryId) {
      fetchSubcategories(categoryId)
    }
    setIsEditing(true)
  }

  const toggleServiceStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        setServices(services.map(s => s.id === id ? { ...s, isActive: !isActive } : s))
      }
    } catch (error) {
      console.error('Failed to toggle service:', error)
    }
  }

  const deleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setServices(services.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, categoryId, subcategoryId: '' })
    setSubcategories([])
    if (categoryId) {
      fetchSubcategories(categoryId)
    }
  }

  const getDiscountBadge = (service: Service) => {
    if (!service.discountType || service.discountType === 'NONE') return null

    if (service.discountType === 'PERCENTAGE') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200">
          {service.discountValue ?? 0}% OFF
        </Badge>
      )
    } else if (service.discountType === 'FIXED_AMOUNT') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200">
          {convert(service.discountValue ?? 0)} OFF
        </Badge>
      )
    }

    return null
  }

  const getFeaturedBadge = (featured: boolean | undefined) => {
    if (!featured) return null

    return (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200">
        <Star className="h-3 w-3 mr-1 inline" />
        Featured
      </Badge>
    )
  }

  const filteredServices = services.filter(service =>
    (service.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCategories = categories.filter(c => c.isActive)
  const activeSubcategories = subcategories.filter(s => s.isActive)

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-0">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Services Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage all cleaning services offered on platform
        </p>
      </div>

      {/* Add Service Button */}
      {!isEditing && (
        <Button
          onClick={() => setIsEditing(true)}
          className="mb-6 bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Service
        </Button>
      )}

      {isEditing && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingService ? 'Edit Service' : 'Create New Service'}
              </CardTitle>
              <CardDescription>
                {editingService ? 'Update service details' : 'Create a new cleaning service for the platform'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingService ? handleUpdate : handleCreate} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Basic Information
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., Residential Cleaning"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        name="slug"
                        placeholder="e.g., residential-cleaning"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Short Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description shown in service cards"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Long Description</Label>
                    <Textarea
                      id="longDescription"
                      name="longDescription"
                      placeholder="Detailed description shown in service detail page"
                      value={formData.longDescription}
                      onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                      rows={6}
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Category & Pricing
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              <Folder className="h-4 w-4 mr-2" />
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.categoryId && (
                      <div className="space-y-2">
                        <Label htmlFor="subcategory">Subcategory</Label>
                        <Select
                          value={formData.subcategoryId}
                          onValueChange={(value) => setFormData({ ...formData, subcategoryId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeSubcategories.map((subcategory) => (
                              <SelectItem key={subcategory.id} value={subcategory.id}>
                                <FolderOpen className="h-4 w-4 mr-2" />
                                {subcategory.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startingPrice">Starting Price ({symbol}) *</Label>
                      <Input
                        id="startingPrice"
                        name="startingPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="99.99"
                        value={formData.startingPrice}
                        onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        name="duration"
                        placeholder="e.g., 2-3 hours"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Service Details
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="coverage">Coverage Notes</Label>
                    <Textarea
                      id="coverage"
                      name="coverage"
                      placeholder="Coverage and service area information"
                      value={formData.coverage}
                      onChange={(e) => setFormData({ ...formData, coverage: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="locations">Service Locations</Label>
                    <Input
                      id="locations"
                      name="locations"
                      placeholder="e.g., New York, Los Angeles, Chicago"
                      value={formData.locations}
                      onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isCombined"
                        checked={formData.isCombined}
                        onChange={(e) => setFormData({ ...formData, isCombined: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isCombined" className="cursor-pointer">
                        Combined Service
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="featured" className="cursor-pointer">
                        Featured Service
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        {editingService ? 'Update Service' : 'Create Service'}
                      </>
                    )}
                  </Button>
                  {editingService && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setEditingService(null)
                        resetForm()
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {!isEditing && (
        <>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Services List */}
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No services found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {searchQuery ? 'Try a different search term' : 'No services created yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <Card key={service.id}>
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {service.name}
                          </h4>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {getDiscountBadge(service)}
                          {getFeaturedBadge(service.featured)}
                        </div>

                        {/* Category Info */}
                        {(service.category || service.subcategory) && (
                          <div className="flex items-center gap-2 mb-2">
                            {service.category && (
                              <Badge variant="outline" className="text-xs">
                                <Folder className="h-3 w-3 mr-1" />
                                {service.category.name}
                              </Badge>
                            )}
                            {service.subcategory && (
                              <Badge variant="outline" className="text-xs">
                                <FolderOpen className="h-3 w-3 mr-1" />
                                {service.subcategory.name}
                              </Badge>
                            )}
                          </div>
                        )}

                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {service.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          <span className="font-medium">Starting Price:</span> {convert(service.startingPrice ?? 0)}
                          {service.duration && ` | Duration: ${service.duration}`}
                        </p>
                        {service.locations && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Locations:</span> {service.locations}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/services/${service.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleServiceStatus(service.id, service.isActive)}
                        >
                          {service.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteService(service.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
