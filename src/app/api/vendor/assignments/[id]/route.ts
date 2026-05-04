import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const assignment = await db.serviceAssignment.findUnique({
      where: { id },
      include: {
        serviceRequest: {
          include: {
            service: {
              select: {
                name: true,
                description: true,
                startingPrice: true,
              },
            },
          },
        },
      },
    })

    if (!assignment || assignment.vendorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      )
    }

    const formattedAssignment = {
      id: assignment.id,
      serviceName: assignment.serviceRequest.service?.name || 'Custom Service',
      serviceDescription: assignment.serviceRequest.service?.description,
      servicePrice: assignment.serviceRequest.service?.startingPrice || 0,
      clientName: assignment.serviceRequest.name,
      location: assignment.serviceRequest.location,
      preferredDate: assignment.serviceRequest.preferredDate?.toISOString() || new Date().toISOString(),
      preferredTime: assignment.serviceRequest.preferredTime,
      scheduledDate: assignment.serviceRequest.scheduledDate?.toISOString(),
      status: assignment.status,
      vendorNotes: assignment.vendorNotes,
    }

    return NextResponse.json(formattedAssignment)
  } catch (error) {
    console.error('Failed to fetch assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}
