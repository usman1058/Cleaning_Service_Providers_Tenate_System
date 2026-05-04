'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Calendar, CheckCircle2, Clock, MapPin, Upload, Loader2, ArrowLeft, Camera } from 'lucide-react'

interface ServiceExecution {
  id: string
  serviceName: string
  clientName: string
  location: string
  scheduledDate: string
  status: string
}

export default function VendorExecutionPage() {
  const params = useParams()
  const assignmentId = params.id as string

  const [service, setService] = useState<ServiceExecution | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [status, setStatus] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [beforeImage, setBeforeImage] = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState('')
  const [afterImage, setAfterImage] = useState<File | null>(null)
  const [afterPreview, setAfterPreview] = useState('')

  useEffect(() => {
    if (assignmentId) {
      fetchService(assignmentId)
    }
  }, [assignmentId])

  const fetchService = async (id: string) => {
    try {
      const response = await fetch(`/api/vendor/assignments/${id}`)
      if (response.ok) {
        const data = await response.json()
        setService(data)
        setStatus(data.status)
      }
    } catch (error) {
      console.error('Failed to fetch service:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/vendor/assignments/${assignmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setStatus(newStatus)
        setError('')
      }
    } catch (error) {
      setError('Failed to update status')
    }
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
    setSubmitting(true)

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
        setError('Failed to complete service')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/vendor/history'
      }, 2000)
    } catch (error) {
      setError('An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Service Completed!</h2>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to history...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return <div>Service not found</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Green Services</h1>
            </div>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/vendor/assignments" className="inline-flex items-center text-emerald-600 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{service.serviceName}</CardTitle>
                  <CardDescription className="mt-2">Client: {service.clientName}</CardDescription>
                </div>
                <Badge variant={service.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                  {service.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4" />
                  <span>{service.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(service.scheduledDate).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant={status === 'ACCEPTED' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('ACCEPTED')}
                  disabled={status === 'IN_PROGRESS' || status === 'COMPLETED'}
                >
                  Accept Job
                </Button>
                <Button
                  variant={status === 'IN_PROGRESS' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  disabled={status === 'COMPLETED'}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Cleaning
                </Button>
                <Button
                  variant={status === 'COMPLETED' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('COMPLETED')}
                  disabled={status !== 'IN_PROGRESS'}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </CardContent>
          </Card>

          {status === 'IN_PROGRESS' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Complete Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

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
                      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                        <img src={beforePreview} alt="Before" className="max-w-full max-h-64 mx-auto" />
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
                      <div className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                        <img src={afterPreview} alt="After" className="max-w-full max-h-64 mx-auto" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Completion Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Completion
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
