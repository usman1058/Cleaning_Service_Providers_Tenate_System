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

    const assignments = await db.serviceAssignment.findMany({
      where: {
        vendorId: session.user.id,
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
      take: 50,
    })

    const formattedJobs = assignments.map(assignment => ({
      id: assignment.id,
      serviceName: assignment.serviceRequest.service?.name || 'Custom Service',
      location: assignment.serviceRequest.location,
      scheduledDate: assignment.serviceRequest.scheduledDate?.toISOString() || assignment.serviceRequest.preferredDate?.toISOString() || new Date().toISOString(),
      completedDate: assignment.completedAt?.toISOString(),
    }))

    return NextResponse.json(formattedJobs)
  } catch (error) {
    console.error('Failed to fetch vendor history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
