import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { unlink } from 'fs/promises'
import path from 'path'

// GET - Fetch a single contract
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const contract = await db.vendorContract.findUnique({
      where: { id },
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

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Only admin or the vendor can view their contract
    if (session.user.role !== 'ADMIN' && session.user.id !== contract.vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Failed to fetch vendor contract:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor contract' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a contract
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if contract exists
    const contract = await db.vendorContract.findUnique({
      where: { id },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Delete file from disk
    const filePath = path.join(process.cwd(), 'public', contract.contractUrl)
    try {
      await unlink(filePath)
    } catch (err) {
      console.error('Failed to delete contract file:', err)
      // Continue with database deletion even if file deletion fails
    }

    // Delete contract record
    await db.vendorContract.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Contract deleted successfully' })
  } catch (error) {
    console.error('Failed to delete vendor contract:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor contract' },
      { status: 500 }
    )
  }
}

// PUT - Update contract (activate/deactivate)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const contract = await db.vendorContract.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        expiresAt: body.expiresAt !== undefined ? (body.expiresAt ? new Date(body.expiresAt) : null) : undefined,
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

    // If activating a contract, deactivate all other contracts for this vendor
    if (body.isActive === true) {
      await db.vendorContract.updateMany({
        where: {
          vendorId: contract.vendorId,
          id: { not: id },
        },
        data: { isActive: false },
      })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Failed to update vendor contract:', error)
    return NextResponse.json(
      { error: 'Failed to update vendor contract' },
      { status: 500 }
    )
  }
}
