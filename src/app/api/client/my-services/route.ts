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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')

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
            id: true,
            name: true,
            description: true,
            startingPrice: true,
          },
        },
        receipt: {
          select: {
            id: true,
            status: true,
            fileUrl: true,
            createdAt: true,
          },
        },
        assignment: {
          select: {
            id: true,
            status: true,
            vendor: {
              select: {
                id: true,
                name: true,
                vendorProfile: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    const formattedServices = services.map((service) => ({
      id: service.id,
      name: service.service?.name || 'Custom Service',
      description: service.service?.description,
      startingPrice: service.service?.startingPrice,
      status: service.status,
      location: service.location,
      preferredDate: service.preferredDate,
      preferredTime: service.preferredTime,
      scheduledDate: service.scheduledDate,
      additionalNotes: service.additionalNotes,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
      receipt: service.receipt,
      assignment: service.assignment,
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
