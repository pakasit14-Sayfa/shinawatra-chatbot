require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');

const TIMEZONE = process.env.TIMEZONE || 'Asia/Bangkok';
const DAYS_TO_FETCH = 180; // ย้อนหลัง 6 เดือน

async function getPageName(pageId, token) {
  try {
    const res = await axios.get(`https://graph.facebook.com/v19.0/${pageId}?fields=name&access_token=${token}`);
    return res.data.name;
  } catch (err) {
    console.error(`❌ ไม่สามารถดึงชื่อเพจ ${pageId} ได้:`, err.response?.data || err.message);
    return `Page_${pageId}`;
  }
}

async function getConversationsList(pageId, token, days) {
  try {
    const startDate = moment().tz(TIMEZONE).subtract(days, 'days').unix();
    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${pageId}/conversations`,
      {
        params: {
          access_token: token,
          fields: 'id,updated_time',
          limit: 100
        }
      }
    );
    return response.data.data || [];
  } catch (error) {
    console.error("❌ Error getConversationsList:", error.response?.data || error.message);
    return [];
  }
}

async function getFullConversationMessages(conversationId, token) {
  try {
    let allMessages = [];
    let nextPage = null;
    let pageCount = 0;

    do {
      const params = {
        access_token: token,
        fields: 'id,message,created_time,from,attachments',
        limit: 100
      };

      if (nextPage) params.after = nextPage;

      const response = await axios.get(
        `https://graph.facebook.com/v19.0/${conversationId}/messages`,
        { params }
      );

      if (response.data && response.data.data) {
         allMessages = [...allMessages, ...response.data.data];
         pageCount++;
         nextPage = response.data.paging?.cursors?.after;
      } else {
         nextPage = null;
      }
      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit 500ms
    } while (nextPage && pageCount < 5);

    return allMessages.reverse(); // เก่าสุดขึ้นก่อน
  } catch (error) {
    return [];
  }
}

async function extractChatPairs(pageId, messages) {
  const chatPairs = [];
  if (messages.length < 2) return chatPairs;

  for (let i = 0; i < messages.length - 1; i++) {
    const currentMsg = messages[i];
    const nextMsg = messages[i + 1];

    if (!currentMsg.message || !nextMsg.message) continue;

    const isFromUser = currentMsg.from && currentMsg.from.id !== pageId;
    const isReplyFromPage = nextMsg.from && nextMsg.from.id === pageId;

    if (isFromUser && isReplyFromPage) {
      chatPairs.push({
        user_message: currentMsg.message.trim(),
        assistant_message: nextMsg.message.trim()
      });
    }
  }
  return chatPairs;
}

function cleanAndToCSV(chatPairs, filename) {
  if (chatPairs.length === 0) {
    console.log(`⚠️ ไม่มีข้อความที่สามารถนำมาสร้างไฟล์ได้`);
    return;
  }

  let duplicateCount = 0;
  const seenPairs = new Set();
  const cleanedLines = [];

  for (const pair of chatPairs) {
    if (pair.user_message.length < 2 || pair.assistant_message.length < 2) continue; // ข้ามข้อความที่สั้นเกินไป

    let q = pair.user_message.replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
    let a = pair.assistant_message.replace(/"/g, '""').replace(/[\r\n]+/g, ' ');
    const csvLine = `"${q}","${a}"`;

    if (!seenPairs.has(csvLine)) {
      seenPairs.add(csvLine);
      cleanedLines.push(csvLine);
    } else {
      duplicateCount++;
    }
  }

  const csvContent = '\uFEFFQuestion,Answer\n' + cleanedLines.join('\n') + '\n';
  fs.writeFileSync(filename, csvContent, 'utf8');

  console.log(`\n💾 บันทึกไฟล์สำเร็จ: ${filename}`);
  console.log(`   - ก่อนล้าง: ${chatPairs.length} ข้อความ`);
  console.log(`   - ข้อมูลซ้ำ/สั้นเกินไป: ${duplicateCount} ข้อความ`);
  console.log(`   - ✨ พร้อมใช้งาน: ${cleanedLines.length} ข้อความ\n`);
}

async function runPipeline() {
  console.log("╔════════════════════════════════════════════════════╗");
  console.log("║     ระบบดูดแชท Meta แยกตามเพจ + ล้างข้อมูล (CSV)     ║");
  console.log("╚════════════════════════════════════════════════════╝\n");

  const targetPage = process.argv[2];
  const startIdx = targetPage ? parseInt(targetPage, 10) : 1;
  const endIdx = targetPage ? parseInt(targetPage, 10) : 7;

  let foundAnyPage = false;

  for (let i = startIdx; i <= endIdx; i++) {
    const pageId = process.env[`FB_PAGE_ID_${i}`];
    const token = process.env[`FB_PAGE_TOKEN_${i}`];

    if (!pageId || !token || pageId.includes('ใส่_ID') || token.includes('ใส่_Token')) {
      continue;
    }
    
    foundAnyPage = true;
    console.log(`======================================`);
    console.log(`📦 กำลังประมวลผล เพจลำดับที่ ${i} (ID: ${pageId})`);
    
    const pageName = await getPageName(pageId, token);
    // ทำชื่อไฟล์ให้ปลอดภัย (รองรับภาษาไทย)
    let safeName = pageName.replace(/[^a-zA-Z0-9ก-๙เแโใไาีืึุูะัิ]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').substring(0, 30);
    if (!safeName) safeName = `Page_${pageId}`;
    
    console.log(`📛 ชื่อเพจ: ${pageName}`);

    const conversations = await getConversationsList(pageId, token, DAYS_TO_FETCH);
    if (conversations.length === 0) {
      console.log(`⚠️ ไม่พบการสนทนาในเพจนี้\n`);
      continue;
    }

    let allPairs = [];
    for (let c = 0; c < conversations.length; c++) {
      const convId = conversations[c].id;
      const messages = await getFullConversationMessages(convId, token);
      const pairs = await extractChatPairs(pageId, messages);
      allPairs.push(...pairs);
      
      process.stdout.write(`\rดึงข้อความ... [${c + 1}/${conversations.length}] คุยกันทั้งหมด: ${allPairs.length} ประโยค`);
      await new Promise(res => setTimeout(res, 500));
    }

    const filename = `training_data_Page${i}_${safeName}_cleaned.csv`;
    cleanAndToCSV(allPairs, filename);
  }

  if (!foundAnyPage) {
    console.log("❌ ไม่พบการตั้งค่าเพจในไฟล์ .env เลยครับ โปรดตรวจสอบ FB_PAGE_ID และ FB_PAGE_TOKEN");
  } else {
    console.log("🎉 === ดำเนินการครบทุกเพจที่ตั้งค่าไว้เรียบร้อยแล้ว === 🎉");
  }
}

runPipeline();
