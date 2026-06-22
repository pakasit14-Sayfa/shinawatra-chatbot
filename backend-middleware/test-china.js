const axios = require('axios');
require('dotenv').config();

const SERVER_URL = 'http://localhost:3005';
const page4 = process.env.FB_PAGE_ID_4; // กว่างโจว
const page5 = process.env.FB_PAGE_ID_5; // จีนทั่วไป
const page6 = process.env.FB_PAGE_ID_6; // เซี่ยงไฮ้

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
    console.log('🚀 เริ่มต้นทดสอบ Cross-page ของจีน...');

    console.log('\n--- Test 1: เพจ 4 (กว่างโจว) ---');
    console.log('ถาม: "สนใจศึกษาหลักสูตรภาษาจีนที่กว่างโจว รบกวนสอบถามจ้า"');
    await sendFbMessage(page4, 'TEST_CHINA_1', 'สนใจศึกษาหลักสูตรภาษาจีนที่กว่างโจว รบกวนสอบถามจ้า');
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('\n--- Test 2: เพจ 6 (เซี่ยงไฮ้) ---');
    console.log('ถาม: "สนใจศึกษาหลักสูตรภาษาจีนที่เซี่ยงไฮ้ รบกวนสอบถามจ้า"');
    await sendFbMessage(page6, 'TEST_CHINA_2', 'สนใจศึกษาหลักสูตรภาษาจีนที่เซี่ยงไฮ้ รบกวนสอบถามจ้า');
    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('\n--- Test 3: เพจ 6 (เซี่ยงไฮ้) แต่ดันถามถึงเมืองอื่น ---');
    console.log('ถาม: "มีข้อมูลเรียนต่อที่กว่างโจวไหมคะ"');
    await sendFbMessage(page6, 'TEST_CHINA_3', 'มีข้อมูลเรียนต่อที่กว่างโจวไหมคะ');

    console.log('\n✅ ส่งคำสั่งทดสอบครบแล้ว กรุณาดู Log จากหน้าต่าง Server ครับ');
}

runTests();
