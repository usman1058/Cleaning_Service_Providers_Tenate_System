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

    const body = await request.json()
    const { status, remarks } = body

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get receipt with service request
    const receipt = await db.receipt.findUnique({
      where: { id },
      include: {
        serviceRequest: true,
      },
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      )
    }

    // Update receipt
    await db.receipt.update({
      where: { id },
      data: {
        status,
        adminRemarks: remarks,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
    })

    // Update service request status
    const newServiceStatus = status === 'APPROVED' ? 'VERIFIED' : 'PENDING_VERIFICATION'

    await db.serviceRequest.update({
      where: { id: receipt.serviceRequestId },
      data: {
        status: newServiceStatus,
      },
    })

    // Create notification for user
    const userId = receipt.serviceRequest.userId || receipt.uploadedBy
    if (userId) {
      await db.notification.create({
        data: {
          userId,
          title: `Receipt ${status}`,
          message: remarks
            ? `Your receipt has been ${status.toLowerCase()}. ${remarks}`
            : `Your receipt has been ${status.toLowerCase()}.`,
          type: status === 'APPROVED' ? 'SUCCESS' : 'ERROR',
          relatedEntityType: 'RECEIPT',
          relatedEntityId: id,
        },
      })
    }

    return NextResponse.json({ success: true, message: 'Receipt reviewed successfully' })
  } catch (error) {
    console.error('Failed to review receipt:', error)
    return NextResponse.json(
      { error: 'Failed to review receipt' },
      { status: 500 }
    )
  }
}
