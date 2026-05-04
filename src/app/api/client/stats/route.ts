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

    const userId = session.user.id

    const [totalServices, activeServices, completedServices, services] = await Promise.all([
      db.serviceRequest.count({
        where: { userId },
      }),
      db.serviceRequest.count({
        where: { userId, status: 'ASSIGNED' },
      }),
      db.serviceRequest.count({
        where: { userId, status: 'COMPLETED' },
      }),
      db.serviceRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          service: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    const recentServices = services.map((service: any) => ({
      id: service.id,
      serviceName: service.service.name,
      status: service.status,
      scheduledDate: service.scheduledDate?.toISOString(),
      createdAt: service.createdAt.toISOString(),
      location: service.location,
    }))

    const totalSpent = services.reduce((sum: number, s: any) => {
      if (s.status === 'COMPLETED') {
        return sum + (s.service?.startingPrice || 0)
      }
      return sum
    }, 0)

    const stats = {
      totalServices,
      activeServices,
      completedServices,
      upcomingServices: services.filter((s: any) => s.status === 'ASSIGNED').length,
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      satisfactionRate: 98, // Would come from ratings
      recentServices,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch client stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
