import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    const where: any = {
      userId: session.user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const tickets = await db.ticket.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })

    const formattedTickets = tickets.map(ticket => ({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolutionNotes: ticket.resolutionNotes || undefined,
      assignedTo: 'Support Team',
    }))

    return NextResponse.json(formattedTickets)
  } catch (error) {
    console.error('Failed to fetch client tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subject, category, description } = body

    if (!subject || !category || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const ticket = await db.ticket.create({
      data: {
        userId: session.user.id,
        category,
        subject,
        description,
        status: 'OPEN',
        priority: 'NORMAL',
      },
    })

    // Create notification for admin
    await db.notification.create({
      data: {
        userId: 'admin',
        title: 'New Client Ticket',
        message: `Client ${session.user.name} has submitted a new support ticket: ${subject}`,
        type: 'INFO',
        relatedEntityType: 'TICKET',
        relatedEntityId: ticket.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Ticket created successfully',
      ticketId: ticket.id,
    })
  } catch (error) {
    console.error('Failed to create client ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
