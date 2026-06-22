const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const pageId = process.env.FB_PAGE_ID_1;
const userId = 'TEST_USER_REPEAT';
const question = 'สวัสดีครับ';

// Wait utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function sendWebhook(mid) {
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
                    text: question
                }
            }]
        }]
    };

    try {
        const res = await axios.post('http://localhost:3005/webhook/meta', payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ ส่งข้อความ: "${question}" (mid: ${mid}) - Status: ${res.status}`);
    } catch (err) {
        console.error(`❌ ส่งล้มเหลว: ${err.message}`);
    }
}

async function runTest() {
    console.log(`🚀 เริ่มต้นทดสอบยิงคำถามเดิมซ้ำๆ เพื่อดูว่า AI จะตอบวนลูปหรือไม่...\n`);
    
    for (let i = 1; i <= 3; i++) {
        const mid = `mid.repeat.${Date.now()}.${i}`;
        console.log(`\n--- ส่งครั้งที่ ${i} ---`);
        await sendWebhook(mid);
        
        if (i < 3) {
            console.log(`⏳ รอ 10 วินาทีให้ AI ตอบกลับและบันทึกความจำก่อนส่งครั้งถัดไป...`);
            await sleep(10000);
        }
    }
    
    console.log('\n✅ ยิงข้อความซ้ำครบ 3 ครั้งแล้ว โปรดตรวจสอบ Log ของ Server (task-187)');
}

runTest();
