'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Mail, 
  Calendar, 
  FileText, 
  Loader2, 
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard
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

interface ClientData {
  id: string
  name: string
  email: string
  createdAt: string
  serviceRequests: any[]
  auditLogs: any[]
}

export default function AdminClientDetail() {
  const params = useParams()
  const router = useRouter()
  const clientId = params.id as string

  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { convert } = useCurrency()

  useEffect(() => {
    if (clientId) {
      fetchClient()
    }
  }, [clientId])

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`)
      if (response.ok) {
        const data = await response.json()
        setClient(data)
      } else {
        setError('Client not found')
      }
    } catch (error) {
      setError('Failed to load client data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (!client) return null

  const totalSpent = client.serviceRequests
    .filter(req => req.status === 'COMPLETED')
    .reduce((sum, req) => sum + (req.service?.startingPrice || 0), 0)

  return (
    <div className="p-0">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">Edit Profile</Button>
            <Button variant="destructive" size="sm">Suspend Account</Button>
          </div>
        </div>

        {/* Client Identity */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {client.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Customer since {new Date(client.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Total Bookings</p>
                  <p className="text-xl font-bold">{client.serviceRequests.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Total Spent</p>
                  <p className="text-xl font-bold text-emerald-600">{convert(totalSpent)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Active Requests</p>
                  <p className="text-xl font-bold text-orange-600">
                    {client.serviceRequests.filter(r => r.status === 'PENDING_VERIFICATION' || r.status === 'SCHEDULED').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Account Type</p>
                  <p className="text-xl font-bold">Personal</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 border">
            <TabsTrigger value="history">Booking History</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="billing">Billing & Receipts</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>All Service Requests</CardTitle>
                <CardDescription>Comprehensive list of this client's interaction with the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                {client.serviceRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No service requests found for this client.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.serviceRequests.map((req: any) => (
                        <TableRow key={req.id}>
                          <TableCell className="font-medium">
                            {req.service?.name || 'Custom Booking'}
                          </TableCell>
                          <TableCell>
                            {req.assignment?.vendor?.vendorProfile?.companyName || (
                              <span className="text-xs text-orange-500 font-medium">UNASSIGNED</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              req.status === 'COMPLETED' ? 'default' :
                              req.status === 'PENDING_VERIFICATION' ? 'secondary' :
                              'outline'
                            }>
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {convert(req.service?.startingPrice || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/bookings/${req.id}`}>Details</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Logs</CardTitle>
                <CardDescription>Recent system events related to this user.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {client.auditLogs.map((log: any) => (
                    <div key={log.id} className="flex gap-4 items-start">
                      <div className="mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                        <Clock className="h-4 w-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {client.auditLogs.length === 0 && (
                    <p className="text-center text-gray-500 py-6">No recent activity logs.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Invoices & Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.serviceRequests.filter(r => r.receipt).map((req: any) => (
                      <TableRow key={req.receipt.id}>
                        <TableCell className="font-mono text-xs">
                          {req.receipt.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>{req.service?.name}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(req.receipt.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {convert(req.service?.startingPrice || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <a href={req.receipt.fileUrl} target="_blank" rel="noopener noreferrer">
                              Download PDF
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {client.serviceRequests.filter(r => r.receipt).length === 0 && (
                  <p className="text-center text-gray-500 py-12">No billing records found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
