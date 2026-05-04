'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Users, Eye, Loader2, Search, CheckCircle2, XCircle } from 'lucide-react'

interface VendorApplication {
  id: string
  companyName: string
  ownerName: string
  email: string
  phone: string
  serviceLocations: string
  status: string
  createdAt: string
  adminRemarks?: string
}

interface VendorProfile {
  id: string
  companyName: string
  serviceLocations: string
  teamSize: number
  isActive: boolean
}

export default function AdminVendorsPage() {
  const [applications, setApplications] = useState<VendorApplication[]>([])
  const [profiles, setProfiles] = useState<VendorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    try {
      setError('')
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const [appsRes, profilesRes] = await Promise.all([
        fetch(`/api/admin/vendors/applications?${params}`),
        fetch('/api/admin/vendors/profiles'),
      ])

      if (appsRes.ok) {
        const appsData = await appsRes.json()
        setApplications(appsData)
      } else {
        setError('Failed to load vendor applications.')
      }

      if (profilesRes.ok) {
        const profilesData = await profilesRes.json()
        setProfiles(profilesData)
      } else {
        setError('Failed to load vendor profiles.')
      }
    } catch (error) {
      console.error('Failed to fetch vendor data:', error)
      setError('Failed to load vendor data.')
    } finally {
      setLoading(false)
    }
  }

  const handleApplicationReview = async (id: string, approved: boolean) => {
    if (!confirm(`Are you sure you want to ${approved ? 'approve' : 'reject'} this application?`)) return

    try {
      setReviewingId(id)
      const response = await fetch(`/api/admin/vendors/applications/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || 'Failed to review application.')
        return
      }
      setApplications(applications.filter(a => a.id !== id))
    } catch (error) {
      console.error('Failed to review application:', error)
      setError('Failed to review application.')
    } finally {
      setReviewingId(null)
    }
  }

  const toggleVendorStatus = async (id: string, isActive: boolean) => {
    try {
      setTogglingId(id)
      const response = await fetch(`/api/admin/vendors/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || 'Failed to update vendor status.')
        return
      }
      setProfiles(profiles.map(p => p.id === id ? { ...p, isActive: !isActive } : p))
    } catch (error) {
      console.error('Failed to toggle vendor:', error)
      setError('Failed to update vendor status.')
    } finally {
      setTogglingId(null)
    }
  }

  const filteredApplications = applications.filter(app =>
    (app.companyName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.ownerName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredProfiles = profiles.filter(p =>
    (p.companyName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

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
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vendor Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Review applications and manage approved vendors
        </p>
      </div>

      {/* Search */}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Applications */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Applications</CardTitle>
              <CardDescription>Review new vendor applications</CardDescription>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md px-3 py-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300 py-8">
              No pending applications
            </p>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                          {app.companyName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          Owner: {app.ownerName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          Contact: {app.email} | {app.phone}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Locations: {app.serviceLocations}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Badge variant={app.status === 'PENDING' ? 'secondary' : 'default'}>
                          {app.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {app.status === 'PENDING' && (
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <Button
                          onClick={() => handleApplicationReview(app.id, true)}
                          disabled={reviewingId === app.id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {reviewingId === app.id ? 'Processing...' : 'Approve Application'}
                        </Button>
                        <Button
                          onClick={() => handleApplicationReview(app.id, false)}
                          disabled={reviewingId === app.id}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {reviewingId === app.id ? 'Processing...' : 'Reject Application'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Vendors */}
      <Card>
        <CardHeader>
          <CardTitle>Approved Vendors</CardTitle>
          <CardDescription>Manage active vendor accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProfiles.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300 py-8">
              No approved vendors yet
            </p>
          ) : (
            <div className="space-y-4">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id}>
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {profile.companyName}
                          </h4>
                          <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                            {profile.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Team Size: {profile.teamSize} | Locations: {profile.serviceLocations}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        disabled={togglingId === profile.id}
                        onClick={() => toggleVendorStatus(profile.id, profile.isActive)}
                      >
                        {togglingId === profile.id ? 'Updating...' : profile.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
