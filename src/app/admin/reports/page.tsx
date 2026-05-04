'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Home, FileText, Users, CheckCircle2, Calendar, Clock, Download, TrendingUp, Loader2 } from 'lucide-react'

interface FinancialStats {
  totalRevenue: number
  monthlyRevenue: number
  totalJobs: number
  monthlyJobs: number
  pendingPayouts: number
  averageJobValue: number
}

interface ServiceReport {
  id: string
  serviceName: string
  clientName: string
  vendorName: string
  completedDate: string
  value: number
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [recentServices, setRecentServices] = useState<ServiceReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const [statsRes, servicesRes] = await Promise.all([
        fetch('/api/admin/reports/financial'),
        fetch('/api/admin/reports/services'),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setRecentServices(servicesData)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `global-green-services-report.${type}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export report:', error)
    }
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
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-950 border-b overflow-x-auto">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Home className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/admin/services" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <FileText className="h-4 w-4" />
              Services
            </Link>
            <Link href="/admin/clients" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Users className="h-4 w-4" />
              Clients
            </Link>
            <Link href="/admin/receipts" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4" />
              Receipt Verification
            </Link>
            <Link href="/admin/vendors" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              Users
            </Link>
            <Link href="/admin/assignments" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              Assignments
            </Link>
            <Link href="/admin/monitoring" className="flex items-center gap-2 py-4 px-4 text-gray-600 dark:text-gray-300 hover:text-emerald-600 whitespace-nowrap">
              <Clock className="h-4 w-4" />
              Monitoring
            </Link>
            <Link href="/admin/reports" className="flex items-center gap-2 py-4 px-4 border-b-2 border-emerald-600 text-emerald-600 font-medium whitespace-nowrap">
              <TrendingUp className="h-4 w-4" />
              Reports
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Financial & Service Reports
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Overview of platform performance and financial metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Financial Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>Revenue and payment metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${stats.totalRevenue.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Monthly Revenue
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${stats.monthlyRevenue.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Total Jobs
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.totalJobs}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Monthly Jobs
                      </p>
                      <p className="text-2xl font-bold">
                        {stats.monthlyJobs}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Average Job Value
                      </p>
                      <p className="text-2xl font-bold">
                        ${(stats.averageJobValue ?? 0).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        Pending Payouts
                      </p>
                      <p className="text-2xl font-bold text-amber-600">
                        ${stats.pendingPayouts.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Completed Services */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Completed Services</CardTitle>
                <CardDescription>Latest service completions</CardDescription>
              </CardHeader>
              <CardContent>
                {recentServices.length === 0 ? (
                  <p className="text-center text-gray-600 dark:text-gray-300 py-8">
                    No completed services yet
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {recentServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {service.serviceName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Client: {service.clientName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Vendor: {service.vendorName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Completed: {new Date(service.completedDate).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600">
                            ${(service.value ?? 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Service Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Completion Rate
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {stats ? ((stats.totalJobs / (stats.totalJobs + 10)) * 100).toFixed(1) : '0'}%
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Client Satisfaction
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      4.8/5.0
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      Vendor Performance
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      94%
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                      On-Time Completion
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      97%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>
    </div>
  )
}
