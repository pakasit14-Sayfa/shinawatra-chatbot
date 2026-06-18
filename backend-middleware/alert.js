const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const alertCache = new Map();
const THROTTLE_MS = 5 * 60 * 1000; // 5 นาที

/**
 * ส่งแจ้งเตือนเข้า Telegram
 * @param {string} message ข้อความแจ้งเตือน
 * @param {string} errorKey คีย์สำหรับกันส่งซ้ำ (throttle)
 */
async function alertAdmin(message, errorKey = 'general') {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;

  const now = Date.now();
  const lastSent = alertCache.get(errorKey);
  
  if (lastSent && now - lastSent < THROTTLE_MS) {
    return; // เพิ่งส่งไปไม่ถึง 5 นาที ข้ามไปก่อน (กันสแปม)
  }

  alertCache.set(errorKey, now);

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
    });
  } catch (err) {
    console.error('[Telegram Alert Failed]', err.message);
  }
}

module.exports = { alertAdmin };
