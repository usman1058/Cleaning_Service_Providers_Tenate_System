'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar as CalendarIcon, Clock, MapPin, ArrowRight, AlertCircle, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns'

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
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/vendor/assignments')
      if (response.ok) {
        const data = await response.json()
        const activeJobs = data.filter((j: ScheduledJob) => j.status === 'ASSIGNED' || j.status === 'IN_PROGRESS' || j.status === 'COMPLETED')
        setJobs(activeJobs)
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'secondary' | 'default' | 'outline'; label: string }> = {
      ASSIGNED: { variant: 'secondary', label: 'Assigned' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'outline', label: 'Completed' },
    }
    const c = config[status] || { variant: 'secondary', label: status }
    return <Badge variant={c.variant}>{c.label}</Badge>
  }

  // Calendar Logic
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  const jobsForSelectedDate = jobs.filter(job => 
    job.scheduledDate && isSameDay(new Date(job.scheduledDate), selectedDate)
  )

  const hasJobOnDate = (date: Date) => {
    return jobs.some(job => job.scheduledDate && isSameDay(new Date(job.scheduledDate), date))
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Schedule</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your upcoming assignments and service calendar</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your schedule...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{format(currentMonth, 'MMMM yyyy')}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-gray-400 uppercase">{day[0]}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                  const isSelected = isSameDay(day, selectedDate)
                  const isCurrentMonth = isSameMonth(day, monthStart)
                  const hasJob = hasJobOnDate(day)
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        h-10 w-full rounded-lg flex flex-col items-center justify-center relative transition-all
                        ${isSelected ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                        ${!isCurrentMonth ? 'opacity-30' : 'opacity-100'}
                        ${isSameDay(day, new Date()) && !isSelected ? 'text-emerald-600 border border-emerald-200' : ''}
                      `}
                    >
                      <span className="text-sm">{format(day, 'd')}</span>
                      {hasJob && (
                        <span className={`h-1 w-1 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Job List for Selected Date */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-emerald-600" />
                Jobs for {format(selectedDate, 'PPP')}
              </h3>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                {jobsForSelectedDate.length} {jobsForSelectedDate.length === 1 ? 'Job' : 'Jobs'}
              </Badge>
            </div>

            {jobsForSelectedDate.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-20 text-center">
                  <div className="bg-gray-50 dark:bg-gray-900 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-gray-300" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">No jobs scheduled</h4>
                  <p className="text-gray-500 max-w-xs mx-auto">There are no assignments scheduled for this date. Check other dates with green indicators.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobsForSelectedDate.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">{job.serviceName}</h4>
                            {getStatusBadge(job.status)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4 text-emerald-600" />
                              <span>{job.preferredTime || 'TBD'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4 text-emerald-600" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <User className="h-4 w-4 text-emerald-600" />
                              <span>Client: {job.clientName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-5 flex items-center justify-center md:border-l">
                          <Link href={`/vendor/assignments/${job.id}`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                              Go to Job <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
