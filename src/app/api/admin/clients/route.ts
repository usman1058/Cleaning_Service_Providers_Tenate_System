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

    const clients = await db.user.findMany({
      where: {
        role: 'CLIENT',
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            serviceRequests: true,
          },
        },
        serviceRequests: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
          },
        },
      },
    })

    const formattedClients = clients.map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      totalServices: client._count.serviceRequests,
      createdAt: client.createdAt.toISOString(),
    }))

    return NextResponse.json(formattedClients)
  } catch (error) {
    console.error('Failed to fetch admin clients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}
