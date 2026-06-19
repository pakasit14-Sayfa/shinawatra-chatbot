import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // 1. ดึง Profile User (แอดมินที่กำลังใช้ระบบ)
    const profileUser = {
      id: 1,
      role: 'admin',
      about: 'Guidance Teacher (Admin)',
      avatar: '/images/avatars/1.png',
      fullName: 'Admin User',
      status: 'online',
      settings: {
        isNotificationsOn: true,
        isTwoStepAuthVerificationEnabled: false
      }
    }

    // 2. ดึงรายชื่อคนทักแชท (Contacts) จากตาราง Users
    const users = await prisma.user.findMany({
      include: {
        chat_sessions: {
          include: {
            chat_logs: true
          }
        }
      }
    })

    const contacts = []
    const chats = []

    for (const user of users) {
      // เอาแค่คนที่มี session คุยแล้ว
      if (user.chat_sessions.length === 0) continue

      contacts.push({
        id: user.id,
        platformUserId: user.platform_user_id,
        fullName: user.display_name || user.platform_user_id,
        role: user.platform.toUpperCase(),
        about: `ช่องทาง: ${user.platform}`,
        avatar: user.profile_pic_url || '', 
        status: 'offline' // สถานะคนเล่น (จำลองไว้ก่อน)
      })

      // นำประวัติการคุยมารวม (สมมติเอา session ล่าสุดมาแสดง)
      const latestSession = user.chat_sessions[user.chat_sessions.length - 1]
      
      const chatMessages = latestSession.chat_logs.map(log => {
        return {
          message: log.message || '[Attachment]',
          time: log.created_at,
          // senderId = 1 คือแอดมินหรือบอทตอบ (ขวา) / senderId = user.id คือลูกค้าพิมพ์มา (ซ้าย)
          senderId: log.sender_type === 'bot' || log.sender_type === 'admin' ? 1 : user.id,
          msgStatus: {
            isSent: true,
            isDelivered: true,
            isSeen: true
          }
        }
      })

      chats.push({
        id: latestSession.id,
        userId: user.id,
        unseenMsgs: 0,
        chat: chatMessages
      })
    }

    return NextResponse.json({
      profileUser,
      contacts,
      chats,
      activeUser: contacts.length > 0 ? contacts[0] : undefined
    })
  } catch (error) {
    console.error('Error fetching chat data:', error)
    return NextResponse.json({ error: 'Failed to load chats' }, { status: 500 })
  }
}
