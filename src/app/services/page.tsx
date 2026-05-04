'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Sparkles, Clock, MapPin, SlidersHorizontal, X, ChevronDown, Star, Tag, Percent, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/shared/navbar'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  startingPrice: number
  duration?: string
  coverage?: string
  locations?: string
  discountType?: string
  discountValue?: number
  featured?: boolean
  isCombined?: boolean
}

const CITIES = ['All', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia']
const DURATION_OPTIONS = ['All', '1-2 hours', '2-3 hours', '3-4 hours', '4+ hours']
const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A-Z' },
  { value: 'name-desc', label: 'Name: Z-A' },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const [showFilters, setShowFilters] = useState(false)

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services')
      if (!response.ok) {
        throw new Error('Failed to load services')
      }
      const data = await response.json()
      setServices(data)
    } catch (error) {
      setError('Unable to load services. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getFinalPrice = (startingPrice: number, discountType?: string, discountValue?: number) => {
    if (!discountType || discountType === 'NONE' || !discountValue) {
      return startingPrice
    }

    if (discountType === 'PERCENTAGE') {
      return startingPrice * (1 - discountValue / 100)
    } else if (discountType === 'FIXED_AMOUNT') {
      return startingPrice - discountValue
    }

    return startingPrice
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCity('All')
    setMinPrice('')
    setMaxPrice('')
    setSelectedDuration('All')
    setSortBy('default')
  }

  const getFilteredServices = () => {
    let filtered = [...services]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(service =>
        (service.name ?? '').toLowerCase().includes(query) ||
        (service.description ?? '').toLowerCase().includes(query)
      )
    }

    // City filter
    if (selectedCity !== 'All') {
      filtered = filtered.filter(service =>
        service.locations?.toLowerCase().includes(selectedCity.toLowerCase()) || false
      )
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter(service => service.startingPrice >= parseFloat(minPrice))
    }
    if (maxPrice) {
      filtered = filtered.filter(service => service.startingPrice <= parseFloat(maxPrice))
    }

    // Duration filter
    if (selectedDuration !== 'All') {
      filtered = filtered.filter(service => {
        if (!service.duration) return false
        // Simple duration matching - in production, you'd parse duration better
        return service.duration.toLowerCase().includes(selectedDuration.toLowerCase()) || false
      })
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) =>
          getFinalPrice(a.startingPrice, a.discountType, a.discountValue) -
          getFinalPrice(b.startingPrice, b.discountType, b.discountValue)
        )
        break
      case 'price-desc':
        filtered.sort((a, b) =>
          getFinalPrice(b.startingPrice, b.discountType, b.discountValue) -
          getFinalPrice(a.startingPrice, a.discountType, a.discountValue)
        )
        break
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
    }

    return filtered
  }

  const filteredServices = getFilteredServices()

  const getDiscountBadge = (service: Service) => {
    if (!service.discountType || service.discountType === 'NONE') return null

    if (service.discountType === 'PERCENTAGE') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200">
          <Percent className="h-3 w-3 mr-1" />
          {service.discountValue}% OFF
        </Badge>
      )
    } else if (service.discountType === 'FIXED_AMOUNT') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200">
          ${service.discountValue?.toFixed(2)} OFF
        </Badge>
      )
    }

    return null
  }

  const getFeaturedBadge = (featured: boolean) => {
    if (!featured) return null

    return (
      <Badge className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-200">
        <Star className="h-3 w-3 mr-1" />
        Featured
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Page Header with Search */}
      <section className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Our Cleaning Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Browse our professional cleaning solutions
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Filters */}
      <section className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>

            {/* Active Filters Badge */}
            {(selectedCity !== 'All' || minPrice || maxPrice || selectedDuration !== 'All' || sortBy !== 'default') && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{filteredServices.length}</span> services found
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white dark:bg-gray-950 border rounded-lg">
              <div className="grid md:grid-cols-4 gap-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Service name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* City/Location */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range ($)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full"
                    />
                    <span className="text-gray-500">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((duration) => (
                        <SelectItem key={duration} value={duration}>
                          {duration}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2 md:col-span-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear */}
                <div className="space-y-2 md:col-span-2">
                  <Label>&nbsp;</Label>
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
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

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading services...</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No services found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">{filteredServices.length}</span> services
                  {(selectedCity !== 'All' || minPrice || maxPrice || selectedDuration !== 'All' || sortBy !== 'default' || searchQuery) && (
                    <span> matching your filters</span>
                  )}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!selectedCity && !minPrice && !maxPrice && selectedDuration === 'All' && sortBy === 'default' && !searchQuery}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              {/* Services Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service) => {
                  const finalPrice = getFinalPrice(service.startingPrice || 0, service.discountType, service.discountValue)
                  const hasDiscount = service.discountType && service.discountType !== 'NONE' && (service.discountValue || 0) > 0
                  const discountAmount = (service.startingPrice || 0) - finalPrice

                  return (
                    <Card key={service.id} className={`hover:shadow-xl transition-shadow h-full flex flex-col ${service.featured ? 'ring-2 ring-purple-500' : ''}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl">{service.name}</CardTitle>
                          {getFeaturedBadge(service.featured || false)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getDiscountBadge(service)}
                          {hasDiscount && (
                            <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-200">
                              SAVE ${(discountAmount ?? 0).toFixed(2)}
                            </Badge>
                          )}
                          {service.isCombined && (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200">
                              <Tag className="h-3 w-3 mr-1" />
                              Combined
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <CardDescription className="mb-4 min-h-[80px]">
                          {service.description}
                        </CardDescription>

                        {/* Location */}
                        {service.locations && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{service.locations}</span>
                          </div>
                        )}

                        {/* Duration */}
                        {service.duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration}</span>
                          </div>
                        )}

                        {/* Price */}
                        <div className="mb-6">
                          {hasDiscount ? (
                            <div>
                              <p className="text-sm text-gray-500 line-through mb-1">
                                 ${(service.startingPrice || 0).toFixed(2)}
                              </p>
                              <div className="text-3xl font-bold text-emerald-600">
                                ${(finalPrice ?? 0).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-3xl font-bold text-emerald-600">
                               ${(service.startingPrice || 0).toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="space-y-3">
                          <Link href={`/services/${service.slug}`}>
                            <Button variant="outline" className="w-full">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/book-service?service=${service.slug}`}>
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                              Select Service
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Custom Service CTA */}
      <section className="py-16 bg-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Need Something Different?
          </h3>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
            Can't find the perfect service for your needs? Our team is ready to create a custom solution just for you.
          </p>
          <Link href="/custom-service">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-emerald-600">
              Request Custom Service
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
