'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Download, Trash2, Search, Calendar, FileCheck, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'

interface Vendor {
  id: string
  name: string
  email: string
}

interface VendorContract {
  id: string
  vendorId: string
  contractUrl: string
  fileSize: number
  fileName: string
  version: number
  isActive: boolean
  uploadedBy: string | null
  uploadedAt: string
  expiresAt: string | null
  vendor?: Vendor
}

export default function VendorContractsPage() {
  const [contracts, setContracts] = useState<VendorContract[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [mutatingContractId, setMutatingContractId] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchContracts()
    fetchVendors()
  }, [])

  const fetchContracts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/vendor-contracts')
      if (!response.ok) throw new Error('Failed to fetch contracts')
      const data = await response.json()
      setContracts(data)
    } catch (err) {
      console.error('Error fetching contracts:', err)
      setError('Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await fetch('/api/admin/vendors/profiles')
      if (!response.ok) throw new Error('Failed to fetch vendors')

      const data = await response.json()
      // Extract vendor user information
      const vendorList = data.map((vendor: any) => ({
        id: vendor.userId,
        name: vendor.user?.name || vendor.companyName || 'Unknown',
        email: vendor.user?.email || 'unknown@email.com',
      }))
      setVendors(vendorList)
    } catch (err) {
      console.error('Error fetching vendors:', err)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Only PDF and Word documents are allowed.',
          variant: 'destructive',
        })
        setSelectedFile(null)
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedVendorId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a vendor and a file to upload.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('vendorId', selectedVendorId)
      if (expiresAt) {
        formData.append('expiresAt', expiresAt)
      }

      const response = await fetch('/api/admin/vendor-contracts', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload contract')
      }

      toast({
        title: 'Success',
        description: 'Contract uploaded successfully',
      })

      setUploadDialogOpen(false)
      setSelectedFile(null)
      setSelectedVendorId('')
      setExpiresAt('')
      fetchContracts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload contract'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const deleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract? This cannot be undone.')) {
      return
    }

    try {
      setMutatingContractId(contractId)
      const response = await fetch(`/api/admin/vendor-contracts/${contractId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete contract')
      }

      toast({
        title: 'Success',
        description: 'Contract deleted successfully',
      })

      fetchContracts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contract'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setMutatingContractId(null)
    }
  }

  const toggleContractStatus = async (contractId: string, isActive: boolean) => {
    try {
      setMutatingContractId(contractId)
      const response = await fetch(`/api/admin/vendor-contracts/${contractId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update contract')
      }

      fetchContracts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contract'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setMutatingContractId(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredContracts = contracts.filter(contract =>
    (contract.vendor?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contract.vendor?.email ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contract.fileName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileCheck className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Vendor Contracts
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Upload and manage vendor contract documents
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Contracts</CardTitle>
              <CardDescription>
                View and manage all vendor contract documents
              </CardDescription>
            </div>
            <Button
              onClick={() => setUploadDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Contract
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contracts by vendor name, email, or filename..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredContracts.map((contract) => (
              <div
                key={contract.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-emerald-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {contract.fileName}
                        </h3>
                        <Badge variant={contract.isActive ? 'default' : 'secondary'}>
                          {contract.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          v{contract.version}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Vendor: {contract.vendor?.name} ({contract.vendor?.email})
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span>Size: {formatFileSize(contract.fileSize)}</span>
                        <span>Uploaded: {formatDate(contract.uploadedAt)}</span>
                        <span>Expires: {formatDate(contract.expiresAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(contract.contractUrl, '_blank')}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleContractStatus(contract.id, !contract.isActive)}
                    disabled={mutatingContractId === contract.id}
                    title={contract.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {contract.isActive ? (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteContract(contract.id)}
                    disabled={mutatingContractId === contract.id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredContracts.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'No contracts found matching your search.'
                  : 'No contracts uploaded yet. Upload your first contract to get started.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Vendor Contract</DialogTitle>
            <DialogDescription>
              Upload a contract document for a specific vendor
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <select
                id="vendor"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Contract File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Accepted formats: PDF, DOC, DOCX
              </p>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <CheckCircle className="h-4 w-4" />
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (optional)</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Leave empty for contracts that don't expire
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !selectedVendorId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {uploading ? 'Uploading...' : 'Upload Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
