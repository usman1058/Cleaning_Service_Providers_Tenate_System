import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const defaultTemplates = [
  {
    id: 'template-booking',
    name: 'Booking Confirmation',
    title: 'Booking Confirmation',
    body: 'Dear {customerName}, your booking for {serviceName} has been confirmed...',
    type: 'BOOKING',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'template-receipt',
    name: 'Receipt Verification',
    title: 'Receipt Verified',
    body: 'Dear {vendorName}, the receipt for booking {bookingId} has been verified...',
    type: 'RECEIPT',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'template-assignment',
    name: 'Service Assigned',
    title: 'New Service Assigned',
    body: 'You have been assigned a new service: {serviceName}',
    type: 'ASSIGNMENT',
    active: true,
    createdAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(defaultTemplates)
  } catch (error) {
    console.error('Failed to fetch notification templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, message: 'Template saved (requires email service integration)' })
  } catch (error) {
    console.error('Failed to create notification template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
