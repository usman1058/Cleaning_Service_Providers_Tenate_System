'use client'

import { ClientDashboardLayout } from '@/components/client/client-dashboard-layout'

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>
}
