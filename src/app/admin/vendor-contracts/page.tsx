'use client'

import { useState, useEffect } from 'react'
import { FileText, Upload, Download, Trash2, Search, Calendar, FileCheck, AlertCircle, CheckCircle, FileUp, Settings, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

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

interface ContractTemplate {
  id: string
  title: string
  fileUrl: string
  fileSize: number
  fileName: string
  version: number
  isActive: boolean
  description: string | null
  uploadedAt: string
}

export default function VendorContractsPage() {
  const [contracts, setContracts] = useState<VendorContract[]>([])
  const [templates, setTemplates] = useState<ContractTemplate[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Upload dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')
  const [templateTitle, setTemplateTitle] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [mutatingContractId, setMutatingContractId] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchContracts()
    fetchVendors()
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/contract-templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data)
    } catch (err) {
      console.error('Error fetching templates:', err)
    }
  }

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
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const deleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract?')) return

    try {
      setMutatingContractId(contractId)
      const response = await fetch(`/api/admin/vendor-contracts/${contractId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete contract')
      }

      toast({ title: 'Success', description: 'Contract deleted successfully' })
      fetchContracts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contract'
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setMutatingContractId(null)
    }
  }

  const handleTemplateUpload = async () => {
    if (!templateFile || !templateTitle) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a title and a file for the template.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', templateFile)
      formData.append('title', templateTitle)
      formData.append('description', templateDescription)

      const response = await fetch('/api/admin/contract-templates', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload template')
      }

      toast({
        title: 'Success',
        description: 'Global contract updated successfully',
      })

      setTemplateDialogOpen(false)
      setTemplateFile(null)
      setTemplateTitle('')
      setTemplateDescription('')
      fetchTemplates()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload template'
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      setMutatingContractId(templateId)
      const response = await fetch(`/api/admin/contract-templates/${templateId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete template')

      toast({ title: 'Success', description: 'Template deleted' })
      fetchTemplates()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' })
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

      if (!response.ok) throw new Error('Failed to update contract')
      fetchContracts()
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update contract', variant: 'destructive' })
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

  const activeTemplate = templates.find(t => t.isActive)

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
      <div className="mb-8 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
          <FileCheck className="h-10 w-10 text-emerald-600" />
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Vendor Agreements
          </h1>
        </div>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Manage individual vendor contracts and the global service agreement.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 shadow-sm border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="assigned" className="space-y-8">
        <TabsList className="grid w-full max-w-lg grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <TabsTrigger value="assigned" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Vendor Specific</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Global Agreement</TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-0">
          <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">Assigned Contracts</CardTitle>
                <CardDescription>
                  Upload and track contracts signed by specific vendors.
                </CardDescription>
              </div>
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 px-6"
              >
                <Upload className="h-4 w-4 mr-2" />
                New Upload
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    placeholder="Search by vendor name, email, or filename..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  >
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
                        <FileText className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {contract.fileName}
                          </h3>
                          <Badge variant={contract.isActive ? 'default' : 'secondary'} className="rounded-full px-3">
                            {contract.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="rounded-full">
                            v{contract.version}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          {contract.vendor?.name} <span className="text-gray-400 font-normal ml-1">({contract.vendor?.email})</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5" /> {formatFileSize(contract.fileSize)}</span>
                          <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(contract.uploadedAt)}</span>
                          {contract.expiresAt && <span className="flex items-center gap-1.5 text-orange-600"><AlertCircle className="h-3.5 w-3.5" /> Expires: {formatDate(contract.expiresAt)}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl h-10 w-10"
                        onClick={() => window.open(contract.contractUrl, '_blank')}
                      >
                        <Download className="h-4.5 w-4.5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl h-10 w-10"
                        onClick={() => toggleContractStatus(contract.id, !contract.isActive)}
                        disabled={mutatingContractId === contract.id}
                      >
                        {contract.isActive ? (
                          <AlertCircle className="h-4.5 w-4.5 text-orange-500" />
                        ) : (
                          <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-xl h-10 w-10 hover:bg-red-50 hover:text-red-600"
                        onClick={() => deleteContract(contract.id)}
                        disabled={mutatingContractId === contract.id}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredContracts.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No contracts found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">Try a different search or upload a new contract for a vendor.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-md overflow-hidden bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
                <CardHeader className="bg-emerald-600 text-white pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <FileCheck className="h-6 w-6" />
                        Active Service Agreement
                      </CardTitle>
                      <CardDescription className="text-emerald-100">
                        This is the primary contract downloaded by vendors during registration.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="-mt-6 pt-0 px-6">
                  {activeTemplate ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="h-32 w-32 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl flex items-center justify-center border-4 border-emerald-100 dark:border-emerald-900">
                          <FileText className="h-16 w-16 text-emerald-600" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                              {activeTemplate.title}
                            </h3>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none rounded-full px-4">
                              Current Active
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                            {activeTemplate.description || 'No description provided for this agreement.'}
                          </p>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <Button 
                              onClick={() => window.open(activeTemplate.fileUrl, '_blank')}
                              className="bg-gray-900 hover:bg-gray-800 text-white px-8 rounded-xl h-12"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View Contract
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setTemplateDialogOpen(true)}
                              className="border-gray-200 rounded-xl h-12 px-8"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Replace with New
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
                         <div className="text-center">
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Version</p>
                           <p className="text-lg font-bold text-gray-900 dark:text-white">v{activeTemplate.version}</p>
                         </div>
                         <div className="text-center">
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">File Name</p>
                           <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[120px] mx-auto">{activeTemplate.fileName}</p>
                         </div>
                         <div className="text-center">
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">File Size</p>
                           <p className="text-lg font-bold text-gray-900 dark:text-white">{formatFileSize(activeTemplate.fileSize || 0)}</p>
                         </div>
                         <div className="text-center">
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Published</p>
                           <p className="text-lg font-bold text-gray-900 dark:text-white">{formatDate(activeTemplate.uploadedAt)}</p>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <div className="h-20 w-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Agreement</h3>
                      <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        There is no global service agreement set. Vendors will not be able to download any contract during registration.
                      </p>
                      <Button 
                        onClick={() => setTemplateDialogOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 h-12 px-10 rounded-xl"
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        Upload Primary Agreement
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Version History (Collapsed/Small) */}
              {templates.length > 1 && (
                <Card className="border-none bg-gray-50 dark:bg-gray-900 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Template History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {templates.filter(t => !t.isActive).map(template => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl text-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-700 dark:text-gray-300">v{template.version} - {template.title}</p>
                            <p className="text-xs text-gray-400">{formatDate(template.uploadedAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(template.fileUrl, '_blank')}>
                             <Download className="h-4 w-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-red-500"
                             onClick={() => deleteTemplate(template.id)}
                             disabled={mutatingContractId === template.id}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-md bg-emerald-50 dark:bg-emerald-950/20">
                <CardHeader>
                  <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    How it works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">
                  <p>
                    The <strong>Active Service Agreement</strong> is a global document. When a new vendor signs up, they are required to download this specific file.
                  </p>
                  <p>
                    Replacing the active contract will automatically deactivate the old version. Only the most recently uploaded "Active" contract is shown to registering vendors.
                  </p>
                  <p className="font-bold text-emerald-900 dark:text-emerald-100">
                    Important:
                  </p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Use PDF format for best compatibility.</li>
                    <li>The version number is automatically managed.</li>
                    <li>Vendors cannot finish registration without signing this document.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog (Assigned) */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Assign Contract</DialogTitle>
            <DialogDescription>
              Upload a signed document for a specific vendor partner.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="vendor" className="font-bold">Select Vendor Partner *</Label>
              <select
                id="vendor"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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
              <Label htmlFor="file" className="font-bold">Contract File *</Label>
              <div className="relative">
                 <Input
                  id="file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="h-12 pt-3"
                />
              </div>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                PDF, DOC, DOCX • MAX 10MB
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt" className="font-bold">Expiration Date</Label>
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="h-12 bg-gray-50 border-none rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !selectedVendorId}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-8 flex-1"
            >
              {uploading ? 'Processing...' : 'Assign Contract'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Upload Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Global Agreement</DialogTitle>
            <DialogDescription>
              Uploading a new contract will replace the current active agreement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateTitle" className="font-bold">Agreement Title *</Label>
              <Input
                id="templateTitle"
                placeholder="e.g. Master Service Agreement 2024"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                className="h-12 bg-gray-50 border-none rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDesc" className="font-bold">Summary of Changes</Label>
              <Textarea
                id="templateDesc"
                placeholder="What has changed in this version? (Optional)"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                className="bg-gray-50 border-none rounded-xl min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateFile" className="font-bold">Agreement PDF *</Label>
              <Input
                id="templateFile"
                type="file"
                accept=".pdf"
                onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                className="h-12 pt-3"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-xl h-12" onClick={() => setTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleTemplateUpload}
              disabled={uploading || !templateFile || !templateTitle}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 px-8 flex-1"
            >
              {uploading ? 'Publish Agreement' : 'Publish & Replace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
