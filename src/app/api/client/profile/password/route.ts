import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createNotification } from '@/lib/notification'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword, skipCurrentPassword } = body

    if (!newPassword) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      )
    }

    // Get user with password
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const hasExistingPassword = !!user.password

    const canSkipCurrent = Boolean(skipCurrentPassword) && Boolean(session.user.guestBootstrap)

    if (hasExistingPassword && !canSkipCurrent) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required' },
          { status: 400 }
        )
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    })

    // Create notification
    await createNotification({
      userId: session.user.id,
      title: hasExistingPassword ? 'Password Changed' : 'Password Set',
      message: hasExistingPassword 
        ? 'Your account password was successfully changed. If you did not perform this action, please contact support immediately.' 
        : 'Your account password has been set successfully. You can now use it to login to your account.',
      type: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      message: hasExistingPassword ? 'Password changed successfully' : 'Password set successfully',
    })
  } catch (error) {
    console.error('Failed to change password:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
