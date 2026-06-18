import { NextResponse } from 'next/server'
import { createClient } from 'redis'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

let redisClient: ReturnType<typeof createClient> | null = null

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD || undefined
    })
    redisClient.on('error', (err) => console.error('[Redis Client Error]', err))
    await redisClient.connect()
  }
  return redisClient
}

export async function POST(req: Request) {
  try {
    const { userId, locked } = await req.json()

    // ค้นหา platform จาก userId
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const platform = user.platform
    const platformUserId = user.platform_user_id
    const key = `handoff:${platform}:${platformUserId}`
    
    const redis = await getRedisClient()

    if (locked) {
      // แอดมินเทคโอเวอร์ (ล็อกแชท)
      await redis.set(key, JSON.stringify({ lockedAt: Date.now() }), {
        EX: 14400 // 4 hours TTL
      })
      console.log(`[Vuexy Dashboard] 🔒 ล็อกแชท ${key} สำเร็จ`)
    } else {
      // แอดมินปล่อยบอทตอบ (ปลดล็อกแชท)
      await redis.del(key)
      console.log(`[Vuexy Dashboard] 🔓 ปลดล็อกแชท ${key} สำเร็จ`)
    }

    return NextResponse.json({ success: true, key, locked })
  } catch (error) {
    console.error('Error toggling handoff:', error)
    return NextResponse.json({ error: 'Failed to toggle handoff' }, { status: 500 })
  }
}
