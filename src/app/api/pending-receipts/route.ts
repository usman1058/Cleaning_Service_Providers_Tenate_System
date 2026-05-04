import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let bookings: any[] = []

    if (session.user.role === 'ADMIN') {
      // Admin can see all bookings without receipts
      bookings = await db.serviceRequest.findMany({
        where: {
          status: {
            in: ['COMPLETED', 'VERIFIED'],
          },
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              startingPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
      // Other users can only see their own bookings
      bookings = await db.serviceRequest.findMany({
        where: {
          userId: session.user.id,
          status: {
            in: ['COMPLETED', 'VERIFIED'],
          },
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              startingPrice: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }

    // Filter out bookings that already have receipts
    const bookingsWithoutReceipts: typeof bookings = []

    for (const booking of bookings) {
      const receipt = await db.receipt.findUnique({
        where: { serviceRequestId: booking.id },
      })

      if (!receipt) {
        bookingsWithoutReceipts.push(booking)
      }
    }

    return NextResponse.json(bookingsWithoutReceipts)
  } catch (error) {
    console.error('Failed to fetch pending receipts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending receipts' },
      { status: 500 }
    )
  }
}
