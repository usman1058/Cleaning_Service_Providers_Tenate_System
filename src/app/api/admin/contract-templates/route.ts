import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await db.contractTemplate.findMany({
      orderBy: { uploadedAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Failed to fetch templates:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'templates')
    await mkdir(uploadDir, { recursive: true })

    const fileName = `${uuidv4()}-${file.name}`
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/templates/${fileName}`

    // Deactivate all existing templates
    await db.contractTemplate.updateMany({
      data: { isActive: false },
    })

    const template = await db.contractTemplate.create({
      data: {
        title,
        description,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        uploadedBy: session.user.id,
        isActive: true,
      },
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Failed to upload template:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
