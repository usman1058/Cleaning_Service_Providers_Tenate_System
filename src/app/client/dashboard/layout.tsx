import { ClientDashboardLayout } from '@/components/client/client-dashboard-layout'

export default function ClientDashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>
}
