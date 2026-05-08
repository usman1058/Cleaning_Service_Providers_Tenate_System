import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const templates = await db.contractTemplate.findMany({
      where: { isActive: true },
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
