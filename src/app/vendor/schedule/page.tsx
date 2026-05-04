'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Clock, MapPin, ArrowRight, AlertCircle } from 'lucide-react'

interface ScheduledJob {
  id: string
  serviceName: string
  location: string
  scheduledDate: string
  preferredTime: string
  status: string
  clientName: string
}

export default function VendorSchedulePage() {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/vendor/assignments')
      if (response.ok) {
        const data = await response.json()
        const activeJobs = data.filter((j: ScheduledJob) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS')
        setJobs(activeJobs)
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'secondary' | 'default'; label: string }> = {
      ASSIGNED: { variant: 'secondary', label: 'Assigned' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
    }
    const c = config[status] || { variant: 'secondary', label: status }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  const groupedJobs = jobs.reduce<Record<string, ScheduledJob[]>>((groups, job) => {
    const date = job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Unscheduled'
    if (!groups[date]) groups[date] = []
    groups[date].push(job)
    return groups
  }, {})

  const sortedDates = Object.keys(groupedJobs).sort((a, b) => {
    if (a === 'Unscheduled') return 1
    if (b === 'Unscheduled') return -1
    return new Date(a).getTime() - new Date(b).getTime()
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Schedule</h1>
        <p className="text-gray-600 dark:text-gray-400">Your upcoming job schedule</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading schedule...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No scheduled jobs</h3>
            <p className="text-gray-600 dark:text-gray-300">You have no upcoming jobs scheduled.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  {date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedJobs[date]?.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{job.serviceName}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {job.preferredTime || 'TBD'}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(job.status)}
                        <Link href={`/vendor/assignments/${job.id}`}>
                          <Button variant="outline" size="sm"><ArrowRight className="h-4 w-4" /></Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
