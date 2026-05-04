import { ClientDashboardLayout } from '@/components/client/client-dashboard-layout'

export default function ClientTrackingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientDashboardLayout>{children}</ClientDashboardLayout>
}
