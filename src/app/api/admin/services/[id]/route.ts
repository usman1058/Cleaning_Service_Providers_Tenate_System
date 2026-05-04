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
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(service)
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
