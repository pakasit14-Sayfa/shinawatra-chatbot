const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { platform: 'line' },
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log("Found LINE Users:");
  console.log(users.map(u => ({ id: u.id, platform_user_id: u.platform_user_id, display_name: u.display_name })));

  if (users.length > 0) {
    const targetUser = users[0];
    console.log(`Deleting user: ${targetUser.platform_user_id}`);
    
    // Find sessions
    const sessions = await prisma.chatSession.findMany({ where: { user_id: targetUser.id } });
    const sessionIds = sessions.map(s => s.id);
    
    // Delete logs
    await prisma.chatLog.deleteMany({ where: { session_id: { in: sessionIds } } });
    console.log(`Deleted chat logs for sessions:`, sessionIds);
    
    // Delete sessions
    await prisma.chatSession.deleteMany({ where: { user_id: targetUser.id } });
    console.log(`Deleted chat sessions`);
    
    // Delete user
    await prisma.user.delete({ where: { id: targetUser.id } });
    console.log(`Deleted user ${targetUser.id}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
