import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { permissions: true }
    })

    if (!currentUser?.permissions?.includes('manage_admins')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { name, permissions, password } = body

    const data: any = {}
    if (name) data.name = name
    if (permissions !== undefined) data.permissions = permissions
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    const admin = await db.user.update({
      where: { id },
      data,
    })

    const { password: _, ...adminWithoutPassword } = admin
    return NextResponse.json(adminWithoutPassword)
  } catch (error) {
    console.error('Failed to update admin:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent deleting self
    if (id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { permissions: true }
    })

    if (!currentUser?.permissions?.includes('manage_admins')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete admin:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
