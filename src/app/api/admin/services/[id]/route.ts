import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const service = await db.service.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        serviceRequests: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          include: {
            user: true,
            assignment: {
              include: {
                vendor: {
                  include: {
                    vendorProfile: true
                  }
                }
              }
            },
            receipt: true
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Extract unique vendors who have performed this service
    const vendorsMap = new Map()
    service.serviceRequests.forEach(req => {
      if (req.assignment?.vendor) {
        const vendor = req.assignment.vendor
        vendorsMap.set(vendor.id, {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          companyName: vendor.vendorProfile?.companyName || 'N/A',
          status: vendor.vendorProfile?.status || 'N/A',
          lastAssigned: req.createdAt
        })
      }
    })

    const vendors = Array.from(vendorsMap.values())

    // Calculate stats
    const stats = {
      totalRequests: service.serviceRequests.length,
      completedRequests: service.serviceRequests.filter(r => r.status === 'COMPLETED').length,
      totalRevenue: service.serviceRequests
        .filter(r => r.status === 'COMPLETED')
        .reduce((sum, r) => sum + (service.startingPrice || 0), 0),
      activeAssignments: service.serviceRequests.filter(r => 
        ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)
      ).length
    }

    // Get trend data (last 6 months)
    const now = new Date()
    const revenueTrend = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthName = date.toLocaleString('default', { month: 'short' })
      
      const count = service.serviceRequests.filter(r => 
        r.status === 'COMPLETED' && 
        new Date(r.updatedAt) >= date && 
        new Date(r.updatedAt) < nextDate
      ).length
      
      revenueTrend.push({
        name: monthName,
        total: count * (service.startingPrice || 0),
      })
    }

    const statusDistribution = [
      { name: 'Completed', total: service.serviceRequests.filter(r => r.status === 'COMPLETED').length },
      { name: 'Pending', total: service.serviceRequests.filter(r => r.status === 'PENDING').length },
      { name: 'Active', total: service.serviceRequests.filter(r => ['ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length },
      { name: 'Cancelled', total: service.serviceRequests.filter(r => r.status === 'CANCELLED').length },
    ]

    return NextResponse.json({
      ...service,
      vendors,
      stats,
      revenueTrend,
      statusDistribution,
      history: service.serviceRequests
    })
  } catch (error) {
    console.error('Failed to fetch service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      longDescription,
      startingPrice,
      duration,
      coverage,
      locations,
      isActive,
      isCombined,
      discountType,
      discountValue,
      featured,
      categoryId,
      subcategoryId,
    } = body

    const service = await db.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const updatedService = await db.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(longDescription !== undefined && { longDescription }),
        ...(startingPrice !== undefined && { startingPrice: parseFloat(startingPrice) }),
        ...(duration !== undefined && { duration }),
        ...(coverage !== undefined && { coverage }),
        ...(locations !== undefined && { locations }),
        ...(isActive !== undefined && { isActive }),
        ...(isCombined !== undefined && { isCombined }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
        ...(featured !== undefined && { featured }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(subcategoryId !== undefined && { subcategoryId: subcategoryId || null }),
        updatedAt: new Date(),
      },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'UPDATE',
        entityType: 'SERVICE',
        entityId: id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userEmail: session.user.email || '',
        userRole: session.user.role,
        details: `Updated service: ${name || service.name}`,
      },
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error('Failed to update service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const service = await db.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Delete service
    await db.service.delete({
      where: { id },
    })

    // Create audit log
    await db.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'SERVICE',
        entityId: id,
        userId: session.user.id,
        userName: session.user.name || 'Unknown',
        userEmail: session.user.email || '',
        userRole: session.user.role,
        details: `Deleted service: ${service.name}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}
