import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const serviceRequest = await db.serviceRequest.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        service: true,
        receipt: true,
        assignment: {
          include: {
            vendor: {
              include: {
                vendorProfile: true,
              },
            },
          },
        },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      )
    }

    // Parse location from string to object
    let location = {
      address: serviceRequest.location,
      city: '',
      state: '',
      zipCode: '',
      latitude: null,
      longitude: null,
    }

    const locationParts = serviceRequest.location.split(',')
    if (locationParts.length >= 2) {
      location.city = locationParts[1]?.trim() || ''
    }
    if (locationParts.length >= 3) {
      location.state = locationParts[2]?.trim() || ''
      const zipMatch = locationParts[2]?.trim()?.match(/\d{5}/)
      if (zipMatch) {
        location.zipCode = zipMatch[0]
        location.state = locationParts[2]?.trim()?.replace(zipMatch[0], '').trim() || ''
      }
    }

    // Build tracking data
    const trackingData = {
      serviceRequest: {
        id: serviceRequest.id,
        serviceName: serviceRequest.service?.name || 'Custom Service',
        serviceDescription: serviceRequest.service?.description || '',
        serviceStartingPrice: serviceRequest.service?.startingPrice || 0,
        status: serviceRequest.status,
        preferredDate: serviceRequest.preferredDate?.toISOString() || new Date().toISOString(),
        preferredTime: serviceRequest.preferredTime,
        scheduledDate: serviceRequest.scheduledDate?.toISOString(),
        location: location,
        createdAt: serviceRequest.createdAt.toISOString(),
        estimatedDuration: serviceRequest.service?.duration || '2-3 hours',
      },
      receipt: serviceRequest.receipt ? {
        id: serviceRequest.receipt.id,
        status: serviceRequest.receipt.status,
        imageUrl: serviceRequest.receipt.fileUrl,
        adminRemarks: serviceRequest.receipt.adminRemarks,
        reviewedAt: serviceRequest.receipt.reviewedAt?.toISOString(),
        reviewedBy: serviceRequest.receipt.reviewedBy,
      } : null,
      assignment: serviceRequest.assignment ? {
        id: serviceRequest.assignment.id,
        status: serviceRequest.assignment.status,
        vendor: {
          name: serviceRequest.assignment.vendor.name,
          email: serviceRequest.assignment.vendor.email,
          companyName: serviceRequest.assignment.vendor.vendorProfile?.companyName || '',
        },
        vendorNotes: serviceRequest.assignment.vendorNotes,
        beforeImage: serviceRequest.assignment.beforeImage,
        afterImage: serviceRequest.assignment.afterImage,
        startedAt: serviceRequest.assignment.startedAt?.toISOString(),
        completedAt: serviceRequest.assignment.completedAt?.toISOString(),
      } : null,
    }

    return NextResponse.json(trackingData)
  } catch (error) {
    console.error('Failed to fetch tracking data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    )
  }
}
