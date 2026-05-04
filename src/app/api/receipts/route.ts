import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const formData = await request.formData()

    const file = formData.get('file') as File
    const serviceRequestId = formData.get('serviceRequestId') as string

    if (!file || !serviceRequestId) {
      return NextResponse.json(
        { error: 'File and service request ID are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Verify service request exists
    const serviceRequest = await db.serviceRequest.findUnique({
      where: { id: serviceRequestId },
    })

    if (!serviceRequest) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${serviceRequestId}-${file.name}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Create receipt record
    const receipt = await db.receipt.create({
      data: {
        uploadedBy: session?.user?.id || serviceRequest.userId || '',
        serviceRequestId,
        fileUrl: `/uploads/receipts/${filename}`,
        fileName: file.name,
        fileSize: file.size,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      id: receipt.id,
      message: 'Receipt uploaded successfully',
    })
  } catch (error) {
    console.error('Failed to upload receipt:', error)
    return NextResponse.json(
      { error: 'Failed to upload receipt' },
      { status: 500 }
    )
  }
}
