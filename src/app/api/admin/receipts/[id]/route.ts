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

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, remarks } = body // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'

    // Update receipt
    const receipt = await db.receipt.update({
      where: { id },
      data: {
        status: newStatus,
        adminRemarks: remarks || null,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
      },
      include: {
        serviceRequest: true,
      },
    })

    // If approved, update service request status
    if (action === 'approve') {
      await db.serviceRequest.update({
        where: { id: receipt.serviceRequestId },
        data: { status: 'VERIFIED' },
      })

      // Create notification for client
      await db.notification.create({
        data: {
          userId: receipt.serviceRequest.userId || '',
          title: 'Receipt Verified',
          message: `Your payment receipt for ${receipt.serviceRequest.serviceId || 'Custom Service'} has been verified. Your service is now approved.`,
          type: 'SUCCESS',
          relatedEntityType: 'RECEIPT',
          relatedEntityId: receipt.id,
        },
      })
    } else {
      // If rejected, notify client
      await db.notification.create({
        data: {
          userId: receipt.serviceRequest.userId || '',
          title: 'Receipt Verification Failed',
          message: `Your payment receipt could not be verified. Please upload a valid receipt or contact support for assistance.`,
          type: 'ERROR',
          relatedEntityType: 'RECEIPT',
          relatedEntityId: receipt.id,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `Receipt ${newStatus.toLowerCase()} successfully`,
    })
  } catch (error) {
    console.error('Failed to process receipt:', error)
    return NextResponse.json(
      { error: 'Failed to process receipt' },
      { status: 500 }
    )
  }
}
