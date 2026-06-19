import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Total Chats (จำนวนแชททั้งหมด)
    const totalChats = await prisma.chatSession.count()

    // 2. AI Handled (แชทที่บอทดูแลอยู่)
    const aiHandled = await prisma.chatSession.count({
      where: { status: 'bot_handling' }
    })

    // 3. Escalated (แชทที่ส่งให้แอดมินดูแล / ล็อกแชท)
    const escalated = await prisma.chatSession.count({
      where: { status: 'admin_handling' }
    })

    // 4. Closed Deals (ปิดการขายสำเร็จ)
    // สำหรับตอนนี้เราใช้นับจากตาราง StudentLead ที่ lead_status = 'closed'
    const closedDeals = await prisma.studentLead.count({
      where: { lead_status: 'closed' }
    })

    return NextResponse.json({
      totalChats,
      aiHandled,
      escalated,
      closedDeals
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
