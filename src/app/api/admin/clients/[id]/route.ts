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

    const client = await db.user.findUnique({
      where: { id },
      include: {
        serviceRequests: {
          orderBy: { createdAt: 'desc' },
          include: {
            service: true,
            assignment: {
              include: {
                vendor: {
                  include: {
                    vendorProfile: true
                  }
                }
              }
            },
            receipt: true
          }
        },
        auditLogs: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Failed to fetch client:', error)
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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

    const body = await request.json()
    const { name, email } = body

    const updatedClient = await db.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}
