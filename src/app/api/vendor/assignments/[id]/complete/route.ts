import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    const beforeImage = formData.get('beforeImage') as File
    const afterImage = formData.get('afterImage') as File
    const notes = formData.get('notes') as string

    if (!beforeImage || !afterImage) {
      return NextResponse.json(
        { error: 'Before and after photos are required' },
        { status: 400 }
      )
    }

    // Validate image types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(beforeImage.type) || !allowedTypes.includes(afterImage.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file sizes (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (beforeImage.size > MAX_FILE_SIZE || afterImage.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Get assignment
    const assignment = await db.serviceAssignment.findUnique({
      where: { id: assignmentId },
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
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    if (assignment.vendorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only complete your own assignments' },
        { status: 403 }
      )
    }

    if (assignment.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Assignment must be in progress to be completed' },
        { status: 400 }
      )
    }

    // Save images to disk
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'service-images')
    await mkdir(uploadsDir, { recursive: true })

    const beforeFileName = `before-${assignmentId}-${Date.now()}${beforeImage!.name.match(/\.[0-9a-z]+$/i)?.[0] || '.jpg'}`
    const afterFileName = `after-${assignmentId}-${Date.now()}${afterImage!.name.match(/\.[0-9a-z]+$/i)?.[0] || '.jpg'}`

    const beforeImagePath = join(uploadsDir, beforeFileName)
    const afterImagePath = join(uploadsDir, afterFileName)

    // Convert files to ArrayBuffer and save
    const beforeBuffer = Buffer.from(await beforeImage!.arrayBuffer())
    const afterBuffer = Buffer.from(await afterImage!.arrayBuffer())

    await writeFile(beforeImagePath, beforeBuffer)
    await writeFile(afterImagePath, afterBuffer)

    // Update assignment status to COMPLETED
    await db.serviceAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        vendorNotes: notes || '',
      },
    })

    // Update service request status to COMPLETED
    await db.serviceRequest.update({
      where: { id: assignment.serviceRequestId },
      data: {
        status: 'COMPLETED',
      },
    })

    // Create notification for admin
    await db.notification.create({
      data: {
        userId: 'admin',
        title: 'Service Completed',
        message: `Vendor ${session.user.name} has completed service: ${assignment.serviceRequest.service?.name || 'Unknown Service'}`,
        type: 'SUCCESS',
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: assignment.serviceRequestId,
      },
    })

    // Create notification for client
    await db.notification.create({
      data: {
        userId: assignment.serviceRequest.userId,
        title: 'Service Completed',
        message: `Your service "${assignment.serviceRequest.service?.name || 'Unknown Service'}" has been completed by ${session.user.name}. Please review the before/after photos.`,
        type: 'SUCCESS',
        relatedEntityType: 'SERVICE_REQUEST',
        relatedEntityId: assignment.serviceRequestId,
      },
    })

    // Calculate vendor earnings (service price - platform fee)
    const servicePrice = assignment.serviceRequest.service?.startingPrice || 0
    const platformFee = servicePrice * 0.15 // 15% platform fee
    const vendorEarnings = servicePrice - platformFee

    return NextResponse.json({
      success: true,
      message: 'Service completed successfully',
      earnings: vendorEarnings,
      beforeImage: `/uploads/service-images/${beforeFileName}`,
      afterImage: `/uploads/service-images/${afterFileName}`,
    })
  } catch (error) {
    console.error('Failed to complete assignment:', error)
    return NextResponse.json(
      { error: 'Failed to complete assignment' },
      { status: 500 }
    )
  }
}
