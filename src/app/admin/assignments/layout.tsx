import { AdminDashboardLayout } from '@/components/admin/admin-dashboard-layout'

export default function AdminAssignmentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminDashboardLayout>{children}</AdminDashboardLayout>
}
