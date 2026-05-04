'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Loader2, ExternalLink, XCircle, Check, Clock, Search } from 'lucide-react'

interface Receipt {
  id: string
  serviceName: string
  clientName: string
  clientEmail: string
  fileUrl: string
  fileName: string
  status: string
  uploadedAt: string
  adminRemarks?: string
  serviceRequestId: string
}

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReceipts()
  }, [filter])

  const fetchReceipts = async () => {
    try {
      setError('')
      const params = new URLSearchParams()
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/admin/receipts?${params}`)
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || 'Failed to fetch receipts.')
        return
      }
      const data = await response.json()
      setReceipts(data)
    } catch (error) {
      console.error('Failed to fetch receipts:', error)
      setError('Failed to fetch receipts.')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (id: string, approved: boolean, remarks?: string) => {
    try {
      const response = await fetch(`/api/admin/receipts/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: approved ? 'APPROVED' : 'REJECTED', remarks }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error || 'Failed to review receipt.')
        return false
      }
      setReceipts(receipts.map(r =>
        r.id === id
          ? { ...r, status: approved ? 'APPROVED' : 'REJECTED', adminRemarks: remarks }
          : r
      ))
      return true
    } catch (error) {
      console.error('Failed to review receipt:', error)
      setError('Failed to review receipt.')
      return false
    }
  }

  const filteredReceipts = receipts.filter(receipt =>
    (receipt.clientName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (receipt.clientEmail ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (receipt.serviceName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Receipt Verification
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Review and verify client payment receipts
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by client name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-md px-3 py-2 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
        >
          <option value="all">All Receipts</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Receipts List */}
      {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading receipts...</p>
        </div>
      ) : filteredReceipts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No receipts found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {filter === 'PENDING'
                ? 'No pending receipts to review'
                : filter === 'all'
                ? 'No receipts uploaded yet'
                : 'No receipts with this status'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReceipts.map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              receipt={receipt}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ReceiptCard({ receipt, onReview }: { receipt: Receipt; onReview: (id: string, approved: boolean, remarks?: string) => Promise<boolean> }) {
  const [remarks, setRemarks] = useState('')
  const [showReview, setShowReview] = useState(false)
  const [reviewing, setReviewing] = useState(false)

  const submitReview = async (approved: boolean) => {
    setReviewing(true)
    try {
      await onReview(receipt.id, approved, remarks)
    } finally {
      setReviewing(false)
    }
  }

  if (receipt.status !== 'PENDING' && !showReview) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {receipt.serviceName}
                </h4>
                <Badge
                  variant={
                    receipt.status === 'APPROVED'
                      ? 'default'
                      : receipt.status === 'REJECTED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {receipt.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                <span className="font-medium">{receipt.clientName}</span> - {receipt.clientEmail}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Uploaded: {new Date(receipt.uploadedAt).toLocaleString()}
              </p>
              {receipt.adminRemarks && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  <span className="font-medium">Remarks:</span> {receipt.adminRemarks}
                </p>
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
    )
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              {receipt.serviceName}
            </CardTitle>
            <CardDescription className="mt-2">
              <span className="font-medium">{receipt.clientName}</span> - {receipt.clientEmail}
            </CardDescription>
          </div>
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Pending Review</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" asChild className="flex-1">
              <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Receipt
              </a>
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Remarks (optional)</label>
            <Textarea
              placeholder="Add any notes about this receipt..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>

          <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              After approval, the service will move to "Verified" status and can be assigned to a vendor.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={() => submitReview(true)}
              disabled={reviewing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="h-4 w-4 mr-2" />
              {reviewing ? 'Processing...' : 'Approve'}
            </Button>
            <Button
              onClick={() => submitReview(false)}
              disabled={reviewing}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {reviewing ? 'Processing...' : 'Reject'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
