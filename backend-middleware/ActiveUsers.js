const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const STATE_FILE = path.join(__dirname, 'active-users.json');
const MAX_USERS = 50; // เก็บย้อนหลัง 50 คนล่าสุด

let activeUsers = {}; 
// โครงสร้าง: { "line:U123": { platform: "line", userId: "U123", lastActive: 123456789, lastMessage: "สนใจ" } }

function loadUsers() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            activeUsers = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
        }
    } catch (e) {
        console.error('[ActiveUsers] โหลดสถานะไม่สำเร็จ:', e.message);
        activeUsers = {};
    }
}

function saveUsers() {
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(activeUsers, null, 2));
    } catch (e) {
        console.error('[ActiveUsers] บันทึกสถานะไม่สำเร็จ:', e.message);
    }
}

loadUsers();

/**
 * บันทึกว่ามีลูกค้าทักมา (เรียกตอนมี Webhook เข้า)
 */
function trackUser(platform, userId, text) {
    const key = `${platform}:${userId}`;
    const existing = activeUsers[key] || {};
    
    activeUsers[key] = {
        ...existing,
        platform,
        userId,
        lastActive: Date.now(),
        lastMessage: text ? text.substring(0, 50) : '(ไม่มีข้อความ)' // ย่อข้อความ
    };

    // ดึงชื่อถ้ายังไม่มี
    if (!activeUsers[key].displayName) {
        fetchDisplayName(platform, userId).then(name => {
            if (name && activeUsers[key]) {
                activeUsers[key].displayName = name;
                saveUsers();
            }
        });
    }

    // ลบคนที่เก่าเกินไป เพื่อไม่ให้ไฟล์ใหญ่เกิน (เก็บแค่ MAX_USERS ล่าสุด)
    const keys = Object.keys(activeUsers);
    if (keys.length > MAX_USERS) {
        // เรียงตาม lastActive จากเก่าไปใหม่
        keys.sort((a, b) => activeUsers[a].lastActive - activeUsers[b].lastActive);
        // ลบอันที่เก่าที่สุด
        const keysToDelete = keys.slice(0, keys.length - MAX_USERS);
        for (const k of keysToDelete) {
            delete activeUsers[k];
        }
    }

    saveUsers();
}

/**
 * ดึงรายชื่อลูกค้าทั้งหมดเรียงตามคนล่าสุด
 */
function getActiveUsers() {
    return Object.values(activeUsers).sort((a, b) => b.lastActive - a.lastActive);
}

async function fetchDisplayName(platform, userId) {
    try {
        if (platform === 'line') {
            const res = await axios.get(`https://api.line.me/v2/bot/profile/${userId}`, {
                headers: { 'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` }
            });
            return res.data.displayName;
        } else if (platform === 'meta') {
            const res = await axios.get(`https://graph.facebook.com/${userId}?fields=first_name,last_name,name&access_token=${process.env.FB_PAGE_TOKEN}`);
            const data = res.data;
            if (data.name) return data.name;
            if (data.first_name && data.last_name) return `${data.first_name} ${data.last_name}`;
            return data.first_name || data.last_name || null;
        }
    } catch (e) {
        console.error(`[ActiveUsers] ดึงชื่อไม่สำเร็จ (${platform}):`, e.response?.data || e.message);
    }
    return null;
}

module.exports = { trackUser, getActiveUsers };
