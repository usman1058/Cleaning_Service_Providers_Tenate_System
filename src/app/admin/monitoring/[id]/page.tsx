'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  MessageSquare, 
  Phone, 
  Mail, 
  ArrowLeft,
  Camera,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AssignmentDetail {
  id: string
  status: string
  startedAt?: string
  completedAt?: string
  beforeImage?: string
  afterImage?: string
  additionalImages?: string
  vendorNotes?: string
  serviceRequest: {
    name: string
    email: string
    phone: string
    location: string
    preferredDate: string
    preferredTime: string
    service: {
      name: string
      description: string
    }
    user: {
      name: string
      email: string
    }
  }
  vendor: {
    id: string
    name: string
    email: string
    vendorProfile: {
      companyName: string
    }
    vendorApplications: Array<{ phone: string }>
  }
}

export default function MonitoringDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/monitoring/${id}`)
      if (!response.ok) {
        setError('Failed to load job details.')
        return
      }
      const data = await response.json()
      setAssignment(data)
    } catch (error) {
      setError('An error occurred while fetching details.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return
    
    setSendingMessage(true)
    try {
      const response = await fetch('/api/admin/vendors/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: assignment?.vendor.id,
          title: `Query: ${assignment?.serviceRequest.service.name}`,
          message: messageText,
        }),
      })

      if (response.ok) {
        setSuccess('Message sent successfully')
        setMessageText('')
        setIsMessageDialogOpen(false)
      } else {
        setError('Failed to send message')
      }
    } catch (error) {
      setError('An error occurred while sending message')
    } finally {
      setSendingMessage(false)
    }
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Job Not Found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    )
  }

  const additionalImages = assignment.additionalImages ? JSON.parse(assignment.additionalImages) : []
  const vendorPhone = assignment.vendor.vendorApplications[0]?.phone || ''

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Monitoring
      </Button>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl">
          {success}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Job Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {assignment.serviceRequest.service.name}
                </CardTitle>
                <CardDescription>
                  ID: {assignment.id}
                </CardDescription>
              </div>
              <Badge variant={assignment.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-sm px-4 py-1">
                {assignment.status.replace(/_/g, ' ')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">Location</span>
                  </div>
                  <p className="pl-6 text-gray-900">{assignment.serviceRequest.location}</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">Scheduled Time</span>
                  </div>
                  <p className="pl-6 text-gray-900">
                    {new Date(assignment.serviceRequest.preferredDate).toLocaleDateString()} at {assignment.serviceRequest.preferredTime}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-bold mb-2">Service Description</h4>
                <p className="text-gray-600 italic">"{assignment.serviceRequest.service.description}"</p>
              </div>
            </CardContent>
          </Card>

          {/* Proof Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-emerald-600" />
                Evidence & Proof
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold uppercase text-gray-500 mb-2">Before Photo</p>
                  {assignment.beforeImage ? (
                    <div className="border rounded-xl overflow-hidden aspect-video bg-gray-100">
                      <img src={assignment.beforeImage} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl aspect-video flex items-center justify-center bg-gray-50 text-gray-400">
                      Pending Upload
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-gray-500 mb-2">After Photo</p>
                  {assignment.afterImage ? (
                    <div className="border rounded-xl overflow-hidden aspect-video bg-gray-100">
                      <img src={assignment.afterImage} alt="After" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl aspect-video flex items-center justify-center bg-gray-50 text-gray-400">
                      Pending Upload
                    </div>
                  )}
                </div>
              </div>

              {additionalImages.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-bold uppercase text-gray-500 mb-4">Additional Proof</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {additionalImages.map((url: string, idx: number) => (
                      <div key={idx} className="border rounded-lg overflow-hidden aspect-square">
                        <img src={url} alt={`Extra ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assignment.vendorNotes && (
                <div className="pt-4 border-t">
                  <h4 className="font-bold mb-2">Vendor Completion Notes</h4>
                  <div className="p-4 bg-gray-50 rounded-lg text-gray-700 italic">
                    "{assignment.vendorNotes}"
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Contact & Actions */}
        <div className="space-y-6">
          {/* Vendor Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vendor Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  {assignment.vendor.vendorProfile.companyName[0]}
                </div>
                <div>
                  <p className="font-bold">{assignment.vendor.vendorProfile.companyName}</p>
                  <p className="text-xs text-gray-500">{assignment.vendor.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${assignment.vendor.email}`}>
                    <Mail className="h-4 w-4 mr-2" /> Email
                  </a>
                </Button>
                {vendorPhone && (
                  <Button variant="outline" className="w-full text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" asChild>
                    <a href={`https://wa.me/${vendorPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="h-4 w-4 mr-2" /> WhatsApp
                    </a>
                  </Button>
                )}
              </div>

              <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <MessageSquare className="h-4 w-4 mr-2" /> Message Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Message Vendor</DialogTitle>
                    <DialogDescription>
                      Send a query about this specific job. They will receive it as a dashboard notification.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="msg">Message</Label>
                    <Textarea 
                      id="msg" 
                      placeholder="e.g. Please provide a clear photo of the bathroom sink."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSendMessage} disabled={sendingMessage || !messageText.trim()}>
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Client Card */}
          <Card className="bg-gray-50 border-none">
            <CardHeader>
              <CardTitle className="text-lg">Client Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-bold">{assignment.serviceRequest.name}</p>
                  <p className="text-xs text-gray-500">{assignment.serviceRequest.email}</p>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="link" className="p-0 h-auto text-emerald-600" asChild>
                  <a href={`tel:${assignment.serviceRequest.phone}`}>
                    <Phone className="h-4 w-4 mr-2" /> {assignment.serviceRequest.phone}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
