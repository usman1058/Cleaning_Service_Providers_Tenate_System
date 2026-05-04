import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, location, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Create a ticket in a Ticket model
    // 2. Create a notification for admin
    // 3. Send an email notification

    // For now, just log the contact request
    console.log('New contact submission:', {
      name,
      email,
      phone,
      location,
      subject,
      message,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    })
  } catch (error) {
    console.error('Failed to send contact message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
