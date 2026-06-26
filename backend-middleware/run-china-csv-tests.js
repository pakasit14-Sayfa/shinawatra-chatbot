const fs = require('fs');
const axios = require('axios');
const csv = require('csv-parse/sync');
require('dotenv').config();

const delay = ms => new Promise(res => setTimeout(res, ms));

const PAGES = [
  { file: 'ข้อมูลเทรน_เพจ4_เรียนต่อกว่างโจว.csv', pageId: process.env.FB_PAGE_ID_4 },
  { file: 'ข้อมูลเทรน_เพจ5_เรียนต่อประเทศจีน.csv', pageId: process.env.FB_PAGE_ID_5 },
  { file: 'ข้อมูลเทรน_เพจ6_เรียนต่อเซี่ยงไฮ้.csv', pageId: process.env.FB_PAGE_ID_6 },
  { file: 'ข้อมูลเทรน_เพจ7_เรียนต่อชานตง.csv', pageId: process.env.FB_PAGE_ID_7 },
];

async function runTests() {
  for (const page of PAGES) {
    if (!fs.existsSync(page.file)) {
      console.log(`[SKIP] File not found: ${page.file}`);
      continue;
    }
    if (!page.pageId) {
      console.log(`[SKIP] Page ID not configured for ${page.file}`);
      continue;
    }
    
    console.log(`\n===========================================`);
    console.log(`[START] Processing ${page.file} for Page ID: ${page.pageId}`);
    console.log(`===========================================\n`);

    let fileContent = fs.readFileSync(page.file, 'utf-8');
    if (fileContent.charCodeAt(0) === 0xFEFF) fileContent = fileContent.substring(1);
    
    let rows = [];
    try {
        rows = csv.parse(fileContent, { columns: true, skip_empty_lines: true });
    } catch (e) {
        console.error("Parse Error using csv-parse. Falling back to simple split...");
        const lines = fileContent.split('\n');
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const match = line.match(/^"([^"]+)"/);
            if (match) {
                rows.push({ Question: match[1] });
            } else {
                const parts = line.split('","');
                if (parts[0]) {
                   let q = parts[0];
                   if (q.startsWith('"')) q = q.substring(1);
                   rows.push({ Question: q });
                }
            }
        }
    }

    const uniqueQuestions = [...new Set(rows.map(r => r.Question).filter(q => q && q.trim() !== ''))];
    
    console.log(`Found ${uniqueQuestions.length} unique questions.`);

    let count = 0;
    for (const q of uniqueQuestions) {
      count++;
      console.log(`[${count}/${uniqueQuestions.length}] Sending: "${q}"`);
      
      const payload = {
        object: "page",
        entry: [
          {
            id: page.pageId,
            time: Date.now(),
            messaging: [
              {
                sender: { id: `TEST_CHINA_${page.pageId}_Q${count}` },
                recipient: { id: page.pageId },
                timestamp: Date.now(),
                message: {
                  mid: `test_mid_${Date.now()}_${count}`,
                  text: q
                }
              }
            ]
          }
        ]
      };

      try {
        await axios.post('http://localhost:3005/webhook/meta', payload, {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error(`  -> [ERROR] POST failed: ${err.response ? err.response.status : err.message}`);
        if (err.response && err.response.status === 429) {
            console.log("  -> Rate limit hit! Sleeping for 5 seconds...");
            await delay(5000);
        }
      }

      // หน่วง 1.5 วิ เหมือนเดิม
      await delay(1500);
    }
  }
  
  console.log("\n✅ Finished sending all questions from all China CSV files!");
}

runTests();
