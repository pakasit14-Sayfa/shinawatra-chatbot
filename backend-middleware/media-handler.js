const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('./database');

// สร้างโฟลเดอร์สำหรับเก็บไฟล์ถ้ายังไม่มี
const UPLOAD_DIR = path.join(__dirname, 'public', 'images', 'attachments');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * ดาวน์โหลดรูปภาพจาก LINE แบบ Local Storage
 */
async function processLineImage(messageId, accessToken, logId) {
    try {
        const response = await axios.get(
            `https://api-data.line.me/v2/bot/message/${messageId}/content`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` },
                responseType: 'stream'
            }
        );

        const fileName = `line_${messageId}_${Date.now()}.jpg`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        // เขียนไฟล์ลง Local Server
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', async () => {
                const stats = fs.statSync(filePath);
                const localUrl = `/images/attachments/${fileName}`; // URL สำหรับเข้าถึงรูปผ่าน browser
                
                // บันทึกลงตาราง chat_attachments
                await db.logAttachment(logId, 'image', localUrl, fileName, stats.size);
                console.log(`[LINE Media] ✅ บันทึกรูปภาพสำเร็จ: ${localUrl}`);
                resolve(localUrl);
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`[LINE Media Error] ดาวน์โหลดรูปไม่ได้: ${error.message}`);
    }
}

/**
 * ดาวน์โหลดรูปภาพ/ไฟล์จาก Facebook (Meta) แบบ Local Storage
 */
async function processMetaAttachment(attachmentUrl, logId) {
    try {
        const response = await axios.get(attachmentUrl, { responseType: 'stream' });

        const fileName = `meta_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        
        // เขียนไฟล์ลง Local Server
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', async () => {
                const stats = fs.statSync(filePath);
                const localUrl = `/images/attachments/${fileName}`; // URL สำหรับเข้าถึงรูปผ่าน browser
                
                // บันทึกลงตาราง chat_attachments
                await db.logAttachment(logId, 'image', localUrl, fileName, stats.size);
                console.log(`[META Media] ✅ บันทึกไฟล์แนบสำเร็จ: ${localUrl}`);
                resolve(localUrl);
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`[META Media Error] ดาวน์โหลดไฟล์แนบไม่ได้: ${error.message}`);
    }
}

module.exports = {
    processLineImage,
    processMetaAttachment
};
