import { VendorDashboardLayout } from '@/components/vendor/vendor-dashboard-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <VendorDashboardLayout>{children}</VendorDashboardLayout>
}
