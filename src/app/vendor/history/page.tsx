'use client'

import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, Calendar, CheckCircle2, Clock, LogOut, Loader2, Users } from 'lucide-react'

interface CompletedJob {
  id: string
  serviceName: string
  location: string
  scheduledDate: string
  completedDate: string
  clientRating?: number
}

export default function VendorHistoryPage() {
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/vendor/history')
      if (!response.ok) {
        throw new Error('Failed to load history')
      }
      const data = await response.json()
      setCompletedJobs(data)
    } catch (error) {
      setError('Unable to load job history. Please try again.')
    } finally {
      setLoading(false)
    }
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
          <div className="flex items-center gap-4">
            <Link href="/vendor/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/vendor/assignments">
              <Button variant="ghost">Assigned</Button>
            </Link>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
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
            <Link href="/vendor/assignments" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              Assigned Services
            </Link>
            <Link href="/vendor/history" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
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
              <Button variant="outline" size="sm" onClick={fetchHistory} className="mt-2">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Job History
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your completed service assignments
          </p>
        </div>

        {/* History List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        ) : completedJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No completed jobs yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Once you complete services, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {completedJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {job.serviceName}
                        </h4>
                        <Badge variant="default">Completed</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Location: {job.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Scheduled: {new Date(job.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed: {new Date(job.completedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
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
