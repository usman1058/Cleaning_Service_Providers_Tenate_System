import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createGuestAuthToken } from '@/lib/guest-auth-token'
import { createNotification } from '@/lib/notification'

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
      const { houseNumber, address, city, state, zipCode } = location
      const streetLine = [houseNumber, address].filter((part: string) => part && part.trim()).join(' ')
      locationString = [streetLine, city, state, zipCode]
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
    const service = await db.service.findFirst({
      where: { id: serviceId, isActive: true },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Create service request
    let userId = session?.user?.id
    let shouldIssueGuestToken = false

    if (!userId) {
      const existingUser = await db.user.findUnique({ where: { email } })

      if (existingUser) {
        userId = existingUser.id

        const priorMatchedBooking = await db.serviceRequest.findFirst({
          where: {
            userId: existingUser.id,
            email,
            phone,
          },
          orderBy: { createdAt: 'desc' },
        })

        if (priorMatchedBooking) {
          shouldIssueGuestToken = true
        }
      } else {
        const guestUser = await db.user.create({
          data: {
            name,
            email,
            password: '',
            role: 'CLIENT',
          },
        })
        userId = guestUser.id
        shouldIssueGuestToken = true
      }
    }

    const serviceRequestData: any = {
      userId,
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
    
    const serviceRequest = await db.serviceRequest.create({
      data: serviceRequestData,
    })

    const guestAutoLoginToken = shouldIssueGuestToken
      ? createGuestAuthToken({
          userId: userId!,
          email,
          bookingId: serviceRequest.id,
        })
      : null

    await createNotification({
      userId: userId!,
      title: 'Service Request Submitted',
      message: `Your booking for ${service?.name || 'Custom Service'} has been received and is pending verification.`,
      type: 'INFO',
      relatedEntityType: 'SERVICE_REQUEST',
      relatedEntityId: serviceRequest.id,
    })

    if (shouldIssueGuestToken) {
      await createNotification({
        userId: userId!,
        title: 'Account Created',
        message: 'A new account has been created for you. Complete your profile to set a password and track your bookings.',
        type: 'SUCCESS',
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: serviceRequest.id,
      })
    }

    return NextResponse.json({
      id: serviceRequest.id,
      message: 'Service request created successfully',
      guestAutoLoginToken,
    })
  } catch (error) {
    console.error('Failed to create service request:', error)
    return NextResponse.json(
      { error: 'Failed to create service request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
