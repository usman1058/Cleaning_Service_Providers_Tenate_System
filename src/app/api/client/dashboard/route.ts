import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const [activeServices, pendingVerification, completedServices] = await Promise.all([
      db.serviceRequest.count({
        where: {
          userId,
          status: { in: ['ASSIGNED', 'IN_PROGRESS', 'VERIFIED'] },
        },
      }),
      db.serviceRequest.count({
        where: {
          userId,
          status: 'PENDING_VERIFICATION',
        },
      }),
      db.serviceRequest.count({
        where: {
          userId,
          status: 'COMPLETED',
        },
      }),
    ])

    return NextResponse.json({
      activeServices,
      pendingVerification,
      completedServices,
    })
  } catch (error) {
    console.error('Failed to fetch client dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
