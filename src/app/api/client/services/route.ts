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

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
    }

    const services = await db.serviceRequest.findMany({
      where,
      include: {
        service: {
          select: {
            name: true,
            description: true,
          },
        },
        receipt: {
          select: {
            status: true,
            fileUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    const formattedServices = services.map(service => ({
      id: service.id,
      serviceName: service.service?.name || 'Custom Service',
      serviceDescription: service.service?.description,
      status: service.status,
      scheduledDate: service.scheduledDate?.toISOString(),
      preferredDate: service.preferredDate?.toISOString() || new Date().toISOString(),
      preferredTime: service.preferredTime,
      location: service.location,
      createdAt: service.createdAt.toISOString(),
      receiptStatus: service.receipt?.status,
    }))

    return NextResponse.json(formattedServices)
  } catch (error) {
    console.error('Failed to fetch client services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}
