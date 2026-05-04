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

    if (!session?.user?.id || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const assignment = await db.serviceAssignment.findUnique({
      where: { id },
      include: {
        serviceRequest: true,
      },
    })

    if (!assignment || assignment.vendorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Assignment not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update assignment status
    const updateData: any = {
      status,
    }

    if (status === 'IN_PROGRESS') {
      updateData.startedAt = new Date()
    }

    await db.serviceAssignment.update({
      where: { id },
      data: updateData,
    })

    // Update service request status
    await db.serviceRequest.update({
      where: { id: assignment.serviceRequestId },
      data: {
        status: status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'ASSIGNED',
      },
    })

    // Create notification for admin
    await db.notification.create({
      data: {
        userId: 'admin',
        title: 'Service Status Updated',
        message: `Vendor has updated service status to: ${status.replace(/_/g, ' ')}`,
        type: 'INFO',
        relatedEntityType: 'ASSIGNMENT',
        relatedEntityId: id,
        },
      })

      // Create notification for client if exists
      if (assignment.serviceRequest.userId) {
        await db.notification.create({
          data: {
            userId: assignment.serviceRequest.userId,
            title: 'Service Status Update',
            message: status === 'IN_PROGRESS'
              ? 'Your cleaning service is now in progress!'
              : status === 'COMPLETED'
              ? 'Your cleaning service has been marked as complete. Awaiting admin approval.'
              : 'Your service status has been updated.',
            type: status === 'IN_PROGRESS' ? 'SUCCESS' : 'INFO',
            relatedEntityType: 'ASSIGNMENT',
            relatedEntityId: id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
    })
  } catch (error) {
    console.error('Failed to update assignment status:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
