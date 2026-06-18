const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * ดึงหรือสร้างข้อมูลผู้ใช้ (User)
 */
async function getOrCreateUser(platform, platformUserId, displayName = null) {
    let user = await prisma.user.findUnique({
        where: { platform_user_id: platformUserId }
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                platform: platform,
                platform_user_id: platformUserId,
                display_name: displayName
            }
        });
    } else if (displayName && user.display_name !== displayName) {
        // อัปเดตชื่อถ้ามีการเปลี่ยนแปลง
        user = await prisma.user.update({
            where: { id: user.id },
            data: { display_name: displayName }
        });
    }

    return user;
}

/**
 * ดึงหรือสร้าง Session การแชท
 */
async function getOrCreateSession(userId) {
    let session = await prisma.chatSession.findFirst({
        where: { 
            user_id: userId,
            status: { not: 'closed' } // หาอันที่ยังเปิดอยู่
        },
        orderBy: { created_at: 'desc' }
    });

    if (!session) {
        session = await prisma.chatSession.create({
            data: {
                user_id: userId,
                status: 'bot_handling' // ค่าเริ่มต้นให้บอทดูแล
            }
        });
    }

    return session;
}

/**
 * บันทึกประวัติการแชท (Chat Logs)
 */
async function logChatMessage(sessionId, senderType, message, rawTag = null) {
    return await prisma.chatLog.create({
        data: {
            session_id: sessionId,
            sender_type: senderType, // 'user', 'bot', 'admin'
            message: message,
            raw_tag: rawTag
        }
    });
}

/**
 * บันทึกรูปภาพ/ไฟล์ (Media Storage)
 */
async function logAttachment(logId, attachmentType, storageUrl, fileName = null, fileSize = null) {
    return await prisma.chatAttachment.create({
        data: {
            log_id: logId,
            attachment_type: attachmentType,
            storage_url: storageUrl,
            file_name: fileName,
            file_size: fileSize
        }
    });
}

module.exports = {
    prisma,
    getOrCreateUser,
    getOrCreateSession,
    logChatMessage,
    logAttachment
};
