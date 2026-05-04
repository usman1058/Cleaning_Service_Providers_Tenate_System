import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId, email, phone } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    const booking = await db.serviceRequest.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.userId) {
      return NextResponse.json(
        { error: 'This booking is already linked to an account' },
        { status: 400 }
      )
    }

    if (!booking.userId && booking.email !== email && booking.phone !== phone) {
      return NextResponse.json(
        { error: 'Email or phone does not match booking details' },
        { status: 400 }
      )
    }

    const updatedBooking = await db.serviceRequest.update({
      where: { id: bookingId },
      data: {
        userId: session.user.id,
        name: session.user.name || booking.name,
        email: session.user.email || email,
      },
    })

    await db.notification.create({
      data: {
        userId: session.user.id,
        title: 'Booking Linked to Your Account',
        message: `Your booking for ${booking.service?.name || 'Custom Service'} has been successfully linked to your account.`,
        type: 'SUCCESS',
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: bookingId,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Booking successfully linked to your account',
      booking: {
        id: updatedBooking.id,
        serviceName: booking.service?.name || 'Custom Service',
        status: updatedBooking.status,
      },
    })
  } catch (error) {
    console.error('Failed to link booking:', error)
    return NextResponse.json(
      { error: 'Failed to link booking' },
      { status: 500 }
    )
  }
}
