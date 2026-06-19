const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.chatLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 10,
    include: { session: { include: { user: true } } }
  });
  console.log("--- LATEST 10 MESSAGES ---");
  logs.forEach(log => {
    const time = log.created_at.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    const platform = log.session?.user?.platform || 'Unknown';
    const userId = log.session?.user?.platform_user_id || '?';
    console.log(`[${time}] [${platform}] ${log.sender_type.toUpperCase()}: ${log.message}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
