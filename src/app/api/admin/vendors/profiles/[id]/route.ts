import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
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
    const { status, serviceLocations, description, businessName, businessType, isActive } = body

    await db.vendorProfile.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(serviceLocations !== undefined && { serviceLocations }),
        ...(description !== undefined && { description }),
        ...(businessName !== undefined && { businessName }),
        ...(businessType !== undefined && { businessType }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update vendor profile:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}
