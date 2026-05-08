import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to manage admins
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { permissions: true }
    })

    if (!currentUser?.permissions?.includes('manage_admins')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admins = await db.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(admins)
  } catch (error) {
    console.error('Failed to fetch admins:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const { name, email, password, permissions } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        permissions: permissions || '',
      },
    })

    const { password: _, ...adminWithoutPassword } = admin
    return NextResponse.json(adminWithoutPassword)
  } catch (error) {
    console.error('Failed to create admin:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
