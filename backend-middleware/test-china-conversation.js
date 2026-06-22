const axios = require('axios');
require('dotenv').config();

const SERVER_URL = 'http://localhost:3005';
const page6 = process.env.FB_PAGE_ID_6; // เซี่ยงไฮ้
const page5 = process.env.FB_PAGE_ID_5; // จีนรวม

async function sendFbMessage(pageId, senderId, text) {
    const payload = {
        object: 'page',
        entry: [{
            id: pageId,
            time: Date.now(),
            messaging: [{
                sender: { id: senderId },
                recipient: { id: pageId },
                timestamp: Date.now(),
                message: { text: text }
            }]
        }]
    };
    try {
        await axios.post(`${SERVER_URL}/webhook/meta`, payload);
        return true;
    } catch (err) {
        return false;
    }
}

async function runTests() {
    console.log('🚀 เริ่มทดสอบการทำงานของระบบ (เซี่ยงไฮ้ เพื่อดูการส่งรูป)...');
    
    const sessionId_SH = 'TEST_SHANGHAI_4';
    console.log('\n--- Test 1: เพจเซี่ยงไฮ้ (เพจ 6) ---');
    console.log('👤 ลูกค้า: "สนใจเรียนเซี่ยงไฮ้ครับ"');
    await sendFbMessage(page6, sessionId_SH, 'สนใจเรียนเซี่ยงไฮ้ครับ');
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('👤 ลูกค้า: "อายุ 20 ไม่มีพื้นฐาน ไม่เคยไปจีนครับ"');
    await sendFbMessage(page6, sessionId_SH, 'อายุ 20 ไม่มีพื้นฐาน ไม่เคยไปจีนครับ');
    await new Promise(resolve => setTimeout(resolve, 15000));

    console.log('\n✅ ส่งข้อความจำลองครบแล้ว เช็ค Log จากหน้าต่าง Server ครับ');
}

runTests();
