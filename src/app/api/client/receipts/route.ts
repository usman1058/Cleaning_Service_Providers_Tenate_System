import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const receipts = await db.receipt.findMany({
      where: {
        uploadedBy: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Fetch service requests separately
    const serviceRequestIds = receipts
      .filter(r => r.serviceRequestId)
      .map(r => r.serviceRequestId!)
    
    const serviceRequests = await db.serviceRequest.findMany({
      where: {
        id: { in: serviceRequestIds },
      },
      include: {
        service: {
          select: {
            name: true,
          },
        },
      },
    })
    
    const serviceRequestMap = new Map(serviceRequests.map(sr => [sr.id, sr]))

    const formattedReceipts = receipts.map(receipt => {
      const sr = receipt.serviceRequestId ? serviceRequestMap.get(receipt.serviceRequestId) : null
      return {
        id: receipt.id,
        serviceName: sr?.service?.name || 'Custom Service',
        fileUrl: receipt.fileUrl,
        fileName: receipt.fileName,
        status: receipt.status,
        uploadedAt: receipt.createdAt.toISOString(),
        reviewedAt: receipt.reviewedAt?.toISOString(),
        adminRemarks: receipt.adminRemarks || undefined,
      }
    })

    return NextResponse.json(formattedReceipts)
  } catch (error) {
    console.error('Failed to fetch receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
      { status: 500 }
    )
  }
}
