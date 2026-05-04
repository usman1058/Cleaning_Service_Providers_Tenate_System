'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, ArrowLeft, Clock, MapPin, Calendar, User, CheckCircle2, PlayCircle, Loader2, Camera, Upload, Save, AlertCircle } from 'lucide-react'

interface Assignment {
  id: string
  serviceName: string
  serviceDescription?: string
  clientName: string
  location: string
  preferredDate: string
  preferredTime: string
  scheduledDate?: string
  status: string
  vendorNotes?: string
  vendorAcceptedAt?: string
  startedAt?: string
  completedAt?: string
  beforeImage?: string
  afterImage?: string
}

export default function VendorAssignmentDetail() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [notes, setNotes] = useState('')
  const [beforeImage, setBeforeImage] = useState<File | null>(null)
  const [afterImage, setAfterImage] = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState('')
  const [afterPreview, setAfterPreview] = useState('')

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment()
    }
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      const response = await fetch(`/api/vendor/assignments/${assignmentId}`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
        if (data.vendorNotes) {
          setNotes(data.vendorNotes)
        }
      }
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
      setError('Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true)
    setError('')

    try {
      const response = await fetch(`/api/vendor/assignments/${assignmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setAssignment(assignment ? { ...assignment, status: newStatus, id: assignment.id! } : null)
        setSuccess(`Status updated to ${newStatus.replace(/_/g, ' ')}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update status')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setUpdating(false)
    }

    setTimeout(() => setSuccess(''), 3000)
  }

  const handleImageChange = (type: 'before' | 'after', file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }

      setError('')

      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'before') {
          setBeforeImage(file)
          setBeforePreview(reader.result as string)
        } else {
          setAfterImage(file)
          setAfterPreview(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setUpdating(true)

    try {
      const formData = new FormData()
      if (beforeImage) formData.append('beforeImage', beforeImage)
      if (afterImage) formData.append('afterImage', afterImage)
      if (notes) formData.append('notes', notes)

      const response = await fetch(`/api/vendor/assignments/${assignmentId}/complete`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to complete service')
        return
      }

      setSuccess('Service completed successfully!')
      setTimeout(() => {
        router.push('/vendor/history')
      }, 2000)
    } catch (error) {
      setError('An error occurred')
    } finally {
      setUpdating(false)
    }

    setTimeout(() => setSuccess(''), 5000)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      ASSIGNED: { variant: 'secondary', label: 'Assigned' },
      ACCEPTED: { variant: 'default', label: 'Accepted' },
      IN_PROGRESS: { variant: 'default', label: 'In Progress' },
      COMPLETED: { variant: 'default', label: 'Completed' },
    }
    const config = statusConfig[status] || statusConfig.ASSIGNED
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
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

      <nav className="bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/vendor/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              Home
            </Link>
            <Link href="/vendor/assignments" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600">
              Assignments
            </Link>
            <Link href="/vendor/history" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              History
            </Link>
            <Link href="/vendor/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              Profile
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/vendor/assignments" className="inline-flex items-center text-emerald-600 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assignments
          </Link>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Loading...</p>
            </div>
          ) : assignment ? (
            <div className="space-y-6">
              {/* Success Message */}
              {success && (
                <Alert className="bg-emerald-50 border-emerald-200">
                  <AlertDescription className="text-emerald-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Assignment Info Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {assignment.serviceName}
                        </h2>
                        {getStatusBadge(assignment.status)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Client</p>
                          <p className="font-medium text-gray-900 dark:text-white">{assignment.clientName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Location</p>
                          <p className="font-medium text-gray-900 dark:text-white">{assignment.location}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Preferred Date</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {new Date(assignment.preferredDate).toLocaleDateString()} at {assignment.preferredTime}
                          </p>
                        </div>
                      </div>

                      {assignment.scheduledDate && (
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Scheduled Date</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {new Date(assignment.scheduledDate).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {assignment.serviceDescription && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Service Description</p>
                      <p className="text-gray-700 dark:text-gray-300">{assignment.serviceDescription}</p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Assignment Timeline</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          ['ASSIGNED', 'ACCEPTED'].includes(assignment.status) ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          1
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Assigned</p>
                          {assignment.vendorAcceptedAt ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300">Accepted at {new Date(assignment.vendorAcceptedAt).toLocaleString()}</p>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-300">Pending acceptance</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          assignment.status === 'IN_PROGRESS' || assignment.status === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          2
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">In Progress</p>
                          {assignment.startedAt ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300">Started at {new Date(assignment.startedAt).toLocaleString()}</p>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-300">Not started yet</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          assignment.status === 'COMPLETED' ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          3
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Completed</p>
                          {assignment.completedAt ? (
                            <p className="text-sm text-gray-600 dark:text-gray-300">Completed at {new Date(assignment.completedAt).toLocaleString()}</p>
                          ) : (
                            <p className="text-sm text-gray-600 dark:text-gray-300">Pending completion</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Assignment Status</CardTitle>
                  <CardDescription>
                    Update your progress on this assignment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant={assignment.status === 'ACCEPTED' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('ACCEPTED')}
                      disabled={['IN_PROGRESS', 'COMPLETED'].includes(assignment.status) || updating}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept Job
                    </Button>

                    <Button
                      variant={assignment.status === 'IN_PROGRESS' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      disabled={assignment.status === 'COMPLETED' || updating}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Cleaning
                    </Button>

                    <Button
                      variant={assignment.status === 'COMPLETED' ? 'default' : 'outline'}
                      onClick={() => handleStatusChange('COMPLETED')}
                      disabled={updating}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Completion Form (Visible when IN_PROGRESS) */}
              {assignment.status === 'IN_PROGRESS' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-emerald-600" />
                      Complete Service
                    </CardTitle>
                    <CardDescription>
                      Upload before and after photos to complete this service
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="beforeImage">Before Photo *</Label>
                          <Input
                            id="beforeImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange('before', e.target.files?.[0] || null)}
                            required
                          />
                          {beforePreview && (
                            <div className="mt-2 border rounded-lg p-2 bg-white dark:bg-gray-800">
                              <img src={beforePreview} alt="Before" className="w-full h-32 object-cover" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="afterImage">After Photo *</Label>
                          <Input
                            id="afterImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange('after', e.target.files?.[0] || null)}
                            required
                          />
                          {afterPreview && (
                            <div className="mt-2 border rounded-lg p-2 bg-white dark:bg-gray-800">
                              <img src={afterPreview} alt="After" className="w-full h-32 object-cover" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Completion Notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Add any notes about the service completion..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={updating || !beforeImage || !afterImage}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Completion
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Completed State */}
              {assignment.status === 'COMPLETED' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Service Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert className="bg-emerald-50 border-emerald-200">
                        <AlertDescription className="text-emerald-800">
                          This service has been completed and is currently under review by the admin.
                        </AlertDescription>
                      </Alert>

                      <div className="grid md:grid-cols-2 gap-4">
                        {assignment.beforeImage && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Before Photo</p>
                            <div className="border rounded-lg overflow-hidden">
                              <img src={assignment.beforeImage} alt="Before" className="w-full h-40 object-cover" />
                            </div>
                          </div>
                        )}
                        {assignment.afterImage && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">After Photo</p>
                            <div className="border rounded-lg overflow-hidden">
                              <img src={assignment.afterImage} alt="After" className="w-full h-40 object-cover" />
                            </div>
                          </div>
                        )}
                      </div>

                      {assignment.vendorNotes && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your Notes</p>
                          <p className="text-gray-700 dark:text-gray-300">{assignment.vendorNotes}</p>
                        </div>
                      )}

                      <div className="pt-4">
                        <Link href="/vendor/history">
                          <Button variant="outline" className="w-full">
                            View Job History
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Assignment Not Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  The assignment you're looking for doesn't exist or you don't have access to it.
                </p>
                <Link href="/vendor/assignments">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    View My Assignments
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
