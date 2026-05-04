'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Home, Calendar, Plus, Loader2, Search, CheckCircle2, Users, MessageSquare } from 'lucide-react'

interface VendorTicket {
  id: string
  subject: string
  category: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  resolutionNotes?: string
  relatedEntityType?: string
  relatedEntityId?: string
}

export default function VendorTicketsPage() {
  const { data: session } = useSession()
  const [tickets, setTickets] = useState<VendorTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [formData, setFormData] = useState({
    subject: '',
    category: 'SERVICE_ISSUE',
    description: '',
    assignmentId: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchTickets()
    }
  }, [session, filter])

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/vendor/tickets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch('/api/vendor/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create ticket')
        return
      }

      setMessage('Ticket created successfully')
      setFormData({
        subject: '',
        category: 'SERVICE_ISSUE',
        description: '',
        assignmentId: '',
      })
      setShowCreateForm(false)
      fetchTickets()
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string }> = {
      OPEN: { variant: 'destructive', label: 'Open' },
      IN_REVIEW: { variant: 'secondary', label: 'In Review' },
      RESOLVED: { variant: 'default', label: 'Resolved' },
      CLOSED: { variant: 'secondary', label: 'Closed' },
    }

    const config = statusConfig[status] || statusConfig.OPEN
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { variant: any; label: string }> = {
      LOW: { variant: 'secondary', label: 'Low' },
      NORMAL: { variant: 'default', label: 'Normal' },
      HIGH: { variant: 'destructive', label: 'High' },
      URGENT: { variant: 'destructive', label: 'Urgent' },
    }

    const config = priorityConfig[priority] || priorityConfig.NORMAL
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredTickets = tickets.filter(ticket =>
    (ticket.subject ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
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

      <nav className="bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/vendor/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/vendor/assignments" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              Assigned
            </Link>
            <Link href="/vendor/history" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4" />
              History
            </Link>
            <Link href="/vendor/tickets" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
              <MessageSquare className="h-4 w-4" />
              Support Tickets
            </Link>
            <Link href="/vendor/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Users className="h-4 w-4" />
              Profile
            </Link>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Support Tickets
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              File complaints or issues with assigned services
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <Alert className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="SERVICE_ISSUE">Service Issue</option>
                    <option value="PAYMENT_PROBLEM">Payment Problem</option>
                    <option value="TECHNICAL">Technical</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-md px-3 py-2 bg-white dark:bg-gray-950">
            <option value="all">All Status</option>
            <option value="OPEN">Open</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tickets</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchQuery ? 'Try a different search' : 'No support tickets yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h4>
                        <div className="flex gap-2">
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Category: {ticket.category.replace(/_/g, ' ')}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">{ticket.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Created: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      {ticket.resolutionNotes && (
                        <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded text-sm text-emerald-800 dark:text-emerald-200">
                          Resolution: {ticket.resolutionNotes}
                        </div>
                      )}
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
