require('dotenv').config();

/**
 * 🌍 Multi-Tenancy Configuration (รองรับ 3 สมอง, 3 LINE, 7 Facebook Pages)
 * โครงสร้างนี้ใช้สำหรับการเชื่อมโยงเพจ/LINE เข้ากับสมอง Dify ที่ถูกต้อง
 */

const CONFIG = {
  tenants: {
    // ==========================================
    // 🟢 LINE Official Account (3 ตัว)
    // ==========================================
    
    // Webhook Path ที่ต้องไปกรอกใน LINE Dev: https://...ngrok.../webhook/line/1
    'line_1': {
      campus: 'Project_1',
      channel: 'line',
      pageName: 'LINE ตัวที่ 1',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_1,  // ดึงสมองที่ 1
      lineAccessToken: process.env.LINE_TOKEN_1,     // ใช้กุญแจส่งของ LINE 1
      personaPrefix: "[System: ตอบคำถามสั้นๆ สุภาพ]\n\nคำถาม: "
    },

    // Webhook Path ที่ต้องไปกรอกใน LINE Dev: https://...ngrok.../webhook/line/2
    'line_2': {
      campus: 'Project_2',
      channel: 'line',
      pageName: 'LINE ตัวที่ 2',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_2,  // ดึงสมองที่ 2
      lineAccessToken: process.env.LINE_TOKEN_2,     // ใช้กุญแจส่งของ LINE 2
      personaPrefix: "[System: ตอบคำถามทางการ]\n\nคำถาม: "
    },

    // Webhook Path ที่ต้องไปกรอกใน LINE Dev: https://...ngrok.../webhook/line/3
    'line_3': {
      campus: 'Project_3',
      channel: 'line',
      pageName: 'LINE ตัวที่ 3',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_3,  // ดึงสมองที่ 3
      lineAccessToken: process.env.LINE_TOKEN_3,     // ใช้กุญแจส่งของ LINE 3
      personaPrefix: "[System: ตอบคำถามเป็นกันเอง]\n\nคำถาม: "
    },

    // ==========================================
    // 🔵 Facebook Pages (7 เพจ)
    // ==========================================

    [process.env.FB_PAGE_ID_1]: {
      campus: 'Project_1',
      channel: 'facebook',
      pageName: 'FB เพจที่ 1',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_1,  // สมมติใช้สมอง 1
      fbAccessToken: process.env.FB_PAGE_TOKEN_1,    // ต้องระบุกุญแจของตัวเอง
      personaPrefix: "[System: สวมบทบาทแอดมินเพจ 1]\n\nคำถาม: "
    },

    [process.env.FB_PAGE_ID_2]: {
      campus: 'Project_1',
      channel: 'facebook',
      pageName: 'FB เพจที่ 2',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_1,  // สมมติใช้สมอง 1
      fbAccessToken: process.env.FB_PAGE_TOKEN_2,
      personaPrefix: "[System: สวมบทบาทแอดมินเพจ 2]\n\nคำถาม: "
    },

    [process.env.FB_PAGE_ID_3]: {
      campus: 'Project_2',
      channel: 'facebook',
      pageName: 'FB เพจที่ 3',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_2,  // สมมติใช้สมอง 2
      fbAccessToken: process.env.FB_PAGE_TOKEN_3,
      personaPrefix: "[System: สวมบทบาทแอดมินเพจ 3]\n\nคำถาม: "
    },

    [process.env.FB_PAGE_ID_4]: {
      campus: 'Project_2',
      channel: 'facebook',
      pageName: 'FB เพจที่ 4',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_2,  // สมมติใช้สมอง 2
      fbAccessToken: process.env.FB_PAGE_TOKEN_4,
      personaPrefix: "[System: สวมบทบาทแอดมินเพจ 4]\n\nคำถาม: "
    },

    [process.env.FB_PAGE_ID_5]: {
      campus: 'Project_3',
      channel: 'facebook',
      pageName: 'FB เพจที่ 5',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_3,  // สมมติใช้สมอง 3
      fbAccessToken: process.env.FB_PAGE_TOKEN_5,
      personaPrefix: "[System: สวมบทบาทแอดมินเพจ 5]\n\nคำถาม: "
    },

    [process.env.FB_PAGE_ID_6]: {
      campus: 'Project_3',
      channel: 'facebook',
      pageName: 'FB เพจที่ 6',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_3,  // สมมติใช้สมอง 3
      fbAccessToken: process.env.FB_PAGE_TOKEN_6,
      personaPrefix: "[System: สวมบทบาทแอดมินเพจ 6]\n\nคำถาม: "
    },

    [process.env.FB_PAGE_ID_7]: {
      campus: 'Project_3',
      channel: 'facebook',
      pageName: 'FB เพจที่ 7',
      difyApiKey: process.env.DIFY_API_KEY_BRAIN_3,  // สมมติใช้สมอง 3
      fbAccessToken: process.env.FB_PAGE_TOKEN_7,
      personaPrefix: "[System: สวมบทบาทแอดมินเพจ 7]\n\nคำถาม: "
    }
  }
};

/**
 * ฟังก์ชันดึง Config ไปใช้งานอัตโนมัติ
 */
function getTenantConfig(identifier) {
  const tenant = CONFIG.tenants[identifier];
  if (!tenant) {
    console.warn(`[Config Warning] ไม่พบการตั้งค่าสำหรับ ID/Path นี้: ${identifier}`);
    return null;
  }
  return tenant;
}

module.exports = {
  getTenantConfig,
  CONFIG
};
