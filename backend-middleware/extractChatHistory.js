require('dotenv').config();
const axios = require('axios');
const moment = require('moment-timezone');
const fs = require('fs');

const PAGE_ACCESS_TOKEN = process.env.FB_PAGE_TOKEN_1;
const PAGE_ID = process.env.FB_PAGE_ID_1;
const TIMEZONE = process.env.TIMEZONE || 'Asia/Bangkok';

// ============ ขั้นที่ 1: ดึงรายชื่อแชท ============
async function getConversationsList(days = 90) {
  try {
    console.log(`\n📜 ดึงรายชื่อแชทย้อนหลัง ${days} วัน...\n`);

    const startDate = moment().tz(TIMEZONE).subtract(days, 'days').unix();
    const endDate = moment().tz(TIMEZONE).unix();

    console.log(`⏰ ตั้งแต่: ${moment.unix(startDate).tz(TIMEZONE).format('YYYY-MM-DD HH:mm')}`);
    console.log(`⏰ ถึง: ${moment.unix(endDate).tz(TIMEZONE).format('YYYY-MM-DD HH:mm')}\n`);

    const response = await axios.get(
      `https://graph.facebook.com/v19.0/${PAGE_ID}/conversations`,
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN,
          fields: 'id,updated_time',
          limit: 100
        }
      }
    );

    const conversations = response.data.data || [];
    console.log(`✅ พบแชท (ชุดแรก): ${conversations.length} สนทนา\n`);
    // Note: To be fully comprehensive, pagination should be handled here too, but for simplicity we take top recent ones.

    return conversations;

  } catch (error) {
    console.error("❌ Error getConversationsList:", error.response?.data || error.message);
    return [];
  }
}

// ============ ขั้นที่ 2: ดึงข้อความทั้งหมดจากแต่ละแชท ============
async function getFullConversationMessages(conversationId) {
  try {
    let allMessages = [];
    let nextPage = null;
    let pageCount = 0;

    do {
      const params = {
        access_token: PAGE_ACCESS_TOKEN,
        fields: 'id,message,created_time,from,attachments',
        limit: 100
      };

      if (nextPage) {
        params.after = nextPage;
      }

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

      await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit

    } while (nextPage && pageCount < 5); // Limit depth to prevent infinite loops

    return allMessages.reverse(); // Reverse to get chronological order (oldest first)

  } catch (error) {
    console.error(`  ❌ Error getFullConversationMessages:`, error.response?.data || error.message);
    return [];
  }
}

// ============ ขั้นที่ 3: แยกเป็นคู่ User-Assistant ============
async function extractChatPairs(conversationId, messages) {
  const chatPairs = [];

  if (messages.length < 2) return chatPairs;

  for (let i = 0; i < messages.length - 1; i++) {
    const currentMsg = messages[i];
    const nextMsg = messages[i + 1];

    if (!currentMsg.message || !nextMsg.message) continue;

    const isFromUser = currentMsg.from && currentMsg.from.id !== PAGE_ID;
    const isReplyFromPage = nextMsg.from && nextMsg.from.id === PAGE_ID;

    // We look for: User asks -> Page answers
    if (isFromUser && isReplyFromPage) {
      chatPairs.push({
        user_message: currentMsg.message.trim(),
        assistant_message: nextMsg.message.trim()
      });
    }
  }

  return chatPairs;
}

// ============ ขั้นที่ 4: ดึงประวัติแชททั้งหมด ============
async function fullHistoryExtraction(days = 90) {
  console.log(`\n🚀 === เริ่มดึงประวัติแชท ${days} วัน ===\n`);
  const startTime = Date.now();

  try {
    const conversations = await getConversationsList(days);
    if (conversations.length === 0) return [];

    const allChatData = [];
    let totalMessages = 0;

    for (let i = 0; i < conversations.length; i++) {
      const convId = conversations[i].id;
      const messages = await getFullConversationMessages(convId);
      totalMessages += messages.length;

      const pairs = await extractChatPairs(convId, messages);
      allChatData.push(...pairs);

      process.stdout.write(`\rดึงข้อความ... [${i + 1}/${conversations.length}]`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`\n\n✅ === ดึงประวัติเสร็จสิ้น ===`);
    console.log(`⏱️ เวลาที่ใช้: ${duration} นาที`);
    console.log(`📊 รวมสนทนา (User-Assistant): ${allChatData.length}\n`);

    return allChatData;

  } catch (error) {
    console.error("❌ Error:", error.message);
    return [];
  }
}

module.exports = { fullHistoryExtraction };
