const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const pageId = process.env.FB_PAGE_ID_2;
const userId = 'TEST_USER_MEMORY_' + Date.now();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendWebhook(mid, text) {
    const payload = {
        object: "page",
        entry: [{
            id: pageId,
            time: Date.now(),
            messaging: [{
                sender: { id: userId },
                recipient: { id: pageId },
                timestamp: Date.now(),
                message: {
                    mid: mid,
                    text: text
                }
            }]
        }]
    };

    try {
        const res = await axios.post('http://localhost:3005/webhook/meta', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ ส่งข้อความ: "${text}" (mid: ${mid}) - Status: ${res.status}`);
    } catch (err) {
        console.error(`❌ ส่งล้มเหลว: ${err.message}`);
    }
}

async function runTest() {
    console.log(`🚀 เริ่มต้นทดสอบความจำ (Context Memory) ของ AI...`);
    
    // คำถามที่ 1: ให้ข้อมูล
    await sendWebhook(`mid.mem.1`, "สวัสดีครับ ผมชื่อ สมชาย นะครับ");
    console.log(`⏳ รอ 10 วินาทีให้ AI ประมวลผล...`);
    await sleep(10000);

    // คำถามที่ 2: ถามข้อมูลเดิมเพื่อดูว่าจำได้ไหม
    await sendWebhook(`mid.mem.2`, "เมื่อกี้ผมบอกว่าผมชื่ออะไรครับ?");
    console.log(`⏳ รอ 10 วินาที...`);
    await sleep(10000);
    
    // คำถามที่ 3: ลองถามซ้ำอีกที
    await sendWebhook(`mid.mem.3`, "ย้ำอีกที ผมชื่ออะไรครับ?");
}

runTest();
