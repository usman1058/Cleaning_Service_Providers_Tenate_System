import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      serviceId,
      name,
      email,
      phone,
      location,
      preferredDate,
      preferredTime,
      additionalNotes,
    } = body

    // Handle location - could be a string or an object
    let locationString = location
    if (typeof location === 'object' && location !== null) {
      const { address, city, state, zipCode } = location
      locationString = [address, city, state, zipCode]
        .filter(part => part && part.trim())
        .join(', ')
    }

    if (!serviceId || !name || !email || !phone || !locationString || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Validate service exists
    const service = await db.service.findUnique({
      where: { id: serviceId, isActive: true },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Create service request
    const serviceRequestData: any = {
      serviceId,
      name,
      email,
      phone,
      location: locationString,
      preferredDate: new Date(preferredDate),
      preferredTime,
      additionalNotes,
      status: 'PENDING_VERIFICATION',
    }
    
    if (session?.user?.id) {
      serviceRequestData.userId = session.user.id
    }
    
    const serviceRequest = await db.serviceRequest.create({
      data: serviceRequestData,
    })

    return NextResponse.json({
      id: serviceRequest.id,
      message: 'Service request created successfully',
    })
  } catch (error) {
    console.error('Failed to create service request:', error)
    return NextResponse.json(
      { error: 'Failed to create service request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
