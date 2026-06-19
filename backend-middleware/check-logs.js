const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.chatLog.findMany({ orderBy: { created_at: 'desc' }, take: 10 });
  console.log(logs);
}
main().catch(console.error).finally(() => prisma.$disconnect());
