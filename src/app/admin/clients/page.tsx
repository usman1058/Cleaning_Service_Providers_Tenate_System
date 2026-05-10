'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sparkles, Home, FileText, Users, CheckCircle2, Calendar, Search, Loader2 } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone?: string
  totalServices: number
  totalSpent: number
  createdAt: string
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/admin/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    (client.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Client Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all registered clients
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Clients List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading clients...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No clients found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchQuery ? 'Try a different search term' : 'No clients registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardContent className="py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {client.name}
                        </h4>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Email:</span> {client.email}
                        </p>
                        {client.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Phone:</span> {client.phone}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Joined:</span> {new Date(client.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">{client.totalServices} services</Badge>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Total Spent: <span className="font-bold text-emerald-600">${(client.totalSpent ?? 0).toFixed(2)}</span></span>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/clients/${client.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href="/admin/receipts">
                          <Button variant="outline" size="sm">
                            View Receipts
                          </Button>
                        </Link>
                      </div>
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
