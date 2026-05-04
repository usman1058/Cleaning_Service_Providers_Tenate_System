import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get recent service requests
    const recentServices = await db.serviceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        service: true,
        receipt: true,
      },
    })

    const activities = recentServices.map(service => ({
      id: service.id,
      type: 'SERVICE_REQUEST',
      title: `New Service Request: ${service.service?.name || 'Custom Service'}`,
      description: `From ${service.name} - Status: ${service.status.replace(/_/g, ' ')}`,
      createdAt: service.createdAt.toISOString(),
    }))

    // Get recent vendor applications
    const recentApplications = await db.vendorApplication.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    recentApplications.forEach(app => {
      activities.push({
        id: app.id,
        type: 'VENDOR_APPLICATION',
        title: `New Vendor Application: ${app.businessName}`,
        description: `Submitted by ${app.contactName}`,
        createdAt: app.createdAt.toISOString(),
      })
    })

    // Sort by date
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(activities.slice(0, 10))
  } catch (error) {
    console.error('Failed to fetch recent activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}
