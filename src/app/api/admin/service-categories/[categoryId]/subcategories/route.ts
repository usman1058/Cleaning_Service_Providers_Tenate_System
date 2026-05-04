import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  try {

    const subcategories = await db.serviceSubcategory.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      orderBy: { displayOrder: 'asc' },
    })

    return NextResponse.json({
      subcategories,
    })
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subcategories' },
      { status: 500 }
    )
  }
}
