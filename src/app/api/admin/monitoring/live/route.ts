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

    // Get in-progress assignments
    const assignments = await db.serviceAssignment.findMany({
      where: {
        status: {
          in: ['ASSIGNED', 'IN_PROGRESS'],
        },
      },
      include: {
        serviceRequest: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
        vendor: {
          select: {
            name: true,
            vendorProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedServices = assignments.map(assignment => ({
      id: assignment.id,
      serviceName: assignment.serviceRequest.service?.name || 'Custom Service',
      vendorName: assignment.vendor.vendorProfile?.companyName || assignment.vendor.name || 'Unknown',
      clientName: assignment.serviceRequest.name,
      location: assignment.serviceRequest.location,
      status: assignment.status,
      startedAt: assignment.createdAt.toISOString(),
      scheduledDate: assignment.serviceRequest.scheduledDate?.toISOString() || assignment.serviceRequest.preferredDate?.toISOString() || new Date().toISOString(),
      images: [], // Images feature not yet implemented
    }))

    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error('Failed to fetch monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}
