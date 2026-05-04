'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Home, FileText, Clock, CheckCircle2, AlertTriangle, Loader2, ExternalLink } from 'lucide-react'

interface Receipt {
  id: string
  serviceName: string
  fileUrl: string
  fileName: string
  status: string
  uploadedAt: string
  reviewedAt?: string
  adminRemarks?: string
}

export default function ClientReceiptsPage() {
  const { data: session } = useSession()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchReceipts()
    }
  }, [session])

  const fetchReceipts = async () => {
    try {
      const response = await fetch('/api/client/receipts')
      if (response.ok) {
        const data = await response.json()
        setReceipts(data)
      }
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: any; label: string; icon: any }> = {
      PENDING: { variant: 'secondary', label: 'Pending Verification', icon: Clock },
      APPROVED: { variant: 'default', label: 'Approved', icon: CheckCircle2 },
      REJECTED: { variant: 'destructive', label: 'Rejected', icon: AlertTriangle },
    }

    const config = statusConfig[status] || { variant: 'secondary', label: status, icon: Clock }
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-950/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Global Green Services
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/client/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-950 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            <Link href="/client/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/client/services" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <FileText className="h-4 w-4" />
              My Services
            </Link>
            <Link href="/client/receipts" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium">
              <Clock className="h-4 w-4" />
              Receipts & Payments
            </Link>
            <Link href="/client/notifications" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              Notifications
            </Link>
            <Link href="/client/profile" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600">
              User
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Receipts & Payments
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            View and manage all your payment receipts
          </p>
        </div>

        {/* Receipts List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No receipts uploaded
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You haven't uploaded any payment receipts yet.
              </p>
              <Link href="/services">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Browse Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {receipts.map((receipt) => (
              <Card key={receipt.id}>
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {receipt.serviceName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            File: {receipt.fileName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Uploaded: {new Date(receipt.uploadedAt).toLocaleDateString()} at{' '}
                            {new Date(receipt.uploadedAt).toLocaleTimeString()}
                          </p>
                          {receipt.reviewedAt && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Reviewed: {new Date(receipt.reviewedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(receipt.status)}
                        </div>
                      </div>
                      {receipt.adminRemarks && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Admin Remarks:</span> {receipt.adminRemarks}
                          </p>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" asChild>
                      <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Receipt
                      </a>
                    </Button>
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
