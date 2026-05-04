import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const serviceSlug = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceRequest = await db.serviceRequest.findFirst({
      where: {
        id: serviceSlug.id,
        userId: session.user.id,
      },
      include: {
        service: {
          select: {
            name: true,
            slug: true,
            description: true,
            startingPrice: true,
            duration: true,
            isActive: true,
          },
        },
        receipt: {
          select: {
            id: true,
            status: true,
            adminRemarks: true,
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
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(serviceRequest)
  } catch (error) {
    console.error('Failed to fetch service details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service details' },
      { status: 500 }
    )
  }
}
