import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const vendorId = session.user.id

    // Get vendor profile
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: vendorId },
    })

    if (!vendorProfile) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      )
    }

    // Get assignment counts
    const [assignedJobs, inProgress, completed, cancelled] = await Promise.all([
      db.serviceAssignment.count({
        where: {
          vendorId,
          status: 'ASSIGNED',
        },
      }),
      db.serviceAssignment.count({
        where: {
          vendorId,
          status: 'IN_PROGRESS',
        },
      }),
      db.serviceAssignment.count({
        where: {
          vendorId,
          status: 'COMPLETED',
        },
      }),
      db.serviceAssignment.count({
        where: {
          vendorId,
          status: 'CANCELLED',
        },
      }),
    ])

    // Get recent completed assignments (last 5)
    const recentCompleted = await db.serviceAssignment.findMany({
      where: {
        vendorId,
        status: 'COMPLETED',
      },
      include: {
        serviceRequest: {
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 5,
    })

    // Calculate earnings (average job completion * jobs completed)
    const averageJobPrice = 150 // Use actual pricing from assignments in production
    const totalEarnings = completed * averageJobPrice

    // Calculate monthly earnings (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyCompleted = await db.serviceAssignment.count({
      where: {
        vendorId,
        status: 'COMPLETED',
        completedAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const monthlyEarnings = monthlyCompleted * averageJobPrice

    const stats = {
      assignedJobs,
      inProgress,
      completed,
      cancelled,
      totalEarnings,
      monthlyEarnings,
      recentAssignments: recentCompleted.map((assignment) => ({
        id: assignment.id,
        serviceName: assignment.serviceRequest.service?.name || 'Custom Service',
        status: assignment.status,
        completedAt: assignment.completedAt?.toISOString() || null,
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch vendor stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
