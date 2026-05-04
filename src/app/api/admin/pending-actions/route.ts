import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get pending receipts
    const pendingReceipts = await db.receipt.findMany({
      where: { status: 'PENDING' },
      include: {
        serviceRequest: {
          include: {
            service: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    })

    // Get pending vendor applications
    const pendingVendorApps = await db.vendorApplication.findMany({
      where: { status: 'PENDING' },
      take: 5,
      orderBy: { createdAt: 'desc' },
    })

    const actions = [
      ...pendingReceipts.map(r => ({
        id: r.id,
        type: 'receipt' as const,
        description: `Payment receipt verification for ${r.serviceRequest.service?.name || 'Custom Service'}`,
        createdAt: r.createdAt.toISOString(),
      })),
      ...pendingVendorApps.map(v => ({
        id: v.id,
        type: 'vendor' as const,
        description: `Vendor application from ${v.businessName}`,
        createdAt: v.createdAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(actions)
  } catch (error) {
    console.error('Failed to fetch pending actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending actions' },
      { status: 500 }
    )
  }
}
