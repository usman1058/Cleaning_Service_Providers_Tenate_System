'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, Loader2 } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string
  userId?: string
  userName?: string
  userEmail?: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
  timestamp: string
  details?: string
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/audit-log')
      if (response.ok) {
        const data = await response.json()
        setLogs(data)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Log
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Track all system activities and changes
        </p>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading audit logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Logs Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              No audit logs have been recorded yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white mb-1">
                      {log.action} - {log.entityType}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      User: {log.userName || 'System'} ({log.userRole || 'N/A'})
                    </p>
                    {log.details && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {log.details}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
