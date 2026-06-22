const axios = require('axios');
require('dotenv').config();

const SERVER_URL = 'http://localhost:3005';
const fbPageGeneral = process.env.FB_PAGE_ID_2; // เพจทั่วไป
const fbPageNursing = process.env.FB_PAGE_ID_3; // เพจพยาบาล

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
        // The server will process asynchronously and log it.
        // We just return success.
        return true;
    } catch (err) {
        console.error('Error sending FB message:', err.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 เริ่มต้นทดสอบการแยกเพจชินวัตร (Routing Test)...');

    // 1. เพจทั่วไป ถามเรื่อง พยาบาล
    console.log('\n--- Test 1: เพจทั่วไป (FB_PAGE_ID_2) ถามเรื่อง พยาบาล ---');
    console.log('ส่งข้อความ: "สนใจสมัครเรียนพยาบาลครับ"');
    await sendFbMessage(fbPageGeneral, 'TEST_USER_ROUTING_1', 'สนใจสมัครเรียนพยาบาลครับ');
    
    // Wait for AI to respond (it usually takes a few seconds)
    await new Promise(resolve => setTimeout(resolve, 8000));

    // 2. เพจพยาบาล ถามเรื่อง วิศวะ
    console.log('\n--- Test 2: เพจพยาบาล (FB_PAGE_ID_3) ถามเรื่อง วิศวกรรม ---');
    console.log('ส่งข้อความ: "สนใจสมัครวิศวกรรมศาสตร์ครับ"');
    await sendFbMessage(fbPageNursing, 'TEST_USER_ROUTING_2', 'สนใจสมัครวิศวกรรมศาสตร์ครับ');

    await new Promise(resolve => setTimeout(resolve, 8000));

    // 3. เพจพยาบาล ถามเรื่อง พยาบาล (ต้องตอบปกติ)
    console.log('\n--- Test 3: เพจพยาบาล (FB_PAGE_ID_3) ถามเรื่อง พยาบาล (ถูกเรื่อง) ---');
    console.log('ส่งข้อความ: "สนใจสมัครเรียนพยาบาลครับ มีเงื่อนไขอะไรบ้าง"');
    await sendFbMessage(fbPageNursing, 'TEST_USER_ROUTING_3', 'สนใจสมัครเรียนพยาบาลครับ มีเงื่อนไขอะไรบ้าง');

    console.log('\n✅ ส่งคำสั่งทดสอบครบแล้ว กรุณาดู Log จากหน้าต่าง Server ครับ');
}

runTests();
