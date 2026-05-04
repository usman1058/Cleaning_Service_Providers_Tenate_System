'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Calendar, MapPin, Clock, CheckCircle2, Loader2, ArrowLeft, X, Navigation } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'

interface Service {
  id: string
  name: string
  slug: string
  description: string
  startingPrice: number
  duration?: string
}

interface Location {
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
}

function BookServicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceSlug = searchParams.get('service')

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [location, setLocation] = useState<Location>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [showMap, setShowMap] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    preferredDate: '',
    preferredTime: '',
    additionalNotes: '',
  })

  useEffect(() => {
    if (serviceSlug) {
      fetchService(serviceSlug)
    }
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [serviceSlug])

  const fetchService = async (slug: string) => {
    try {
      const response = await fetch(`/api/services/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
      }
    } catch (error) {
      console.error('Failed to fetch service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseMyLocation = async () => {
    if (!userLocation) {
      setError('Unable to get your current location. Please enable location services.')
      return
    }

    setMapLoading(true)
    try {
      const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY
      if (!mapsKey) {
        setError('Map service is not configured. Please enter your address manually.')
        return
      }
      // Reverse geocode (convert coordinates to address)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${userLocation.lat},${userLocation.lng}&key=${mapsKey}`
      )

      if (!response.ok) {
        setError('Unable to resolve your location right now. Please enter it manually.')
        return
      }

      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const addressComponents = data.results[0].address_components
        const address = data.results[0].formatted_address

        setLocation({
          address,
          city: extractCity(addressComponents),
          state: extractState(addressComponents),
          zipCode: extractZipCode(addressComponents),
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        })

        setFormData(prev => ({
          ...prev,
          location: address,
        }))

        setShowMap(false)
      } else {
        setError('No address found for your current location. Please enter it manually.')
      }
    } catch (error) {
      console.error('Failed to get location:', error)
      setError('Failed to get your current location. Please enter it manually.')
    } finally {
      setMapLoading(false)
    }
  }

  const handleSearchMap = async () => {
    if (!location.city) {
      setError('Please enter at least a city to search on map.')
      return
    }

    const searchQuery = `${location.address}, ${location.city}, ${location.state}`
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank')
  }

  const extractCity = (components: any[]) => {
    const city = components.find(c =>
      c.types.includes('locality') ||
      c.types.includes('administrative_area_level_2')
    )
    return city?.long_name || ''
  }

  const extractState = (components: any[]) => {
    const state = components.find(c =>
      c.types.includes('administrative_area_level_1')
    )
    return state?.short_name || ''
  }

  const extractZipCode = (components: any[]) => {
    const zip = components.find(c => c.types.includes('postal_code'))
    return zip?.long_name || ''
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (name === 'location') {
      setLocation({ ...location, address: value })
      setFormData({ ...formData, location: value })
    }
  }

  const handleLocationChange = (field: string, value: string) => {
    const nextLocation = { ...location, [field]: value }
    setLocation(nextLocation)

    const fullAddress = [nextLocation.address, nextLocation.city, nextLocation.state, nextLocation.zipCode]
      .filter(part => part.trim())
      .join(', ')

    setFormData(prev => ({ ...prev, location: fullAddress }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          serviceId: service?.id,
          location: {
            ...location,
            latitude: userLocation?.lat,
            longitude: userLocation?.lng,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to submit request')
        return
      }

      setSuccess(true)
      // Redirect to booking confirmation
      setTimeout(() => {
        router.push(`/booking-confirmation?service=${service?.slug || 'service'}&booking=${data.id}`)
      }, 2000)
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Service Request Submitted!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your request has been received. Redirecting to payment receipt upload...
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mx-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link href={service ? `/services/${service.slug}` : '/services'} className="inline-flex items-center text-emerald-600 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Service Info Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Service Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {service ? (
                    <>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration || 'Flexible'}</span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600">
                        ${(service.startingPrice ?? 0).toFixed(2)}
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                          <Navigation className="h-4 w-4 inline mr-1" />
                          Exact address helps our team arrive on time
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No service selected
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Booking</CardTitle>
                  <CardDescription>
                    Fill in your details and exact location to submit a service request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Personal Information
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location - UPGRADED */}
                    <div className="space-y-4 p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-emerald-600" />
                          Service Location *
                        </h3>
                        <div className="flex gap-2">
                          {userLocation && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleUseMyLocation}
                              disabled={mapLoading}
                              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                            >
                              {mapLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                  Getting Location...
                                </>
                              ) : (
                                <>
                                  <Navigation className="h-4 w-4 mr-1" />
                                  Use My Location
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMap(!showMap)}
                          >
                            {showMap ? <X className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                            {showMap ? 'Hide Map' : 'Show Map'}
                          </Button>
                        </div>
                      </div>

                      {showMap && (
                        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Option 1: Use your current location (button above)
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              Option 2: Search location on Google Maps and paste address below
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleSearchMap}
                              disabled={mapLoading}
                              className="w-full"
                            >
                              {mapLoading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Loading Maps...
                                </>
                              ) : (
                                <>
                                  <MapPin className="h-4 w-4 mr-2" />
                                  Open Google Maps to Search Location
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="relative h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <iframe
                              src={`https://www.google.com/maps?q=${encodeURIComponent(location.address + ', ' + location.city + ', ' + location.state)}&output=embed`}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="address">Street Address *</Label>
                          <Input
                            id="address"
                            placeholder="123 Main Street, Apt 4B"
                            value={location.address}
                            onChange={(e) => handleLocationChange('address', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            placeholder="New York"
                            value={location.city}
                            onChange={(e) => handleLocationChange('city', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            placeholder="NY"
                            value={location.state}
                            onChange={(e) => handleLocationChange('state', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            placeholder="10001"
                            value={location.zipCode}
                            onChange={(e) => handleLocationChange('zipCode', e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Location preview */}
                      {(location.address || location.city) && (
                        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <span className="font-medium">Location Preview:</span>
                          </p>
                          <p className="text-sm font-medium text-emerald-600">
                            {[location.address, location.city, location.state, location.zipCode]
                              .filter(part => part.trim())
                              .join(', ')}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Service Details */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Service Details
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="preferredDate">Preferred Date *</Label>
                          <Input
                            id="preferredDate"
                            name="preferredDate"
                            type="date"
                            value={formData.preferredDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="preferredTime">Preferred Time *</Label>
                          <Input
                            id="preferredTime"
                            name="preferredTime"
                            type="time"
                            value={formData.preferredTime}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="additionalNotes">Additional Notes</Label>
                      <Textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        placeholder="Any special instructions or requirements..."
                        value={formData.additionalNotes}
                        onChange={handleInputChange}
                        rows={4}
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        Include gate code, pet information, or other important details
                      </p>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col gap-4">
                      <Button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-lg"
                        disabled={submitting || !service}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Service Request'
                        )}
                      </Button>

                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        <span className="font-medium">Location Upgrade:</span> Use your current location button or search on Google Maps to ensure our cleaning team arrives on time!
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
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

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>}>
      <BookServicePage />
    </Suspense>
  )
}
