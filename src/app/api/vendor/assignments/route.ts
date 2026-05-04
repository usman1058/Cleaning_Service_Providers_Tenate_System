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

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {
      vendorId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    const assignments = await db.serviceAssignment.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      serviceName: assignment.serviceRequest.service?.name || 'Custom Service',
      clientName: assignment.serviceRequest.name,
      location: assignment.serviceRequest.location,
      scheduledDate: assignment.serviceRequest.scheduledDate?.toISOString() || assignment.serviceRequest.preferredDate?.toISOString() || new Date().toISOString(),
      status: assignment.status,
      preferredDate: assignment.serviceRequest.preferredDate?.toISOString() || new Date().toISOString(),
      preferredTime: assignment.serviceRequest.preferredTime,
      vendorNotes: assignment.vendorNotes,
    }))

    return NextResponse.json(formattedAssignments)
  } catch (error) {
    console.error('Failed to fetch vendor assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}
