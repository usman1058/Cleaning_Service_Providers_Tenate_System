import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get assignment
    const assignment = await db.serviceAssignment.findUnique({
      where: { id },
      include: {
        serviceRequest: true,
        vendor: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Update assignment status
    await db.serviceAssignment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    })

    // Update service request status
    await db.serviceRequest.update({
      where: { id: assignment.serviceRequestId },
      data: {
        status: 'COMPLETED',
      },
    })

    // Create notification for vendor
    await db.notification.create({
      data: {
        userId: assignment.vendorId,
        title: 'Service Completed',
        message: 'Your service has been marked as complete by admin.',
        type: 'SUCCESS',
        relatedEntityType: 'ASSIGNMENT',
        relatedEntityId: id,
      },
    })

    // Create notification for client
    if (assignment.serviceRequest.userId) {
      await db.notification.create({
        data: {
          userId: assignment.serviceRequest.userId,
          title: 'Service Completed',
          message: 'Your cleaning service has been completed successfully. Thank you for choosing Global Green Services!',
          type: 'SUCCESS',
          relatedEntityType: 'SERVICE_REQUEST',
          relatedEntityId: assignment.serviceRequestId,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Service completed successfully',
    })
  } catch (error) {
    console.error('Failed to complete service:', error)
    return NextResponse.json(
      { error: 'Failed to complete service' },
      { status: 500 }
    )
  }
}
