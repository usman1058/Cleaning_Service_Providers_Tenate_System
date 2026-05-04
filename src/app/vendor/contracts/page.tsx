'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, FileText, Download, ExternalLink, AlertCircle } from 'lucide-react'

interface Contract {
  id: string
  contractUrl: string
  fileName: string
  fileSize?: number
  version: number
  isActive: boolean
  uploadedAt: string
  expiresAt?: string
}

export default function VendorContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [activeOnly, setActiveOnly] = useState(true)

  useEffect(() => {
    fetchContracts()
  }, [activeOnly])

  const fetchContracts = async () => {
    try {
      const params = new URLSearchParams()
      if (activeOnly) params.append('activeOnly', 'true')
      const response = await fetch(`/api/vendor/contracts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setContracts(data)
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Contracts</h1>
        <p className="text-gray-600 dark:text-gray-400">Your vendor agreements and contracts</p>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={activeOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveOnly(true)}
          className={activeOnly ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          Active
        </Button>
        <Button
          variant={!activeOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveOnly(false)}
          className={!activeOnly ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          All
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading contracts...</p>
        </div>
      ) : contracts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No contracts</h3>
            <p className="text-gray-600 dark:text-gray-300">No contracts have been uploaded for your account.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-emerald-600" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">{contract.fileName || 'Contract'}</h4>
                      <Badge variant={contract.isActive ? 'default' : 'secondary'}>
                        {contract.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <span>Version: {contract.version}</span>
                      <span>Size: {formatFileSize(contract.fileSize)}</span>
                      <span>Uploaded: {new Date(contract.uploadedAt).toLocaleDateString()}</span>
                      {contract.expiresAt && <span>Expires: {new Date(contract.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {contract.contractUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={contract.contractUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </Button>
                    )}
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
