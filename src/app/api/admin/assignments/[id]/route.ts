import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
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

    const body = await request.json()
    const { vendorId } = body

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      )
    }

    // Check if vendor exists
    const vendor = await db.user.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await db.serviceAssignment.create({
      data: {
        serviceRequestId: id,
        vendorId,
        status: 'ASSIGNED',
      },
    })

    // Get service request to use its preferred date for scheduling
    const serviceRequestForDate = await db.serviceRequest.findUnique({
      where: { id },
    })

    // Update service request status
    await db.serviceRequest.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
        scheduledDate: serviceRequestForDate?.preferredDate || new Date(),
      },
    })

    // Get service request for notification
    const serviceRequest = await db.serviceRequest.findUnique({
      where: { id },
      include: {
        service: {
          select: { name: true },
        },
      },
    })

    // Create notification for vendor
    await db.notification.create({
      data: {
        userId: vendorId,
        title: 'New Service Assigned',
        message: `You have been assigned a new service: ${serviceRequest?.service?.name || 'Custom Service'}`,
        type: 'INFO',
        relatedEntityType: 'ASSIGNMENT',
        relatedEntityId: assignment.id,
      },
    })

    // Create notification for client
    if (serviceRequest?.userId) {
      await db.notification.create({
        data: {
          userId: serviceRequest.userId,
          title: 'Service Assigned',
          message: `Your service has been assigned to a vendor. It will be completed on the scheduled date.`,
          type: 'SUCCESS',
          relatedEntityType: 'SERVICE_REQUEST',
          relatedEntityId: id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Service assigned successfully',
    })
  } catch (error) {
    console.error('Failed to assign service:', error)
    return NextResponse.json(
      { error: 'Failed to assign service' },
      { status: 500 }
    )
  }
}
