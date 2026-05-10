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

    // Get verified services without assignments
    const services = await db.serviceRequest.findMany({
      where: {
        status: 'VERIFIED',
        assignment: null,
      },
      include: {
        service: {
          select: {
            name: true,
            startingPrice: true,
          },
        },
      },
      orderBy: { preferredDate: 'asc' },
    })

    const formattedServices = services.map(service => ({
      id: service.id,
      serviceName: service.service?.name || 'Custom Service',
      clientName: service.name,
      clientEmail: service.email,
      location: service.location,
      preferredDate: service.preferredDate?.toISOString() || null,
      preferredTime: service.preferredTime,
      status: service.status,
      createdAt: service.createdAt.toISOString(),
      price: service.service?.startingPrice || 0,
    }))

    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error('Failed to fetch pending assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending assignments' },
      { status: 500 }
    )
  }
}
