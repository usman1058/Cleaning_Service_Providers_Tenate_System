import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Define schema for system settings update
const UpdateSettingsBody = z.object({
  maxUploadFileSize: z.number().min(0.1).max(100),
  maxContractFileSize: z.number().min(0.1).max(100),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all system settings
    const settings = await db.systemSettings.findMany()

    // Convert to key-value object
    const settingsMap: Record<string, string | number> = {
      id: 'default',
      maxUploadFileSize: 5.0,
      maxContractFileSize: 10.0,
    }

    for (const setting of settings) {
      const numValue = parseFloat(setting.value)
      if (!isNaN(numValue)) {
        settingsMap[setting.key] = numValue
      }
    }

    return NextResponse.json(settingsMap)
  } catch (error) {
    console.error('Failed to fetch system settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate body structure
    const validated = UpdateSettingsBody.parse(body)

    const { maxUploadFileSize, maxContractFileSize } = validated

    // Update settings using upsert for each setting
    const uploadSizeSetting = await db.systemSettings.upsert({
      where: { key: 'maxUploadFileSize' },
      update: { value: maxUploadFileSize.toString() },
      create: {
        key: 'maxUploadFileSize',
        value: maxUploadFileSize.toString(),
        description: 'Maximum file size for receipt uploads in MB',
        category: 'upload',
      },
    })

    const contractSizeSetting = await db.systemSettings.upsert({
      where: { key: 'maxContractFileSize' },
      update: { value: maxContractFileSize.toString() },
      create: {
        key: 'maxContractFileSize',
        value: maxContractFileSize.toString(),
        description: 'Maximum file size for vendor contract uploads in MB',
        category: 'upload',
      },
    })

    console.log('Updated system settings:', {
      maxUploadFileSize,
      maxContractFileSize,
    })

    return NextResponse.json({
      id: 'default',
      maxUploadFileSize: parseFloat(uploadSizeSetting.value),
      maxContractFileSize: parseFloat(contractSizeSetting.value),
      message: 'Settings updated successfully',
    })
  } catch (error) {
    console.error('Failed to update system settings:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request body',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    )
  }
}
