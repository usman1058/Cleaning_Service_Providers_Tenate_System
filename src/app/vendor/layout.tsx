'use client'

import { VendorDashboardLayout } from '@/components/vendor/vendor-dashboard-layout'

export default function VendorRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <VendorDashboardLayout>{children}</VendorDashboardLayout>
}
