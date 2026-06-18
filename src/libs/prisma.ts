// --- โค้ดในไฟล์ src/lib/prisma.ts เท่านั้น ---

import { PrismaClient } from '@prisma/client'

// ตรวจสอบ Global object เพื่อป้องกันการสร้าง Client ซ้ำซ้อน
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
