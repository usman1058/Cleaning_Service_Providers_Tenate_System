'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  XCircle, 
  Check, 
  Clock, 
  Search,
  Filter,
  AlertCircle,
  FileCheck,
  User,
  Calendar
} from 'lucide-react'
import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout'

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
    <div className="p-0">
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Receipt Verification</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Review and verify client payment receipts to activate service requests.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium uppercase tracking-wider">Pending Review</p>
              <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                {receipts.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by client or service..." 
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-11 border rounded-md px-3 bg-white dark:bg-gray-950 text-gray-900 dark:text-white min-w-[150px]"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Button variant="outline" className="h-11">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          </div>
        ) : filteredReceipts.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-20 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Receipts Found</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {filter === 'PENDING' 
                  ? "Great! All receipts have been processed." 
                  : "No receipts match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
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
  const [remarks, setRemarks] = useState(receipt.adminRemarks || '')
  const [reviewing, setReviewing] = useState(false)

  const submitReview = async (approved: boolean) => {
    setReviewing(true)
    try {
      await onReview(receipt.id, approved, remarks)
    } finally {
      setReviewing(false)
    }
  }

  const isPending = receipt.status === 'PENDING'

  return (
    <Card className={`overflow-hidden transition-all ${isPending ? 'border-amber-200 dark:border-amber-800 ring-1 ring-amber-100 dark:ring-amber-900/30' : ''}`}>
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{receipt.serviceName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={
                  receipt.status === 'APPROVED' ? 'default' : 
                  receipt.status === 'REJECTED' ? 'destructive' : 'secondary'
                } className="uppercase text-[10px]">
                  {receipt.status}
                </Badge>
                <span className="text-xs text-gray-500">Uploaded {new Date(receipt.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Client Info</p>
                  <p className="text-sm font-bold">{receipt.clientName}</p>
                  <p className="text-xs text-gray-500">{receipt.clientEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Submission Date</p>
                  <p className="text-sm">{new Date(receipt.uploadedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border">
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Admin Remarks</p>
              {isPending ? (
                <Textarea
                  placeholder="Add verification notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="bg-white dark:bg-gray-800 resize-none h-20 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  {receipt.adminRemarks || "No remarks provided."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-900/40 p-6 flex flex-col justify-center gap-4">
          <Button variant="outline" asChild className="w-full h-11 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all">
            <a href={receipt.fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Receipt
            </a>
          </Button>

          {isPending ? (
            <div className="space-y-3">
              <Button
                onClick={() => submitReview(true)}
                disabled={reviewing}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              >
                {reviewing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve & Activate
              </Button>
              <Button
                onClick={() => submitReview(false)}
                disabled={reviewing}
                variant="destructive"
                className="w-full h-11 shadow-sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Receipt
              </Button>
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-xs text-gray-500 mb-1">Status fixed</p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                This receipt has been {receipt.status.toLowerCase()}.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
