import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { approved } = body

    const application = await db.vendorApplication.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (approved) {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8)
      const hashedPassword = await bcrypt.hash(tempPassword, 10)

      // Create vendor profile
      await db.vendorProfile.create({
        data: {
          userId: application.userId,
          companyName: application.businessName,
          businessType: application.businessType,
          serviceLocations: application.serviceLocations,
          description: application.experience,
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      })

      // Update user role to VENDOR
      await db.user.update({
        where: { id: application.userId },
        data: {
          password: hashedPassword,
          role: 'VENDOR',
        },
      })

      // Update application status
      await db.vendorApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      })

      // Create notification with temp password
      await db.notification.create({
        data: {
          userId: application.userId,
          title: 'Application Approved',
          message: `Congratulations! Your vendor application has been approved. Your temporary password is: ${tempPassword}. Please change it after login.`,
          type: 'SUCCESS',
          relatedEntityType: 'VENDOR_APPLICATION',
          relatedEntityId: id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Application approved',
        tempPassword,
      })
    } else {
      // Reject application
      await db.vendorApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
        },
      })

      // Create notification
      await db.notification.create({
        data: {
          userId: application.userId,
          title: 'Application Update',
          message: 'Your vendor application has been reviewed. Please check your dashboard for details.',
          type: 'INFO',
          relatedEntityType: 'VENDOR_APPLICATION',
          relatedEntityId: id,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Application rejected',
      })
    }
  } catch (error) {
    console.error('Failed to review vendor application:', error)
    return NextResponse.json(
      { error: 'Failed to review application' },
      { status: 500 }
    )
  }
}
