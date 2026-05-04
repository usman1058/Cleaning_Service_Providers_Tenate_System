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

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const receipts = await db.receipt.findMany({
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
        uploader: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedReceipts = receipts.map(receipt => ({
      id: receipt.id,
      serviceName: receipt.serviceRequest.service?.name || 'Custom Service',
      clientName: receipt.serviceRequest.name || receipt.uploader?.name || 'Unknown',
      clientEmail: receipt.serviceRequest.email || receipt.uploader?.email || 'Unknown',
      fileUrl: receipt.fileUrl,
      fileName: receipt.fileName,
      status: receipt.status,
      uploadedAt: receipt.createdAt.toISOString(),
      reviewedAt: receipt.reviewedAt?.toISOString(),
      reviewedBy: receipt.reviewedBy,
      adminRemarks: receipt.adminRemarks || undefined,
      serviceRequestId: receipt.serviceRequestId,
    }))

    return NextResponse.json(formattedReceipts)
  } catch (error) {
    console.error('Failed to fetch admin receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    )
  }
}
