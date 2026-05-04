import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { writeFile } from 'fs/promises'
import path from 'path'

// Validation schema
const UploadContractSchema = z.object({
  vendorId: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().min(1),
  expiresAt: z.string().optional(),
})

// GET - Fetch all vendor contracts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const vendorId = searchParams.get('vendorId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = {}
    if (vendorId) {
      where.vendorId = vendorId
    }
    if (activeOnly) {
      where.isActive = true
    }

    const contracts = await db.vendorContract.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Failed to fetch vendor contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor contracts' },
      { status: 500 }
    )
  }
}

// POST - Upload a new vendor contract
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vendorId = formData.get('vendorId') as string
    const expiresAt = formData.get('expiresAt') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      )
    }

    // Check if vendor exists
    const vendor = await db.user.findUnique({
      where: { id: vendorId },
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Get max contract file size from system settings
    const maxContractSizeSetting = await db.systemSettings.findUnique({
      where: { key: 'maxContractFileSize' },
    })

    const maxFileSize = maxContractSizeSetting
      ? parseFloat(maxContractSizeSetting.value) * 1024 * 1024 // Convert MB to bytes
      : 10 * 1024 * 1024 // Default 10MB

    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Word documents are allowed.' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'vendor-contracts')
    await writeFile(uploadDir + '/.gitkeep', '') // Ensure directory exists

    // Generate unique filename
    const timestamp = Date.now()
    const uniqueFilename = `${vendorId}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadDir, uniqueFilename)

    // Convert file to buffer and write to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Deactivate old contracts for this vendor
    await db.vendorContract.updateMany({
      where: { vendorId, isActive: true },
      data: { isActive: false },
    })

    // Create contract record in database
    const contract = await db.vendorContract.create({
      data: {
        vendorId,
        contractUrl: `/uploads/vendor-contracts/${uniqueFilename}`,
        fileSize: file.size,
        fileName: file.name,
        isActive: true,
        uploadedBy: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    console.error('Failed to upload vendor contract:', error)
    return NextResponse.json(
      { error: 'Failed to upload vendor contract' },
      { status: 500 }
    )
  }
}
