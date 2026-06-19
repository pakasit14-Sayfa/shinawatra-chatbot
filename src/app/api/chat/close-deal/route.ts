import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // 1. หา User และ ChatSession ล่าสุด
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        chat_sessions: {
          orderBy: { updated_at: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2. อัปเดต ChatSession เป็น closed (ถ้ามี)
    if (user.chat_sessions && user.chat_sessions.length > 0) {
      const sessionId = user.chat_sessions[0].id
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status: 'closed' }
      })
    }

    // 3. อัปเดตหรือสร้าง StudentLead เป็น closed
    const existingLead = await prisma.studentLead.findUnique({
      where: { user_id: userId }
    })

    if (existingLead) {
      await prisma.studentLead.update({
        where: { user_id: userId },
        data: { lead_status: 'closed' }
      })
    } else {
      await prisma.studentLead.create({
        data: {
          user_id: userId,
          lead_status: 'closed'
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Deal closed successfully' })
  } catch (error) {
    console.error('Error closing deal:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
