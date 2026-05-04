import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profiles = await db.vendorProfile.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Failed to fetch vendor profiles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor profiles' },
      { status: 500 }
    )
  }
}
