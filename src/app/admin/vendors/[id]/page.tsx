'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  User, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  Shield,
  Star,
  Loader2,
  ArrowLeft,
  Settings
} from 'lucide-react'

import { useCurrency } from '@/components/providers/currency-provider'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface VendorData {
  id: string
  companyName: string
  businessType: string
  serviceLocations: string
  experienceYears: number
  teamSize: number
  description: string
  status: string
  isActive: boolean
  createdAt: string
  user: {
    name: string
    email: string
    serviceAssignments: any[]
    vendorApplications: any[]
  }
}

export default function AdminVendorDetail() {
  const params = useParams()
  const router = useRouter()
  const vendorId = params.id as string

  const [vendor, setVendor] = useState<VendorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  const { convert } = useCurrency()

  useEffect(() => {
    if (vendorId) {
      fetchVendor()
    }
  }, [vendorId])

  const fetchVendor = async () => {
    try {
      const response = await fetch(`/api/admin/vendors/profiles/${vendorId}`)
      if (response.ok) {
        const data = await response.json()
        setVendor(data)
      } else {
        setError('Vendor not found')
      }
    } catch (error) {
      setError('Failed to load vendor data')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/vendors/profiles/${vendorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSuccess('Vendor status updated')
        fetchVendor()
      } else {
        setError('Failed to update status')
      }
    } catch (error) {
      setError('An error occurred')
    } finally {
      setSaving(false)
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
          userId: vendor?.userId,
          title: 'Message from Admin',
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
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!vendor) return null

  const application = vendor.user.vendorApplications[0]

  return (
    <div className="p-0">
      {/* Breadcrumbs / Back */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/vendors')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant={vendor.status === 'APPROVED' ? 'default' : 'secondary'}>
            {vendor.status}
          </Badge>
          <Badge variant={vendor.isActive ? 'outline' : 'destructive'}>
            {vendor.isActive ? 'Active' : 'Disabled'}
          </Badge>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <User className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {vendor.companyName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {vendor.businessType || 'General Vendor'} • {vendor.user.name}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total Jobs</p>
              <p className="text-lg font-bold">{vendor.user.serviceAssignments.length}</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Experience</p>
              <p className="text-lg font-bold">{vendor.experienceYears || 0} Years</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Team Size</p>
              <p className="text-lg font-bold">{vendor.teamSize || 0} Members</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <p className="text-lg font-bold">4.8</p>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="w-full md:w-80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700" 
              onClick={() => handleStatusChange('APPROVED')}
              disabled={saving || vendor.status === 'APPROVED'}
            >
              Approve Vendor
            </Button>
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => handleStatusChange('REJECTED')}
              disabled={saving || vendor.status === 'REJECTED'}
            >
              Reject Vendor
            </Button>
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="w-full">Message Vendor</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Message Vendor</DialogTitle>
                  <DialogDescription>
                    Send a direct message to {vendor.companyName}. They will receive this as a notification in their dashboard.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message">Message Content</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={5}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="overview">Profile Overview</TabsTrigger>
          <TabsTrigger value="jobs">Service History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="settings">Admin Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="text-sm text-gray-600">{vendor.user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Service Locations</p>
                    <p className="text-sm text-gray-600">{vendor.serviceLocations || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Verification Status</p>
                    <p className="text-sm text-gray-600">Verified Professional</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Joined Platform</p>
                    <p className="text-sm text-gray-600">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {vendor.description || 'No business description provided.'}
                </p>
                
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {application?.servicesOffered?.split(',').map((s: string) => (
                      <Badge key={s} variant="secondary">{s.trim()}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Completed & Active Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {vendor.user.serviceAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No job history available for this vendor.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendor.user.serviceAssignments.map((assignment: any) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {assignment.serviceRequest.service?.name || 'Custom Service'}
                        </TableCell>
                        <TableCell>{assignment.serviceRequest.name}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(assignment.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={assignment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {convert(assignment.serviceRequest.service?.startingPrice || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  <Badge variant="outline">Identity</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-1">Identity Document</p>
                <p className="text-xs text-gray-500 mb-4">Passport or National ID card</p>
                {application?.identityDocUrl ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={application.identityDocUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> View Document
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-red-500 italic">Not uploaded</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <Badge variant="outline">Business</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-1">Trade License</p>
                <p className="text-xs text-gray-500 mb-4">Official business registration</p>
                {application?.licenseDocUrl ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={application.licenseDocUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> View Document
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-red-500 italic">Not uploaded</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <Badge variant="outline">Legal</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium mb-1">Signed Contract</p>
                <p className="text-xs text-gray-500 mb-4">Platform partnership agreement</p>
                {application?.contractDocUrl ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={application.contractDocUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" /> View Document
                    </a>
                  </Button>
                ) : (
                  <p className="text-xs text-red-500 italic">Not uploaded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Administrative Controls</CardTitle>
              <CardDescription>Manage visibility and operational status of this vendor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Active Status</p>
                  <p className="text-sm text-gray-500">Enable or disable this vendor's ability to receive jobs.</p>
                </div>
                <Button variant={vendor.isActive ? "destructive" : "default"}>
                  {vendor.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Button>
              </div>

              <div className="space-y-4">
                <Label>Admin Internal Remarks</Label>
                <Textarea 
                  placeholder="Add private notes about this vendor (e.g., performance issues, special skills)..." 
                  rows={4}
                />
                <Button className="bg-emerald-600 hover:bg-emerald-700">Save Internal Notes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
