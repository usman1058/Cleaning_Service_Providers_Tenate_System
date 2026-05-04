import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Validation schemas
const CreateSubcategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().optional(),
})

const UpdateSubcategorySchema = CreateSubcategorySchema.partial()

// GET - Fetch all subcategories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const categoryId = searchParams.get('categoryId')

    const where: any = includeInactive ? {} : { isActive: true }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const subcategories = await db.serviceSubcategory.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json(subcategories)
  } catch (error) {
    console.error('Failed to fetch subcategories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    )
  }
}

// POST - Create a new subcategory
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = CreateSubcategorySchema.parse(body)

    // Check if category exists
    const category = await db.serviceCategory.findUnique({
      where: { id: validated.categoryId },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists for this category
    const existing = await db.serviceSubcategory.findFirst({
      where: {
        categoryId: validated.categoryId,
        slug: validated.slug,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A subcategory with this slug already exists in this category' },
        { status: 409 }
      )
    }

    const subcategory = await db.serviceSubcategory.create({
      data: {
        name: validated.name,
        slug: validated.slug,
        categoryId: validated.categoryId,
        description: validated.description,
        isActive: validated.isActive ?? true,
        displayOrder: validated.displayOrder ?? 0,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(subcategory, { status: 201 })
  } catch (error) {
    console.error('Failed to create subcategory:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500 }
    )
  }
}
