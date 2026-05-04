import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch all contracts for the current vendor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'VENDOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const where: any = { vendorId: session.user.id }
    if (activeOnly) {
      where.isActive = true
    }

    const contracts = await db.vendorContract.findMany({
      where,
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
