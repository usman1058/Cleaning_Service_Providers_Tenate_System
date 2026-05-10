import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, title, message } = body

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      )
    }

    // Create notification for vendor
    await db.notification.create({
      data: {
        userId,
        title: title || 'Message from Admin',
        message: message,
        type: 'INFO',
        relatedEntityType: 'ADMIN_MESSAGE',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
