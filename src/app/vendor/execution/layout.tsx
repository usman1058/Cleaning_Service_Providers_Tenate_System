import { VendorDashboardLayout } from '@/components/vendor/vendor-dashboard-layout'

export default function VendorExecutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <VendorDashboardLayout>{children}</VendorDashboardLayout>
}
