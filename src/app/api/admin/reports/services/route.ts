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

    const assignments = await db.serviceAssignment.findMany({
      where: {
        status: 'COMPLETED',
      },
      include: {
        serviceRequest: {
          include: {
            service: {
              select: {
                name: true,
                startingPrice: true,
              },
            },
          },
        },
        vendor: {
          include: {
            vendorProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
      take: 20,
    })

    const formattedServices = assignments.map(assignment => ({
      id: assignment.id,
      serviceName: assignment.serviceRequest.service?.name || 'Custom Service',
      clientName: assignment.serviceRequest.name,
      vendorName: assignment.vendor.vendorProfile?.companyName || assignment.vendor.name || 'Unknown',
      completedDate: assignment.completedAt?.toISOString(),
      value: assignment.serviceRequest.service?.startingPrice || 150, // Default if custom service
    }))

    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error('Failed to fetch service reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service reports' },
      { status: 500 }
    )
  }
}
