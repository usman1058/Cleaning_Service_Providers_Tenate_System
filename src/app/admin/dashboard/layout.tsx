import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout'

export default function AdminDashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>
}
