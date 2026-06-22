const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const pages = [
  { id: process.env.FB_PAGE_ID_1, file: 'ข้อมูลเทรน_เพจ1_มหาวิทยาลัยพิษณุโลก.csv', name: 'Page 1 (พิษณุโลก)' },
  { id: process.env.FB_PAGE_ID_2, file: 'ข้อมูลเทรน_เพจ2_มหาวิทยาลัยชินวัตร.csv', name: 'Page 2 (ชินวัตร)' },
  { id: process.env.FB_PAGE_ID_3, file: 'ข้อมูลเทรน_เพจ3_พยาบาลชินวัตร.csv', name: 'Page 3 (พยาบาลชินวัตร)' },
  { id: process.env.FB_PAGE_ID_4, file: 'ข้อมูลเทรน_เพจ4_เรียนต่อกว่างโจว.csv', name: 'Page 4 (เรียนต่อกว่างโจว)' },
  { id: process.env.FB_PAGE_ID_5, file: 'ข้อมูลเทรน_เพจ5_เรียนต่อประเทศจีน.csv', name: 'Page 5 (เรียนต่อประเทศจีน)' },
  { id: process.env.FB_PAGE_ID_6, file: 'ข้อมูลเทรน_เพจ6_เรียนต่อเซี่ยงไฮ้.csv', name: 'Page 6 (เรียนต่อเซี่ยงไฮ้)' },
  { id: process.env.FB_PAGE_ID_7, file: 'ข้อมูลเทรน_เพจ7_เรียนต่อชานตง.csv', name: 'Page 7 (เรียนต่อชานตง)' },
];

// Helper: Read a random question from CSV
function getRandomQuestion(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const lines = data.split('\n').filter(l => l.trim().length > 0);
        // Skip header
        const randomLine = lines[Math.floor(Math.random() * (lines.length - 1)) + 1];
        // Simple CSV parse: split by first comma, or just take everything before first comma
        const question = randomLine.split(',')[0].replace(/"/g, '').trim();
        return question || 'สวัสดี';
    } catch (e) {
        console.error(`Cannot read ${filename}`, e.message);
        return 'สวัสดี';
    }
}

async function runTest() {
    console.log('🚀 เริ่มต้นการทดสอบยิง Webhook พร้อมกัน 7 เพจ...\n');

    const promises = pages.map((page, index) => {
        const question = getRandomQuestion(page.file);
        const userId = `TEST_USER_${index + 1}`;
        const mid = `mid.${Date.now()}.${index}`;
        
        console.log(`[เตรียมส่ง] ${page.name} | User: ${userId} | คำถาม: "${question}"`);

        const payload = {
            object: "page",
            entry: [{
                id: page.id,
                time: Date.now(),
                messaging: [{
                    sender: { id: userId },
                    recipient: { id: page.id },
                    timestamp: Date.now(),
                    message: {
                        mid: mid,
                        text: question
                    }
                }]
            }]
        };

        return axios.post('http://localhost:3005/webhook/meta', payload, {
            headers: { 'Content-Type': 'application/json' }
        }).then(res => {
            console.log(`✅ ยิงสำเร็จ: ${page.name} (Status: ${res.status})`);
        }).catch(err => {
            console.error(`❌ ยิงล้มเหลว: ${page.name} - ${err.message}`);
        });
    });

    await Promise.all(promises);
    console.log('\n✅ ยิง Webhook ครบทั้ง 7 เพจแล้ว! โปรดดูที่ Log ของ Server (task-187) เพื่อตรวจสอบคำตอบของ AI ว่าตอบมั่วหรือไม่');
}

runTest();
