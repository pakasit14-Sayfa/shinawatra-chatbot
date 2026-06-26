require('dotenv').config();
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const axios = require('axios');

const DIFY_API_KEY_BRAIN_3 = process.env.DIFY_API_KEY_BRAIN_3;

const filesToTest = [
    'ข้อมูลเทรน_เพจ4_เรียนต่อกว่างโจว.csv',
    'ข้อมูลเทรน_เพจ5_เรียนต่อประเทศจีน.csv',
    'ข้อมูลเทรน_เพจ6_เรียนต่อเซี่ยงไฮ้.csv',
    'ข้อมูลเทรน_เพจ7_เรียนต่อชานตง.csv'
];

async function askDify(question, userId) {
    try {
        const response = await axios.post(
            'https://api.dify.ai/v1/chat-messages',
            {
                inputs: {},
                query: question,
                response_mode: 'blocking',
                conversation_id: "",
                user: userId
            },
            {
                headers: {
                    'Authorization': `Bearer ${DIFY_API_KEY_BRAIN_3}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.answer.trim();
    } catch (error) {
        console.error(`Error querying Dify: ${error.message}`);
        return "ERROR";
    }
}

async function run() {
    let markdownOutput = `# ผลการทดสอบเปรียบเทียบคำตอบ (AI vs Admin) ฝั่งจีน\n\n`;
    markdownOutput += `ทดสอบสุ่มตัวอย่างคำถามจากไฟล์ CSV ของเพจจีน ส่งให้ AI Brain 3 ตอบ และเปรียบเทียบกับคำตอบจริงของแอดมิน\n\n`;

    for (const filename of filesToTest) {
        if (!fs.existsSync(filename)) {
            console.log(`[SKIP] File not found: ${filename}`);
            continue;
        }

        console.log(`Processing ${filename}...`);
        markdownOutput += `## 📁 ไฟล์: ${filename.replace('ข้อมูลเทรน_', '').replace('.csv', '')}\n\n`;
        markdownOutput += `| คำถามลูกค้า (Question) | คำตอบแอดมิน (Admin Answer) | คำตอบ AI (Brain 3) |\n`;
        markdownOutput += `|---|---|---|\n`;

        const fileContent = fs.readFileSync(filename, 'utf8');
        let records;
        try {
            records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true,
                trim: true
            });
        } catch (e) {
            console.error(`CSV parse error for ${filename}: ${e.message}`);
            continue;
        }

        // สุ่มมา 5 คำถามที่ไม่สั้นเกินไป
        const validRecords = records.filter(r => r.Question && r.Question.length > 5 && r.Answer);
        const sampleSize = Math.min(5, validRecords.length);
        const samples = [];
        
        // สุ่มแบบง่ายๆ
        for(let i = 0; i < sampleSize; i++) {
            const randomIndex = Math.floor(Math.random() * validRecords.length);
            samples.push(validRecords.splice(randomIndex, 1)[0]);
        }

        for (let i = 0; i < samples.length; i++) {
            const q = samples[i].Question.replace(/\n/g, ' ');
            const adminAns = samples[i].Answer.replace(/\n/g, '<br>');
            
            console.log(`  - Asking Q${i+1}: ${q}`);
            const aiAnsRaw = await askDify(q, `TEST_QA_CHINA_${Date.now()}_${i}`);
            const aiAns = aiAnsRaw.replace(/\n/g, '<br>');
            
            markdownOutput += `| ${q} | ${adminAns} | **${aiAns}** |\n`;
            
            // รอ 1 วิกันโดนบล็อก
            await new Promise(r => setTimeout(r, 1000));
        }
        markdownOutput += `\n`;
    }

    fs.writeFileSync('china_qa_comparison.md', markdownOutput);
    console.log("Done! Results saved to china_qa_comparison.md");
}

run();
