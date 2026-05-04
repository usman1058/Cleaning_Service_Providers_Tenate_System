'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, Calendar, CheckCircle2, Loader2, ArrowRight, Users } from 'lucide-react'

interface AssignedService {
  id: string
  serviceName: string
  location: string
  preferredDate: string
  preferredTime: string
  status: string
}

export default function VendorAssignmentsPage() {
  const { data: session } = useSession()
  const [assignments, setAssignments] = useState<AssignedService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchAssignments()
    }
  }, [session])

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/vendor/assignments')
      if (!response.ok) {
        throw new Error('Failed to load assignments')
      }
      const data = await response.json()
      setAssignments(data)
    } catch (error) {
      setError('Unable to load assignments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      ASSIGNED: { variant: 'secondary', label: 'Assigned' },
      ACCEPTED: { variant: 'default', label: 'Accepted' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'default', label: 'Completed' },
    }

    const config = statusConfig[status] || { variant: 'secondary', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
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
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-950 border-b overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/vendor/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/vendor/assignments" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              Assigned Services
            </Link>
            <Link href="/vendor/history" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4" />
              Job History
            </Link>
            <Link href="/vendor/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Users className="h-4 w-4" />
              Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchAssignments} className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Assigned Services
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage your assigned jobs
          </p>
        </div>

        {/* Assignments List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Assignments Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Waiting for admin to assign services to you.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                        {assignment.serviceName}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Location: {assignment.location}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Preferred: {new Date(assignment.preferredDate).toLocaleDateString()} at {assignment.preferredTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      {getStatusBadge(assignment.status)}
                      <Link href={`/vendor/execution/${assignment.id}`}>
                        <Button variant="outline" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
