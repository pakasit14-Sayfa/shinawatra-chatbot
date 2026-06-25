const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // กลุ่มกลาง (fallback เมื่อไม่ระบุ campus หรือยังไม่ได้ตั้งกลุ่มของ campus นั้น)

// แต่ละ campus มีกลุ่ม Telegram แยกของตัวเอง กันแจ้งเตือนทุกเพจปนกันจนอ่านยาก
const CAMPUS_CHAT_IDS = {
  Project_1: process.env.TELEGRAM_CHAT_ID_PROJECT_1, // พิษณุโลก
  Project_2: process.env.TELEGRAM_CHAT_ID_PROJECT_2, // ชินวัตร
  Project_3: process.env.TELEGRAM_CHAT_ID_PROJECT_3, // จีน
};

const alertCache = new Map();
const THROTTLE_MS = 5 * 60 * 1000; // 5 นาที

/**
 * ส่งแจ้งเตือนเข้า Telegram
 * @param {string} message ข้อความแจ้งเตือน
 * @param {string} errorKey คีย์สำหรับกันส่งซ้ำ (throttle)
 * @param {string|null} campus ถ้าระบุและมีกลุ่มของ campus นั้นตั้งไว้ จะส่งเข้ากลุ่มนั้นแทนกลุ่มกลาง
 */
async function alertAdmin(message, errorKey = 'general', campus = null) {
  const chatId = (campus && CAMPUS_CHAT_IDS[campus]) || TELEGRAM_CHAT_ID;
  if (!TELEGRAM_BOT_TOKEN || !chatId) return;

  const now = Date.now();
  const lastSent = alertCache.get(errorKey);

  if (lastSent && now - lastSent < THROTTLE_MS) {
    return; // เพิ่งส่งไปไม่ถึง 5 นาที ข้ามไปก่อน (กันสแปม)
  }

  alertCache.set(errorKey, now);

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: message,
    });
  } catch (err) {
    console.error('[Telegram Alert Failed]', err.message);
  }
}

module.exports = { alertAdmin };
