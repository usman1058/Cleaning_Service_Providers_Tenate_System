import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const companyName = formData.get('companyName') as string
    const ownerName = formData.get('ownerName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const serviceLocations = formData.get('serviceLocations') as string
    const servicesOffered = formData.get('servicesOffered') as string
    const teamSize = parseInt(formData.get('teamSize') as string)
    const dailyCapacity = parseInt(formData.get('dailyCapacity') as string)
    const availabilitySchedule = formData.get('availabilitySchedule') as string
    const availabilityHours = formData.get('availabilityHours') as string
    const contractSigned = formData.get('contractSigned') === 'true'

    const licenseFile = formData.get('licenseFile') as File
    const identityDocFile = formData.get('identityDocFile') as File
    const contractFile = formData.get('contractFile') as File

    // Validate required fields
    if (!companyName || !ownerName || !email || !phone || !serviceLocations) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'vendor-docs')
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filenames
    const timestamp = Date.now()

    // Save files
    let licenseUrl = ''
    if (licenseFile) {
      const licenseFilename = `${timestamp}-license-${licenseFile.name}`
      const licenseBytes = await licenseFile.arrayBuffer()
      const licenseBuffer = Buffer.from(licenseBytes)
      const licenseFilepath = join(uploadsDir, licenseFilename)
      await writeFile(licenseFilepath, licenseBuffer)
      licenseUrl = `/uploads/vendor-docs/${licenseFilename}`
    }

    let identityDocUrl = ''
    if (identityDocFile) {
      const identityDocFilename = `${timestamp}-identity-${identityDocFile.name}`
      const identityDocBytes = await identityDocFile.arrayBuffer()
      const identityDocBuffer = Buffer.from(identityDocBytes)
      const identityDocFilepath = join(uploadsDir, identityDocFilename)
      await writeFile(identityDocFilepath, identityDocBuffer)
      identityDocUrl = `/uploads/vendor-docs/${identityDocFilename}`
    }

    let contractUrl = ''
    if (contractFile) {
      const contractFilename = `${timestamp}-contract-${contractFile.name}`
      const contractBytes = await contractFile.arrayBuffer()
      const contractBuffer = Buffer.from(contractBytes)
      const contractFilepath = join(uploadsDir, contractFilename)
      await writeFile(contractFilepath, contractBuffer)
      contractUrl = `/uploads/vendor-docs/${contractFilename}`
    }

    // Create user with VENDOR role (but not active yet)
    const user = await db.user.create({
      data: {
        email,
        name: ownerName,
        password: 'TEMP_PASSWORD', // Will be set after approval
        role: 'VENDOR',
      },
    })

    // Create vendor application
    await db.vendorApplication.create({
      data: {
        userId: user.id,
        contactName: ownerName,
        email,
        phone,
        address: serviceLocations, // Using serviceLocations as address
        businessName: companyName,
        businessType: 'Cleaning', // Default value since we don't have this field in the form
        serviceLocations,
        servicesOffered: servicesOffered?.toString() || null,
        experience: null,
        availability: null,
        identityDocUrl: identityDocUrl || null,
        licenseDocUrl: licenseUrl || null,
        contractDocUrl: contractUrl || null,
        status: 'PENDING',
      },
    })

    // Create notification for admin
    await db.notification.create({
      data: {
        userId: 'admin',
        title: 'New Vendor Application',
        message: `New vendor application from ${companyName} (${ownerName})`,
        type: 'INFO',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Vendor application submitted successfully',
    })
  } catch (error) {
    console.error('Failed to create vendor application:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
