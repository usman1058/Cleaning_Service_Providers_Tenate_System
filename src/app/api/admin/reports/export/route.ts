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

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'csv'

    // Get data for export
    const assignments = await db.serviceAssignment.findMany({
      where: {
        status: 'COMPLETED',
      },
      include: {
        serviceRequest: {
          include: {
            service: {
              select: {
                name: true,
                startingPrice: true,
              },
            },
          },
        },
        vendor: {
          include: {
            vendorProfile: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    })

    // Generate CSV data
    if (type === 'csv') {
      const headers = [
        'Service Name',
        'Client Name',
        'Client Email',
        'Vendor Company',
        'Location',
        'Completed Date',
        'Service Price',
      ]

      const rows = assignments.map(assignment => [
        assignment.serviceRequest.service?.name || 'Custom Service',
        assignment.serviceRequest.name,
        assignment.serviceRequest.email,
        assignment.vendor.vendorProfile?.companyName || assignment.vendor.name,
        assignment.serviceRequest.location,
        assignment.completedAt?.toISOString(),
        `$${assignment.serviceRequest.service?.startingPrice || 'N/A'}`,
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="global-green-services-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Generate PDF (simplified version - just return JSON for now)
    const exportData = assignments.map(assignment => ({
      serviceName: assignment.serviceRequest.service?.name || 'Custom Service',
      clientName: assignment.serviceRequest.name,
      clientEmail: assignment.serviceRequest.email,
      vendorCompany: assignment.vendor.vendorProfile?.companyName || assignment.vendor.name,
      location: assignment.serviceRequest.location,
      completedDate: assignment.completedAt?.toISOString(),
      servicePrice: assignment.serviceRequest.service?.startingPrice || 0,
    }))

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="global-green-services-report-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Failed to export report:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
