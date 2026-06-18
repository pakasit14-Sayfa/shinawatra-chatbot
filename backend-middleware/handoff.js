/**
 * handoff.js — ระบบ Human Handoff (แบบ Redis TTL)
 *
 * พฤติกรรม:
 *  - แอดมินพิมพ์ตอบลูกค้าในแชทไหน -> ล็อกแชทนั้น บอทหยุดตอบ (Redis Set Key)
 *  - แอดมินพิมพ์ "❤️" หรือคำสั่งเปิดบอท -> ปลดล็อก (Redis Delete Key)
 *  - มี TTL 4 ชั่วโมง (14400 วินาที) หากแอดมินลืมปลดล็อก ระบบจะปลดให้อัตโนมัติ
 */

const { createClient } = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const UNLOCK_KEYWORD = '❤️';
const LOCK_KEYWORD = '😊';
const TTL_SECONDS = 14400; // 4 ชั่วโมง

// ตั้งค่า Redis Client
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || undefined
});

redisClient.on('error', (err) => console.error('[Redis Client Error]', err));

// เชื่อมต่อทันทีที่โหลดไฟล์
(async () => {
    try {
        await redisClient.connect();
        console.log('[handoff] 🟢 เชื่อมต่อ Redis สำหรับระบบ Handoff เรียบร้อยแล้ว');
    } catch (e) {
        console.error('[handoff] 🔴 เชื่อมต่อ Redis ไม่สำเร็จ:', e.message);
    }
})();

function getRedisKey(platform, userId) {
    return `handoff:${platform}:${userId}`;
}

/**
 * ล็อกแชท (แอดมินเข้าเทคโอเวอร์) พร้อมตั้งเวลาหมดอายุ 4 ชั่วโมง
 */
async function lockChat(platform, userId) {
    const key = getRedisKey(platform, userId);
    try {
        // บันทึกสถานะการล็อก (เก็บ timestamp ไว้เช็คเวลาได้) และตั้ง TTL
        await redisClient.set(key, JSON.stringify({ lockedAt: Date.now() }), {
            EX: TTL_SECONDS
        });
        console.log(`[handoff] 🔒 ล็อกแชท ${key} สำเร็จ (บอทหยุดตอบ 4 ชั่วโมง)`);
    } catch (error) {
        console.error(`[handoff Error] ล็อกแชท ${key} ล้มเหลว:`, error.message);
    }
}

/**
 * ปลดล็อกแชท (แอดมินสั่งปลด)
 */
async function unlockChat(platform, userId) {
    const key = getRedisKey(platform, userId);
    try {
        const result = await redisClient.del(key);
        if (result > 0) {
            console.log(`[handoff] 🔓 ปลดล็อกแชท ${key} บอทกลับมาทำงาน`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`[handoff Error] ปลดล็อกแชท ${key} ล้มเหลว:`, error.message);
        return false;
    }
}

/**
 * เช็คว่าแชทนี้ถูกล็อกอยู่ไหม
 */
async function isLocked(platform, userId) {
    const key = getRedisKey(platform, userId);
    try {
        const exists = await redisClient.exists(key);
        return exists === 1;
    } catch (error) {
        console.error(`[handoff Error] เช็คสถานะล็อก ${key} ล้มเหลว:`, error.message);
        return false; // ถ้า Redis มีปัญหา อนุญาตให้บอทตอบไปก่อน หรือจะบังคับปิดก็ได้
    }
}

/**
 * เช็คว่าข้อความนี้คือคำสั่งปลดล็อกไหม
 */
function isUnlockCommand(text) {
    return typeof text === 'string' && text.includes(UNLOCK_KEYWORD);
}

/**
 * เช็คว่าข้อความนี้คือคำสั่งล็อกไหม (แอดมินพิมพ์ "รับเอง")
 */
function isLockCommand(text) {
    return typeof text === 'string' && text.includes(LOCK_KEYWORD);
}

module.exports = { 
    lockChat, 
    unlockChat, 
    isLocked, 
    isUnlockCommand, 
    isLockCommand, 
    UNLOCK_KEYWORD, 
    LOCK_KEYWORD 
};