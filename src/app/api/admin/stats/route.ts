import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [
      totalServices,
      pendingReceipts,
      activeVendors,
      ongoingJobs,
      pendingVendorApplications,
      totalClients,
      completedJobs,
      openTickets,
      pendingReviewTickets,
      resolvedTickets,
    ] = await Promise.all([
      db.service.count({ where: { isActive: true } }),
      db.receipt.count({ where: { status: 'PENDING' } }),
      db.vendorProfile.count({ where: { status: 'APPROVED' } }),
      db.serviceAssignment.count({
        where: {
          status: {
            in: ['ASSIGNED', 'IN_PROGRESS'],
          },
        },
      }),
      db.vendorApplication.count({
        where: { status: 'PENDING' },
      }),
      db.user.count({ where: { role: 'CLIENT' } }),
      db.serviceRequest.count({
        where: { status: 'COMPLETED' },
      }),
      db.ticket.count({ where: { status: 'OPEN' } }),
      db.ticket.count({ where: { status: 'IN_REVIEW' } }),
      db.ticket.count({
        where: {
          status: {
            in: ['RESOLVED', 'CLOSED'],
          },
        },
      }),
    ])

    // Calculate monthly revenue (sum of completed services this month)
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const completedThisMonth = await db.serviceRequest.count({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          gte: firstDayOfMonth,
        },
      },
    })

    // Estimate monthly revenue (you can enhance this with actual pricing data)
    const monthlyRevenue = completedThisMonth * 150 // Average revenue per job

    return NextResponse.json({
      totalServices,
      pendingReceipts,
      activeVendors,
      ongoingJobs,
      pendingVendorApplications,
      totalClients,
      completedJobs,
      monthlyRevenue,
      openTickets,
      pendingReviewTickets,
      resolvedTickets,
    })
  } catch (error) {
    console.error('Failed to fetch admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
