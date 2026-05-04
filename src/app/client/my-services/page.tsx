'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Service {
  id: string
  serviceName: string
  status: string
  scheduledDate?: string | null
  createdAt: string
  location: string
  preferredTime?: string
}

export default function MyServicesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/client/my-services')
    } else if (status === 'authenticated' && session?.user?.role !== 'CLIENT') {
      router.push('/')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user) {
      fetchServices()
    }
  }, [session])

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/client/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING_VERIFICATION: { label: 'Pending Verification', variant: 'secondary' },
      VERIFIED: { label: 'Verified', variant: 'default' },
      ASSIGNED: { label: 'Assigned', variant: 'default' },
      IN_PROGRESS: { label: 'In Progress', variant: 'outline' },
      COMPLETED: { label: 'Completed', variant: 'default' },
      CANCELLED: { label: 'Cancelled', variant: 'destructive' },
    }
    return statusMap[status] || { label: status, variant: 'default' }
  }

  const filteredServices = services.filter(service =>
    (service.serviceName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.location ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Green Services
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/client/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Services
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              View and track all your service requests
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Services List */}
          <div className="space-y-4">
            {filteredServices.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {searchQuery ? 'No services match your search.' : 'No services yet.'}
                  </p>
                  <Link href="/services">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Browse Services
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredServices.map((service) => {
                const statusBadge = getStatusBadge(service.status)
                return (
                  <Card key={service.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{service.serviceName}</CardTitle>
                          <CardDescription className="text-base">
                            {service.location}
                          </CardDescription>
                        </div>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                        {service.scheduledDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(service.scheduledDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {service.preferredTime && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{service.preferredTime}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Requested: {new Date(service.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Global Green Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
