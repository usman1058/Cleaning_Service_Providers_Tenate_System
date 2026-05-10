import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const assignment = await db.serviceAssignment.findUnique({
      where: { id },
      include: {
        serviceRequest: {
          include: {
            service: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
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
            vendorApplications: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              select: {
                phone: true,
              }
            }
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Failed to fetch monitoring detail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring detail' },
      { status: 500 }
    )
  }
}
