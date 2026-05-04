import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()

    const {
      name,
      email,
      phone,
      description,
      location,
      preferredDate,
      preferredTime,
      budget,
    } = body

    if (!name || !email || !phone || !description || !location || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Create a service request for custom services
    const serviceRequestData: any = {
      serviceId: undefined, // Empty for custom services
      name,
      email,
      phone,
      location,
      preferredDate: new Date(preferredDate),
      preferredTime,
      additionalNotes: `Custom Service Request:\n\nDescription: ${description}\nBudget: ${budget || 'Not specified'}`,
      status: 'PENDING_VERIFICATION',
    }
    
    if (session?.user?.id) {
      serviceRequestData.userId = session.user.id
    }
    
    const serviceRequest = await db.serviceRequest.create({
      data: serviceRequestData,
    })

    // Create notification for admin
    await db.notification.create({
      data: {
        userId: 'admin', // This would be the admin user ID
        title: 'New Custom Service Request',
        message: `Custom service request from ${name}. Check dashboard for details.`,
        type: 'INFO',
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: serviceRequest.id,
      },
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
