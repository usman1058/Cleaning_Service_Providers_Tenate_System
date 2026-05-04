import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const vendorId = id

    // Get vendor profile
    const vendorProfile = await db.vendorProfile.findUnique({
      where: { userId: vendorId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!vendorProfile) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Get vendor application
    const application = await db.vendorApplication.findUnique({
      where: { userId: vendorId },
      select: {
        businessName: true,
        email: true,
        phone: true,
      },
    })

    // Get all assignments for this vendor
    const assignments = await db.serviceAssignment.findMany({
      where: { vendorId },
      include: {
        serviceRequest: {
          include: {
            service: {
              select: {
                name: true,
                startingPrice: true,
                duration: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate metrics
    const totalJobsAssigned = assignments.length
    const jobsCompleted = assignments.filter(a => a.status === 'COMPLETED').length
    const jobsInProgress = assignments.filter(a => a.status === 'IN_PROGRESS').length
    const jobsCancelled = assignments.filter(a => a.status === 'CANCELLED').length

    // Calculate completion rate
    const completionRate = totalJobsAssigned > 0
      ? Math.round((jobsCompleted / totalJobsAssigned) * 100)
      : 0

    // Calculate on-time completion (within scheduled time + 30min buffer)
    const onTimeCompletions = assignments.filter(a => {
      if (a.status !== 'COMPLETED' || !a.serviceRequest.scheduledDate) {
        return false
      }
      const scheduled = new Date(a.serviceRequest.scheduledDate)
      const completed = new Date(a.completedAt!)
      const duration = completed.getTime() - scheduled.getTime()
      const bufferTime = 30 * 60 * 1000 // 30 minutes in milliseconds
      return duration <= (estimatedDurationToMs(a.serviceRequest.service?.duration || '2-3 hours') + bufferTime)
    }).length

    const onTimeCompletionRate = jobsCompleted > 0
      ? onTimeCompletions / jobsCompleted
      : 0

    // Calculate average job duration (in hours)
    const completedAssignments = assignments.filter(a => a.status === 'COMPLETED' && a.completedAt)
    const avgDuration = completedAssignments.length > 0
      ? completedAssignments.reduce((sum, a) => {
          const start = new Date(a.createdAt).getTime()
          const end = new Date(a.completedAt!).getTime()
          return sum + ((end - start) / (1000 * 60 * 60))
        }, 0) / completedAssignments.length
      : 0

    // Calculate earnings (average $150 per job, minus 15% platform fee)
    const averageJobPrice = 150
    const platformFeeRate = 0.15
    const totalEarnings = jobsCompleted * (averageJobPrice * (1 - platformFeeRate))

    // Calculate monthly earnings (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyCompleted = assignments.filter(a => {
      return a.status === 'COMPLETED' &&
             a.completedAt &&
             new Date(a.completedAt) >= thirtyDaysAgo
    }).length

    const monthlyEarnings = monthlyCompleted * (averageJobPrice * (1 - platformFeeRate))

    // Get recent jobs (last 10 completed)
    const recentJobs = assignments
      .filter(a => a.status === 'COMPLETED')
      .slice(0, 10)
      .map(a => ({
        id: a.id,
        serviceName: a.serviceRequest.service?.name || 'Unknown Service',
        scheduledDate: a.serviceRequest.scheduledDate,
        completedDate: a.completedAt,
        duration: a.completedAt
          ? (new Date(a.completedAt).getTime() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60)
          : null,
        onTime: a.serviceRequest.scheduledDate
          ? new Date(a.completedAt!) <= new Date(a.serviceRequest.scheduledDate.getTime() + estimatedDurationToMs(a.serviceRequest.service?.duration || '2-3 hours') + (30 * 60 * 1000))
          : false,
      }))

    // Calculate ratings (simulate for now - would need actual rating data)
    const averageRating = 4.5 // Would be calculated from actual client ratings

    // Get vendor details
    const vendorDetails = {
      id: vendorProfile.id,
      vendorName: vendorProfile.user.name,
      companyName: application?.businessName || vendorProfile.companyName,
       email: vendorProfile.user.email,
       serviceLocations: vendorProfile.serviceLocations,
       status: vendorProfile.status,
       description: vendorProfile.description,
       createdAt: vendorProfile.createdAt,
    }

    // Get services offered from serviceLocations (JSON field)
    const servicesOfferedArray = vendorProfile.serviceLocations
      ? JSON.parse(vendorProfile.serviceLocations)
      : []

    const performanceData = {
      vendor: vendorDetails,
      totalJobsAssigned,
      jobsCompleted,
      jobsInProgress,
      jobsCancelled,
      completionRate,
      onTimeCompletionRate,
      averageJobDuration: avgDuration,
      averageRating,
      totalEarnings,
      monthlyEarnings,
      recentJobs,
      servicesOffered: servicesOfferedArray,
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    console.error('Failed to fetch vendor performance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor performance' },
      { status: 500 }
    )
  }
}

// Helper function to estimate duration in ms
function estimatedDurationToMs(duration: string): number {
  if (!duration) return 2 * 60 * 60 * 1000 // Default 2 hours

  const ranges: Record<string, number> = {
    '1-2 hours': 1.5 * 60 * 60 * 1000,
    '2-3 hours': 2.5 * 60 * 60 * 1000,
    '3-4 hours': 3.5 * 60 * 60 * 1000,
    '4+ hours': 4 * 60 * 60 * 1000,
  }

  return ranges[duration] || 2 * 60 * 60 * 1000
}
