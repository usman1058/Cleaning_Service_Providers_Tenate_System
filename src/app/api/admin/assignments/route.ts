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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [assignments, total] = await Promise.all([
      db.serviceAssignment.findMany({
        where,
        include: {
          serviceRequest: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              service: {
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              vendorProfile: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.serviceAssignment.count({ where }),
    ])

    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      status: assignment.status,
      vendorNotes: assignment.vendorNotes,
      completedAt: assignment.completedAt,
      createdAt: assignment.createdAt,
      serviceRequest: {
        id: assignment.serviceRequest.id,
        name: assignment.serviceRequest.name,
        email: assignment.serviceRequest.email,
        phone: assignment.serviceRequest.phone,
        location: assignment.serviceRequest.location,
        preferredDate: assignment.serviceRequest.preferredDate,
        preferredTime: assignment.serviceRequest.preferredTime,
        status: assignment.serviceRequest.status,
        scheduledDate: assignment.serviceRequest.scheduledDate,
        user: assignment.serviceRequest.user,
        service: assignment.serviceRequest.service,
      },
      vendor: {
        id: assignment.vendor.id,
        name: assignment.vendor.name,
        email: assignment.vendor.email,
        companyName: assignment.vendor.vendorProfile?.companyName,
      },
    }))

    return NextResponse.json({
      assignments: formattedAssignments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}
