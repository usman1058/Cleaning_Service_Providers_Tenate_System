import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const [categories, subcategories] = await Promise.all([
      db.serviceCategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
      db.serviceSubcategory.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      }),
    ])

    return NextResponse.json({
      categories,
      subcategories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
