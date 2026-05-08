import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Booking confirmation API route
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('booking')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Fetch booking details
    const booking = await db.serviceRequest.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Fetch service separately
    let service: any = null
    if (booking.serviceId) {
      try {
          const serviceData = await db.service.findFirst({
            where: { id: booking.serviceId, isActive: true },
          })
        if (serviceData) {
          service = {
            id: serviceData.id,
            name: serviceData.name,
            slug: serviceData.slug,
            description: serviceData.description,
            startingPrice: serviceData.startingPrice,
            duration: serviceData.duration,
          }
        }
      } catch (e) {
        console.error('Failed to fetch service:', e)
      }
    }

    // Fetch receipt if exists
    let receipt: any = null
    if (booking.id) {
      try {
        const receiptData = await db.receipt.findUnique({
          where: { serviceRequestId: booking.id },
        })
        if (receiptData) {
          receipt = {
            id: receiptData.id,
            status: receiptData.status,
            imageUrl: receiptData.fileUrl,
            adminRemarks: receiptData.adminRemarks,
          }
        }
      } catch (e) {
        console.error('Failed to fetch receipt:', e)
      }
    }

    // Fetch assignment with vendor if exists
    let assignment: any = null
    if (booking.id) {
      try {
        const assignmentData = await db.serviceAssignment.findUnique({
          where: { serviceRequestId: booking.id },
        })
        if (assignmentData) {
          // Fetch vendor separately
          let vendor: any = null
          try {
            const vendorData = await db.user.findUnique({
              where: { id: assignmentData.vendorId },
              select: {
                id: true,
                name: true,
              },
            })
            if (vendorData) {
              vendor = vendorData
            }
          } catch (e) {
            console.error('Failed to fetch vendor:', e)
          }

          // Fetch vendor profile separately
          let vendorProfile: any = null
          try {
            const vendorProfileData = await db.vendorProfile.findUnique({
              where: { userId: assignmentData.vendorId },
              select: {
                companyName: true,
                serviceLocations: true,
              },
            })
            if (vendorProfileData) {
              vendorProfile = vendorProfileData
            }
          } catch (e) {
            console.error('Failed to fetch vendor profile:', e)
          }

          assignment = {
            id: assignmentData.id,
            status: assignmentData.status,
            vendorNotes: assignmentData.vendorNotes,
            vendor,
            vendorProfile,
          }
        }
      } catch (e) {
        console.error('Failed to fetch assignment:', e)
      }
    }

    // Build response
    const responseData = {
      id: booking.id,
      userId: booking.userId,
      serviceId: booking.serviceId,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      location: booking.location,
      preferredDate: booking.preferredDate?.toISOString(),
      preferredTime: booking.preferredTime,
      additionalNotes: booking.additionalNotes,
      status: booking.status,
      scheduledDate: booking.scheduledDate?.toISOString(),
      createdAt: booking.createdAt?.toISOString(),
      updatedAt: booking.updatedAt?.toISOString(),
      service,
      receipt,
      assignment,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Failed to fetch booking details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
