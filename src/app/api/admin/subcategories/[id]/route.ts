import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const UpdateSubcategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
  categoryId: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
})

// GET - Fetch a single subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const subcategory = await db.serviceSubcategory.findUnique({
      where: { id },
      include: {
        category: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Failed to fetch subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategory' },
      { status: 500 }
    )
  }
}

// PUT - Update a subcategory
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
    const validated = UpdateSubcategorySchema.parse(body)

    // Check if subcategory exists
    const existing = await db.serviceSubcategory.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }

    // If categoryId is being updated, check if it exists
    if (validated.categoryId && validated.categoryId !== existing.categoryId) {
      const category = await db.serviceCategory.findUnique({
        where: { id: validated.categoryId },
      })

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        )
      }
    }

    // If slug is being updated, check if it's already taken
    if (validated.slug && validated.slug !== existing.slug) {
      const slugExists = await db.serviceSubcategory.findFirst({
        where: {
          categoryId: validated.categoryId || existing.categoryId,
          slug: validated.slug,
        },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'A subcategory with this slug already exists in this category' },
          { status: 409 }
        )
      }
    }

    const subcategory = await db.serviceSubcategory.update({
      where: { id },
      data: validated,
      include: {
        category: true,
      },
    })

    return NextResponse.json(subcategory)
  } catch (error) {
    console.error('Failed to update subcategory:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a subcategory
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

    // Check if subcategory exists and has services
    const subcategory = await db.serviceSubcategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }

    if (subcategory._count.services > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subcategory with associated services. Please reassign services first.' },
        { status: 400 }
      )
    }

    await db.serviceSubcategory.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Subcategory deleted successfully' })
  } catch (error) {
    console.error('Failed to delete subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500 }
    )
  }
}
