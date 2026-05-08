import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await db.vendorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to fetch vendor profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      name, 
      currentPassword, 
      newPassword, 
      availability, 
      teamSize, 
      dailyCapacity,
      description
    } = body

    // 1. Handle Password Change if requested
    if (currentPassword && newPassword) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid current password' }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      await db.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword },
      })
    }

    // 2. Update User Name if provided
    if (name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name },
      })
    }

    // 3. Update Profile fields
    await db.vendorProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(availability !== undefined && { availability }),
        ...(teamSize !== undefined && { teamSize: parseInt(teamSize) }),
        ...(dailyCapacity !== undefined && { dailyCapacity: parseInt(dailyCapacity) }),
        ...(description !== undefined && { description }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    })
  } catch (error) {
    console.error('Failed to update vendor profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
