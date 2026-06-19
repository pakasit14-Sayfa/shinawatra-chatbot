import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { platform, platformUserId, message } = body

    if (!platform || !platformUserId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Forward the request to the backend-middleware
    // The backend-middleware is expected to run on port 3001
    const backendUrl = process.env.BACKEND_MIDDLEWARE_URL || 'http://localhost:3001'
    
    // Using Basic Auth as defined in backend-middleware/server.js
    const adminUser = process.env.ADMIN_USER || 'admin'
    const adminPass = process.env.ADMIN_PASS || 'plu1234'
    const basicAuth = Buffer.from(`${adminUser}:${adminPass}`).toString('base64')

    const response = await fetch(`${backendUrl}/api/admin/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`
      },
      body: JSON.stringify({
        platform,
        platformUserId,
        message
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send message via middleware')
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('API /chat/send Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
