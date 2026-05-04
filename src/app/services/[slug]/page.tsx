'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Clock, MapPin, CheckCircle2, ArrowLeft, Loader2, Star, Tag, Percent } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'

  const getDiscountedPrice = (startingPrice: number, discountType?: string, discountValue?: number) => {
    if (!discountType || discountType === 'NONE' || !discountValue || discountValue === 0) {
      return startingPrice
    }

    if (discountType === 'PERCENTAGE') {
      return startingPrice * (1 - discountValue / 100)
    } else if (discountType === 'FIXED_AMOUNT') {
      return startingPrice - discountValue
    }

    return startingPrice
  }

  const getDiscountBadge = (service: Service) => {
    if (!service.discountType || service.discountType === 'NONE') return null

    if (service.discountType === 'PERCENTAGE') {
      return (
        <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded">
          {service.discountValue}% OFF
        </span>
      )
    } else if (service.discountType === 'FIXED_AMOUNT') {
      return (
        <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded">
          ${service.discountValue?.toFixed(2)} OFF
        </span>
      )
    }

    return null
  }

  const getFinalPrice = (service: Service) => {
    const finalPrice = getDiscountedPrice(service.startingPrice, service.discountType, service.discountValue)
    const discountAmount = service.startingPrice - finalPrice

    return { finalPrice, discountAmount }
  }

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
  discountType?: string
  discountValue?: number
  featured?: boolean
  isCombined?: boolean
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (slug) {
      fetchService(slug)
    }
  }, [slug])

  const fetchService = async (serviceSlug: string) => {
    try {
      const response = await fetch(`/api/services/${serviceSlug}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
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

  const handleBookNow = () => {
    if (service) {
      router.push(`/book-service?service=${service.slug}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading service details...</p>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{error || 'Service not found'}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link href="/services">
              <Button variant="outline">Back to Services</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/services" className="inline-flex items-center text-emerald-600 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Link>
      </div>

      {/* Service Detail */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Service Header */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg p-8 md:p-12 mb-8 text-white">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold">{service.name}</h1>
              <div className="flex flex-wrap gap-2">
                {service.featured && (
                  <span className="px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Featured
                  </span>
                )}
                {getDiscountBadge(service)}
                {service.isCombined && (
                  <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Combined
                  </span>
                )}
              </div>
            </div>
            <p className="text-xl text-emerald-100 mb-6">{service.description}</p>

            <div className="flex flex-wrap gap-6 text-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{service.duration || 'Flexible'}</span>
              </div>
              {service.locations && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-emerald-100">{service.locations}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing and CTA */}
          <div className="bg-white dark:bg-gray-950 rounded-lg p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-300 mb-1">Starting from</p>
                {service.discountType && service.discountType !== 'NONE' && (service.discountValue || 0) > 0 ? (
                  <div>
                    <p className="text-xl text-gray-400 line-through">
                      ${(service.startingPrice || 0).toFixed(2)}
                    </p>
                    <div className="text-4xl font-bold text-emerald-600">
                      ${getDiscountedPrice(service.startingPrice || 0, service.discountType, service.discountValue).toFixed(2)}
                    </div>
                    {(() => {
                      const { discountAmount } = getFinalPrice(service)
                      return (
                        <p className="text-sm text-red-600 font-semibold mt-1">
                          SAVE ${(discountAmount ?? 0).toFixed(2)}
                        </p>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-emerald-600">
                    ${(service.startingPrice || 0).toFixed(2)}
                  </div>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleBookNow}
                className="bg-emerald-600 hover:bg-emerald-700 px-8 py-6 text-lg"
              >
                Proceed to Book
              </Button>
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-white dark:bg-gray-950 rounded-lg p-6 mb-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              What's Included
            </h2>
            <div className="space-y-3">
              {[
                'Professional cleaning equipment and eco-friendly products',
                'Thorough cleaning of all specified areas',
                'Quality inspection before completion',
                'Flexible scheduling options',
                'Dedicated support team',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Description */}
          {service.longDescription && (
            <div className="bg-white dark:bg-gray-950 rounded-lg p-6 mb-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About This Service
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {service.longDescription}
                </p>
              </div>
            </div>
          )}

          {/* Coverage Information */}
          {service.coverage && (
            <div className="bg-white dark:bg-gray-950 rounded-lg p-6 mb-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Service Coverage
              </h2>
              <p className="text-gray-700 dark:text-gray-300">{service.coverage}</p>
            </div>
          )}

          {/* Additional Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preparation Required</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Secure valuable items</li>
                  <li>• Clear access to areas to be cleaned</li>
                  <li>• Provide entry instructions</li>
                  <li>• Notify us of special requirements</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What Happens Next</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Submit your booking request</li>
                  <li>• Upload payment receipt</li>
                  <li>• Verification by our team</li>
                  <li>• Service scheduled and completed</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Additional CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleBookNow}
              className="bg-emerald-600 hover:bg-emerald-700 px-12 py-6 text-lg"
            >
              Book This Service Now
            </Button>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              No account required to book
            </p>
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
