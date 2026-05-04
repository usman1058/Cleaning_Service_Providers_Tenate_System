'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Job {
  id: string
  serviceName: string
  location: string
  preferredDate: string
  preferredTime: string
  status: string
  clientName: string
}

export default function VendorJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchJobs()
  }, [filter])

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }
      const response = await fetch(`/api/vendor/assignments?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'secondary' | 'default' | 'destructive'; label: string }> = {
      ASSIGNED: { variant: 'secondary', label: 'Assigned' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'default', label: 'Completed' },
      CANCELLED: { variant: 'destructive', label: 'Cancelled' },
    }
    const c = config[status] || { variant: 'secondary', label: status }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Jobs</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your assigned jobs</p>
      </div>

      <div className="mb-6 flex gap-2">
        {['all', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No jobs found</h3>
            <p className="text-gray-600 dark:text-gray-300">No jobs match the selected filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{job.serviceName}</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Location: {job.location}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(job.preferredDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.preferredTime || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    {getStatusBadge(job.status)}
                    {job.status !== 'COMPLETED' && (
                      <Link href={`/vendor/assignments/${job.id}`}>
                        <Button variant="outline" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                      </Link>
                    )}
                    {job.status === 'COMPLETED' && (
                      <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> Done</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
