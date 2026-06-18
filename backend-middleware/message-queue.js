/**
 * message-queue.js (v2 — รองรับ meta เช่น replyToken ของ LINE)
 *
 * กลไก 3 ชั้น:
 *  1. กัน event ซ้ำด้วย message ID (Facebook mid / LINE message id)
 *  2. รวบข้อความที่พิมพ์รัวภายใน 2.5 วิ เป็นก้อนเดียว (เก็บ meta ของข้อความ "ล่าสุด" ไว้
 *     เช่น replyToken ตัวใหม่สุด เพราะ token เก่าอาจหมดอายุ)
 *  3. คิวต่อผู้ใช้: งานใหม่รอให้งานเก่าตอบจบสนิทก่อน กันคำตอบแทรกสลับกัน
 */

// ---------- ชั้นที่ 1: กันซ้ำ ----------

const seenMessageIds = new Map(); // id -> timestamp
const DEDUP_TTL_MS = 10 * 60 * 1000;

function isDuplicate(messageId) {
  if (!messageId) return false;
  const now = Date.now();

  if (seenMessageIds.size > 5000) {
    for (const [id, ts] of seenMessageIds) {
      if (now - ts > DEDUP_TTL_MS) seenMessageIds.delete(id);
    }
  }

  if (seenMessageIds.has(messageId)) return true;
  seenMessageIds.set(messageId, now);
  return false;
}

// ---------- ชั้นที่ 2: รวบข้อความรัว ----------

const BUFFER_WAIT_MS = 2500;
const userBuffers = new Map(); // userId -> { texts, meta, timer, processFn }

function bufferMessage(userId, text, meta, processFn) {
  let buf = userBuffers.get(userId);
  if (!buf) {
    buf = { texts: [], meta: {}, timer: null, processFn };
    userBuffers.set(userId, buf);
  }

  buf.texts.push(text);
  buf.meta = { ...buf.meta, ...meta }; // เก็บค่าใหม่สุดทับ (replyToken ล่าสุดชนะ)

  if (buf.timer) clearTimeout(buf.timer);
  buf.timer = setTimeout(() => {
    const combined = buf.texts.join('\n');
    const finalMeta = buf.meta;
    const fn = buf.processFn;
    userBuffers.delete(userId);
    enqueueJob(userId, combined, finalMeta, fn);
  }, BUFFER_WAIT_MS);
}

// ---------- ชั้นที่ 3: คิวต่อผู้ใช้ ----------

const userQueues = new Map();

function enqueueJob(userId, text, meta, processFn) {
  const prev = userQueues.get(userId) || Promise.resolve();

  const next = prev
    .then(() => processFn(userId, text, meta))
    .catch((err) => {
      console.error(`[queue] error for user ${userId}:`, err.message || err);
    });

  userQueues.set(userId, next);
  next.finally(() => {
    if (userQueues.get(userId) === next) userQueues.delete(userId);
  });
}

// ---------- ทางเข้าหลัก ----------

/**
 * @param {object} opts
 * @param {string} opts.userId
 * @param {string} opts.messageId - ใช้กัน event ซ้ำ (FB: message.mid, LINE: message.id)
 * @param {string} opts.text
 * @param {object} [opts.meta]    - ข้อมูลแนบ เช่น { replyToken } (จะได้ตัวล่าสุดเสมอ)
 * @param {function} opts.processFn - (userId, combinedText, meta) => Promise
 */
function handleIncoming({ userId, messageId, text, meta = {}, processFn }) {
  if (isDuplicate(messageId)) {
    console.log(`[dedup] skip duplicate id=${messageId}`);
    return;
  }
  bufferMessage(userId, text, meta, processFn);
}

module.exports = { handleIncoming };
