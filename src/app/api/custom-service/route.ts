import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      phone,
      location,
      preferredDate,
      preferredTime,
      description,
    } = body

    if (!name || !email || !phone || !location || !description) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Create a custom service request as a service request with special notes
    const serviceRequest = await db.serviceRequest.create({
      data: {
        serviceId: undefined, // Empty service ID indicates custom request
        name,
        email,
        phone,
        location,
        preferredDate: preferredDate ? new Date(preferredDate) : undefined,
        preferredTime: preferredTime || '',
        additionalNotes: `CUSTOM SERVICE REQUEST:\n\n${description}`,
        status: 'PENDING_VERIFICATION',
      } as any,
    })

    return NextResponse.json({
      id: serviceRequest.id,
      message: 'Custom service request submitted successfully',
    })
  } catch (error) {
    console.error('Failed to create custom service request:', error)
    return NextResponse.json(
      { error: 'Failed to submit custom service request' },
      { status: 500 }
    )
  }
}
