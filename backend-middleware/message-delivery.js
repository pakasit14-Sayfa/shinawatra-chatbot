/**
 * message-delivery.js (v2 — แก้ไขตามผลรีวิว)
 *
 * เปลี่ยนจาก v1:
 *  1. ใช้ axios แทน fetch -> axios จะ throw ทันทีเมื่อ API ตอบ error (4xx/5xx)
 *     ทำให้ fallback "ส่งลิงก์แทนรูป" ทำงานได้จริง และ error โผล่ใน log ให้เห็น
 *  2. เพิ่ม buildLineMessages() สำหรับฝั่ง LINE แบบ reply token
 *     (แปลง segments เป็น messages array สูงสุด 5 bubbles ใน 1 reply — ฟรี ไม่กินโควต้า push)
 *  3. ลบแท็ก <think>...</think> ใน parseSegments (ย้ายมาจาก extractContent เดิม)
 *  4. ไม่หน่วงเวลาหลัง segment สุดท้าย (ตอบจบเร็วขึ้น 1.5 วิ)
 */

const axios = require('axios');

// ============================================================
// ส่วนที่ 1: ตัวแยกข้อความ/รูป (ใช้ร่วมกันทั้ง FB และ LINE)
// ============================================================

function parseSegments(text) {
  const segments = [];

  // ลบแท็ก <think> ของโมเดลตระกูล thinking ออกก่อน (ของเดิมจาก extractContent)
  let cleaned = String(text || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // เกราะชั้นสอง: ลบ Tag รหัสสถานะที่อาจหลุดมาจาก Dify (ปกติ Code Node ใน Dify ลบให้แล้ว
  // แต่ถ้า Dify พลาด อันนี้กันไม่ให้ Tag หลุดถึงลูกค้าทั้ง FB และ LINE)
  // ทนช่องว่างภายในวงเล็บ เช่น [ สถานะ: บัญชี ]
  const TAG_REGEX = /\[\s*(?:รอข้อมูล|ส่งฟอร์ม|จบการสนทนา|ติดต่อแอดมิน|สถานะ\s*:\s*(?:บัญชี|นิติ|รัฐประศาสนศาสตร์|ป\.โท|ป\.เอก|ป\.บัณฑิต))\s*\]/g;
  cleaned = cleaned.replace(TAG_REGEX, '').trim();

  if (!cleaned) return segments;

  // จับทั้ง Markdown image ![...](URL) และลิงก์รูปลอยๆ
  const imgRegex = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s]*)?)/gi;

  const blocks = cleaned.split('===').map(b => b.trim()).filter(Boolean);

  for (const block of blocks) {
    let lastIndex = 0;
    let match;
    imgRegex.lastIndex = 0;

    while ((match = imgRegex.exec(block)) !== null) {
      const before = block.slice(lastIndex, match.index).trim();
      if (before) segments.push({ type: 'text', content: before });

      const url = match[1] || match[2];
      segments.push({ type: 'image', url });

      lastIndex = match.index + match[0].length;
    }

    const rest = block.slice(lastIndex).trim();
    if (rest) segments.push({ type: 'text', content: rest });
  }

  return segments;
}

// ============================================================
// ส่วนที่ 2: Facebook Messenger (Send API ผ่าน axios)
// ============================================================

function metaUrl(token) {
  return `https://graph.facebook.com/v19.0/me/messages?access_token=${token}`;
}

async function fbSendText(recipientId, text, token) {
  if (!text || text.trim().length === 0) {
    console.error('[FB Send Error] Attempted to send empty text message');
    return;
  }
  await axios.post(metaUrl(token), {
    recipient: { id: recipientId },
    message: { text },
  });
}

async function fbSendImage(recipientId, imageUrl, token) {
  if (!imageUrl || imageUrl.trim().length === 0) {
    console.error('[FB Send Error] Attempted to send empty image URL');
    return;
  }
  await axios.post(metaUrl(token), {
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: 'image',
        payload: { url: imageUrl, is_reusable: true },
      },
    },
  });
}

// ============================================================
// ส่วนที่ 3: LINE — สร้าง messages array สำหรับ reply token
// ============================================================

/**
 * แปลง segments เป็น LINE messages (สูงสุด 5 bubbles ต่อ 1 reply)
 * ใช้กับ reply API แบบเดิมของคุณได้เลย -> ฟรี ไม่กินโควต้า push message
 * ลำดับ ข้อความ -> รูป -> ข้อความ จะถูกรักษาไว้ตามต้นฉบับ
 */
function buildLineMessages(difyText) {
  if (!difyText || difyText.trim().length === 0) {
    console.error('[LINE Build Error] Empty text received');
    return [];
  }
  const segments = parseSegments(difyText);
  const messages = segments.map(seg =>
    seg.type === 'text'
      ? { type: 'text', text: seg.content }
      : { type: 'image', originalContentUrl: seg.url, previewImageUrl: seg.url }
  );

  // LINE จำกัด 5 messages ต่อ 1 reply: ถ้าเกิน ให้รวบข้อความ text ที่ติดกันเข้าด้วยกัน
  if (messages.length > 5) {
    const merged = [];
    for (const m of messages) {
      const last = merged[merged.length - 1];
      if (m.type === 'text' && last && last.type === 'text') {
        last.text += '\n\n' + m.text;
      } else {
        merged.push(m);
      }
    }
    return merged.slice(0, 5); // กันสุดท้ายถ้ายังเกิน 5 จริงๆ
  }

  return messages;
}

// ============================================================
// ส่วนที่ 4: ส่งทีละท่อนแบบ human-like (Facebook)
// ============================================================

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// จำข้อความที่บอทเพิ่งส่งออกไป (ชั่วคราว) เพื่อแยก echo ของบอทเองออกจากแอดมินพิมพ์มือ
const recentBotMessages = new Set();
function rememberBotMessage(userId, text) {
  if (!text) return;
  const key = `${userId}::${text.trim()}`;
  recentBotMessages.add(key);
  setTimeout(() => recentBotMessages.delete(key), 30000); // เก็บ 30 วิ พอให้ echo เด้งกลับ
}

function isBotsOwnEcho(userId, text) {
  return recentBotMessages.has(`${userId}::${(text || '').trim()}`);
}

async function deliverMessage(platform, userId, difyText, onError = null, fbAccessToken = null) {
  const segments = parseSegments(difyText);

  if (platform === 'facebook') {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      try {
        if (seg.type === 'text') {
          rememberBotMessage(userId, seg.content); // จำทีละ segment ที่ส่งจริง
          await fbSendText(userId, seg.content, fbAccessToken);
        } else {
          await fbSendImage(userId, seg.url, fbAccessToken);
        }
      } catch (err) {
        // axios throw เมื่อ FB ตอบ error -> เห็นสาเหตุจริงใน log
        const reason = err.response?.data?.error?.message || err.response?.data?.error || err.message;
        console.error('[FB send error]', reason);
        if (typeof onError === 'function') onError(reason); // แจ้งกลับให้ server แจ้งเตือน Telegram
        if (seg.type === 'image') {
          // fallback: ส่งเป็นลิงก์ข้อความแทน ลูกค้ายังกดดูได้
          await fbSendText(userId, `ดูตารางค่าเทอมได้ที่นี่ค่ะ: ${seg.url}`, fbAccessToken).catch(() => {});
        }
      }
      // หน่วงเฉพาะ "ระหว่าง" ข้อความ ไม่หน่วงหลังอันสุดท้าย
      if (i < segments.length - 1) await delay(1500);
    }
  }
}

module.exports = { parseSegments, deliverMessage, buildLineMessages, isBotsOwnEcho };
