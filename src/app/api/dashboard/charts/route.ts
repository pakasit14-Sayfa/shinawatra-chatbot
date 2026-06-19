import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. Platform Traffic (Donut Chart)
    const users = await prisma.user.groupBy({
      by: ['platform'],
      _count: {
        platform: true
      }
    })

    const platformTraffic = {
      labels: users.map(u => u.platform.toUpperCase()),
      series: users.map(u => u._count.platform),
      total: users.reduce((acc, curr) => acc + curr._count.platform, 0)
    }

    // ถ้าไม่มีข้อมูล ให้ส่งค่าเริ่มต้น
    if (platformTraffic.series.length === 0) {
      platformTraffic.labels = ['LINE', 'FACEBOOK']
      platformTraffic.series = [0, 0]
      platformTraffic.total = 0
    }

    // 2. AI Resolution Rate (Radial Chart)
    const totalSessions = await prisma.chatSession.count()
    const escalatedSessions = await prisma.chatSession.count({
      where: { status: 'admin_handling' }
    })
    
    let aiResolutionRate = 100
    if (totalSessions > 0) {
      const aiHandled = totalSessions - escalatedSessions
      aiResolutionRate = Math.round((aiHandled / totalSessions) * 100)
    } else {
      aiResolutionRate = 0
    }

    // 3. Recent Chats (Table)
    const recentChats = await prisma.chatSession.findMany({
      take: 5,
      orderBy: { updated_at: 'desc' },
      include: {
        user: true,
        chat_logs: {
          take: 1,
          orderBy: { created_at: 'desc' }
        }
      }
    })

    const formattedRecentChats = recentChats.map(session => {
      const lastMsg = session.chat_logs[0]
      return {
        id: session.id,
        user: session.user.display_name || session.user.platform_user_id,
        platform: session.user.platform,
        status: session.status,
        lastMessage: lastMsg ? lastMsg.message : 'No message',
        time: lastMsg ? lastMsg.created_at : session.updated_at,
        avatar: session.user.profile_pic_url || ''
      }
    })

    return NextResponse.json({
      platformTraffic,
      aiResolutionRate,
      recentChats: formattedRecentChats
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json({ error: 'Failed to load chart data' }, { status: 500 })
  }
}
