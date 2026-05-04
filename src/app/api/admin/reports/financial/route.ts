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

    // Get completed services
    const completedServices = await db.serviceRequest.count({
      where: {
        status: 'COMPLETED',
      },
    })

    // Get services completed this month
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

    // Get active vendors (approved vendors)
    const activeVendors = await db.vendorProfile.count({
      where: {
        status: 'APPROVED',
      },
    })

    // Calculate revenue (estimated)
    const totalRevenue = completedServices * 150 // Average revenue per job
    const monthlyRevenue = completedThisMonth * 150

    // Calculate average job value
    const averageJobValue = completedServices > 0 ? totalRevenue / completedServices : 0

    // Get total assignments for vendor payout calculation
    const totalAssignments = await db.serviceAssignment.count({
      where: {
        status: 'COMPLETED',
      },
    })

    // Calculate pending payouts (estimated 70% of job value to vendor)
    const pendingPayouts = totalAssignments * 150 * 0.7

    return NextResponse.json({
      totalRevenue,
      monthlyRevenue,
      totalJobs: completedServices,
      monthlyJobs: completedThisMonth,
      averageJobValue,
      pendingPayouts,
      activeVendors,
    })
  } catch (error) {
    console.error('Failed to fetch financial stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial stats' },
      { status: 500 }
    )
  }
}
