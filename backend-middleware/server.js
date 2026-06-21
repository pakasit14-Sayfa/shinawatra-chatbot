const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const basicAuth = require('express-basic-auth');

dotenv.config();

const { deliverMessage, buildLineMessages, isBotsOwnEcho } = require('./message-delivery');
const { handleIncoming } = require('./message-queue');
const { alertAdmin } = require('./alert');
const { lockChat, unlockChat, isLocked, isUnlockCommand, isLockCommand } = require('./Handoff');
const { trackUser, getActiveUsers } = require('./ActiveUsers');
const { getTenantConfig } = require('./config');
const { validateContact } = require('./validate-contact');
const db = require('./database');
const { processLineImage, processMetaAttachment } = require('./media-handler');

const app = express();
app.set('trust proxy', 1); // รองรับ Ngrok / Reverse Proxy
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

const sanitizeInput = (text) => {
    if (!text) return '';
    return text.trim().slice(0, 5000).replace(/[<>\'\"]/g, '');
};

const path = require('path');
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ---------- Health Check ----------
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ---------- Admin Dashboard ----------
const adminUser = process.env.ADMIN_USER || 'admin';
const adminPass = process.env.ADMIN_PASS || 'plu1234';

const authMiddleware = basicAuth({
    users: { [adminUser]: adminPass },
    challenge: true,
    realm: 'PLU Admin Control'
});

app.use('/admin', express.static('public/admin'));

app.get('/api/admin/users', authMiddleware, async (req, res) => {
    const activeUsers = getActiveUsers();
    const users = await Promise.all(activeUsers.map(async u => ({
        ...u,
        isLocked: await isLocked(u.platform, u.userId)
    })));
    res.json(users);
});

app.post('/api/admin/toggle', authMiddleware, async (req, res) => {
    const { platform, userId, locked } = req.body;
    if (locked) {
        await lockChat(platform, userId);
    } else {
        await unlockChat(platform, userId);
    }
    res.sendStatus(200);
});

// Admin sends message to user
app.post('/api/admin/send-message', authMiddleware, async (req, res) => {
    try {
        const { platform, platformUserId, message } = req.body;
        
        // Find user to get tenant_id
        const user = await db.prisma.user.findUnique({
            where: { platform_user_id: platformUserId }
        });
        
        if (!user || !user.tenant_id) {
            return res.status(404).json({ error: 'User or tenant config not found' });
        }
        
        const tenantConfig = getTenantConfig(user.tenant_id);
        if (!tenantConfig) {
            return res.status(400).json({ error: 'Tenant config not found in config.js' });
        }
        
        // Lock chat automatically when admin sends a message
        await lockChat(platform, platformUserId);
        
        // Log the message in the database as 'admin'
        const session = await db.getOrCreateSession(user.id);
        await db.logChatMessage(session.id, 'admin', message);
        
        // Send the message to the user via LINE Push API or Meta Send API
        if (platform === 'line') {
            await axios.post(
                'https://api.line.me/v2/bot/message/push',
                {
                    to: platformUserId,
                    messages: buildLineMessages(message)
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tenantConfig.lineAccessToken}`
                    }
                }
            );
        } else if (platform === 'facebook') {
            await deliverMessage('facebook', platformUserId, message, null, tenantConfig.fbAccessToken);
        }
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('[Admin Send Error]', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

const PORT = process.env.PORT || 3000;
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1/chat-messages';

/**
 * ---------------------------------------------------------
 * แมป ref ของโฆษณา -> ข้อความเสมือนที่ส่งเข้า Dify
 * พาลูกค้าเข้าตรงหลักสูตรที่โฆษณาโปรโมท โดยไม่ต้องให้ลูกค้าพิมพ์เอง
 *
 * วิธีใช้: ตอนสร้างโฆษณา CTM ใน Ads Manager ให้ตั้งค่า ref ตรงกับ key ด้านล่าง
 * เช่น โฆษณาโปร ป.เอก -> ตั้ง ref = "promo_phd"
 *
 * การจับคู่เป็นแบบ "มีคำนี้อยู่ใน ref" (ไม่ต้องตรงเป๊ะ) เช่น ref="promo_phd_2026" ก็เข้า phd
 * ถ้า ref ไม่ตรงอันไหนเลย -> ใช้ข้อความ default (ทักทาย ป.ตรี)
 * ---------------------------------------------------------
 */
const REFERRAL_MESSAGE_MAP = [
    { match: ['phd', 'doctor', 'เอก'],        text: 'สนใจสอบถามหลักสูตรปริญญาเอก' },
    { match: ['master', 'mba', 'med', 'โท'],  text: 'สนใจสอบถามหลักสูตรปริญญาโท' },
    { match: ['grad', 'pbandit', 'บัณฑิต'],   text: 'สนใจสอบถามหลักสูตรประกาศนียบัตรบัณฑิต วิชาชีพครู' },
    { match: ['law', 'niti', 'นิติ'],         text: 'สนใจสอบถามหลักสูตรปริญญาตรี สาขานิติศาสตร์' },
    { match: ['account', 'banchee', 'บัญชี'], text: 'สนใจสอบถามหลักสูตรปริญญาตรี สาขาบัญชี' },
    { match: ['pa', 'ratta', 'รัฐ'],          text: 'สนใจสอบถามหลักสูตรปริญญาตรี สาขารัฐประศาสนศาสตร์' },
];
const DEFAULT_REFERRAL_TEXT = 'สนใจสอบถามข้อมูลหลักสูตร';

function refToVirtualMessage(ref) {
    if (!ref) return DEFAULT_REFERRAL_TEXT;
    const lower = String(ref).toLowerCase();
    for (const rule of REFERRAL_MESSAGE_MAP) {
        if (rule.match.some(k => lower.includes(k.toLowerCase()))) return rule.text;
    }
    return DEFAULT_REFERRAL_TEXT;
}

/**
 * เก็บ Conversation ID ไว้ใน Memory ชั่วคราว และ Redis (ป้องกันการหายตอน restart)
 */
const conversations = {};

const redis = require('redis');

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379
  },
  password: process.env.REDIS_PASSWORD || undefined
});

let redisReady = false;
redisClient.on('error', (err) => {
  redisReady = false;
  console.error('[Redis Error]', err.message);
});
redisClient.on('ready', () => {
  redisReady = true;
  console.log('[Redis] เชื่อมต่อสำเร็จ ✅');
});
redisClient.connect().catch(err => {
  console.error('[Redis] เชื่อมต่อไม่สำเร็จ จะใช้ Memory ชั่วคราวแทน:', err.message);
});

const CONVERSATION_TTL_SECONDS = 60 * 60 * 24 * 30; // เก็บ 30 วัน

async function getConversationId(userKey) {
  if (redisReady) {
    try {
      const value = await redisClient.get(`conv:${userKey}`);
      if (value) return value;
    } catch (err) {
      console.error('[Redis Get Error]', err.message);
    }
  }
  return conversations[userKey] || '';
}

async function setConversationId(userKey, conversationId) {
  conversations[userKey] = conversationId;
  if (redisReady) {
    try {
      await redisClient.set(`conv:${userKey}`, conversationId, { EX: CONVERSATION_TTL_SECONDS });
    } catch (err) {
      console.error('[Redis Set Error]', err.message);
    }
  }
}

/**
 * ---------------------------------------------------------
 * DIFY API: ส่งข้อความไปถาม Dify และรับคำตอบ
 * ---------------------------------------------------------
 */
async function sendToDify(userId, platform, userMessage, tenantConfig) {
    const userKey = `${platform}:${userId}`;
    const conversationId = await getConversationId(userKey);

    const promptText = tenantConfig && tenantConfig.personaPrefix ? `${tenantConfig.personaPrefix}${userMessage}` : userMessage;
    const apiKey = tenantConfig ? tenantConfig.difyApiKey : process.env.DIFY_API_KEY;

    try {
        const response = await axios.post(
            DIFY_API_URL,
            {
                inputs: {},
                query: promptText,
                response_mode: 'blocking',
                conversation_id: conversationId,
                user: userId
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = response.data;

        if (data.conversation_id) {
            await setConversationId(userKey, data.conversation_id);
        }

        if (!data.answer || data.answer.trim() === '') {
            console.error('[Dify Error] Received empty answer from Dify');
            return 'ขออภัยค่ะ ระบบประมวลผลคำตอบขัดข้องชั่วคราว กรุณารอสักครู่นะคะ หรือพิมพ์ "ติดต่อแอดมิน" ได้เลยค่ะ';
        }
        return data.answer;
    } catch (error) {
        console.error(`[Dify Error]`, error.response?.data || error.message);
        alertAdmin(`🔴 Dify ตอบไม่ได้ ลูกค้าอาจไม่ได้รับคำตอบ\nสาเหตุ: ${error.response?.data?.message || error.message}`, 'dify-error');
        throw error;
    }
}

/**
 * =========================================================
 * ENDPOINTS (WEBHOOK ROUTES)
 * =========================================================
 */

// ---------------------------------------------------------
// 1. LINE Webhook
//    ผ่านระบบคิว (กันซ้ำ + รวบข้อความรัว + ตอบตามลำดับ)
//    ส่งกลับด้วย reply token (ฟรี ไม่กินโควต้า push)
// ---------------------------------------------------------
app.post('/webhook/line/:campus', limiter, async (req, res) => {
    const campusPath = `line_${req.params.campus}`;
    const tenantConfig = getTenantConfig(campusPath);

    if (!tenantConfig) {
        console.warn(`[LINE] Config not found for ${campusPath}`);
        return res.sendStatus(404);
    }

    // ----- ตรวจลายเซ็น LINE ก่อนทำอะไรทั้งสิ้น -----
    const signature = req.headers['x-line-signature'];
    if (tenantConfig.lineChannelSecret) {
        if (!signature) {
            return res.status(403).send('No signature provided');
        }
        const expectedSignature = crypto
            .createHmac('SHA256', tenantConfig.lineChannelSecret)
            .update(req.rawBody)
            .digest('base64');
        if (signature !== expectedSignature) {
            console.warn(`[LINE] ⛔ Signature ไม่ตรง บล็อกคำขอ (${campusPath})`);
            return res.status(403).send('Invalid signature');
        }
    } else {
        console.warn(`[LINE] ⚠️ ไม่ได้ตั้งค่า LINE_SECRET สำหรับ ${campusPath} — ข้ามการตรวจสอบ`);
    }

    res.sendStatus(200); // ตอบทันที กัน LINE retry

    const events = req.body.events || [];

    for (const event of events) {
        // ===== LINE: จับว่าแอดมินส่งข้อความผ่าน LINE OA (event ชนิด unsend/หรือ source.type) =====
        // เมื่อแอดมินตอบผ่าน LINE Official Account Manager บาง config จะส่ง event
        // ที่ source ไม่ใช่ 'user' หรือมี webhook เฉพาะ — แต่กรณีมาตรฐานคือใช้ flag จากคำสั่ง

        if (event.type === 'message') {
            const lineUserId = event.source.userId;
            const isText = event.message.type === 'text';
            const isImage = event.message.type === 'image';

            if (!isText && !isImage) continue;

            let text = isText ? event.message.text : '[Sent an image]';

            trackUser('line', lineUserId, text);

            // คำสั่งปลดล็อก (แอดมินพิมพ์ "เปิดบอท" ในห้องลูกค้า)
            if (isText && isUnlockCommand(text)) {
                await unlockChat('line', lineUserId);
                continue;
            }

            // คำสั่งล็อก (แอดมินพิมพ์ "รับเอง" ในห้องลูกค้า → บอทหยุดตอบ)
            if (isText && isLockCommand(text)) {
                await lockChat('line', lineUserId);
                continue;
            }

            // ถ้าแชทถูกล็อก บอทเงียบ
            const locked = await isLocked('line', lineUserId);
            if (locked) {
                continue;
            }

            text = sanitizeInput(text);

            handleIncoming({
                userId: lineUserId,
                messageId: event.message.id,        // LINE มี message id ใช้กันซ้ำได้
                text: text,
                meta: { replyToken: event.replyToken }, // เก็บ token ล่าสุดไว้ตอบ
                processFn: async (userId, combinedText, meta) => {
                    try {
                        // 1. Fetch LINE Profile
                        let displayName = null;
                        let profilePicUrl = null;
                        try {
                            const profileRes = await axios.get(`https://api.line.me/v2/bot/profile/${userId}`, {
                                headers: { 'Authorization': `Bearer ${tenantConfig.lineAccessToken}` }
                            });
                            displayName = profileRes.data.displayName;
                            profilePicUrl = profileRes.data.pictureUrl;
                        } catch (err) {
                            console.error('[LINE Profile Fetch Error]', err.message);
                        }

                        const user = await db.getOrCreateUser('line', userId, displayName, campusPath, profilePicUrl);
                        const session = await db.getOrCreateSession(user.id);
                        const chatLog = await db.logChatMessage(session.id, 'user', combinedText);

                        if (isImage) {
                            await processLineImage(event.message.id, tenantConfig.lineAccessToken, chatLog.id);
                            if (!isText) return; // ถ้ามีแต่รูปไม่ต้องให้ Dify ตอบ
                        }

                        const rawDifyAnswer = await sendToDify(userId, 'line', combinedText, tenantConfig);
                        const validation = validateContact(rawDifyAnswer, combinedText);

                        if (validation.isLeak) {
                            alertAdmin(`🚨 สกัดเบอร์โทรหลุด!\nเบอร์: ${validation.foundPhones.join(', ')}\nลูกค้า: ${userId}`, 'contact-leak');
                        }

                        const difyAnswer = validation.safeMessage;
                        await db.logChatMessage(session.id, 'bot', difyAnswer);

                        let botName = 'LINE';
                        if (campusPath === 'line_1') botName = 'LINE พิษณุโลก';
                        else if (campusPath === 'line_2') botName = 'LINE ชินวัตร';
                        else if (campusPath === 'line_3') botName = 'LINE จีน';

                        console.log('\n=============================================');
                        console.log(`📱 แหล่งที่มา: ${botName}`);
                        console.log(`👤 ลูกค้า (${displayName || userId}): "${combinedText.replace(/\n/g, ' ')}"`);
                        console.log(`🤖 AI ตอบ: "${difyAnswer}"`);
                        console.log('=============================================\n');

                        // แปลงเป็น LINE messages: แยกตาม === + รูปเป็น bubble แยก ลำดับคงเดิม
                        const messages = buildLineMessages(difyAnswer);
                        if (messages.length === 0) return;

                        await axios.post(
                            'https://api.line.me/v2/bot/message/reply',
                            { replyToken: meta.replyToken, messages },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${tenantConfig.lineAccessToken}`
                                }
                            }
                        );
                        console.log(`[LINE] ✅ ส่ง ${messages.length} bubbles สำเร็จ`);
                    } catch (error) {
                        console.error(`[LINE Error]`, error.response?.data || error.message);
                        alertAdmin(`🔴 ส่งข้อความเข้า LINE ไม่ได้ (อาจ token หมดอายุ/หมดโควต้า)\nสาเหตุ: ${error.response?.data?.message || error.message}`, 'line-send-error');
                    }
                },
            });
        }
    }
});

// ---------------------------------------------------------
// 2. Meta Webhook Verification (ตอนตั้งค่าใน Meta App)
// ---------------------------------------------------------
app.get('/webhook/meta', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
        console.log('Facebook Webhook Verified Successfully!');
        return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
});

// ---------------------------------------------------------
// 3. Meta Webhook Receive Message
//    [แก้บั๊ก] ตอบ 200 ครั้งเดียว ไม่มี sendStatus ซ้ำ (ERR_HTTP_HEADERS_SENT)
//    [แก้บั๊ก] วนลูป entry.messaging ทุกตัว ไม่ใช่แค่ [0]
//    ผ่านระบบคิวเหมือนกัน
// ---------------------------------------------------------
app.post('/webhook/meta', limiter, async (req, res) => {
    // Webhook Signature Verification
    if (process.env.FB_APP_SECRET) {
        const signature = req.headers['x-hub-signature-256'];
        if (!signature) {
            return res.status(403).send('No signature provided');
        }
        const expectedSignature = 'sha256=' + crypto.createHmac('sha256', process.env.FB_APP_SECRET).update(req.rawBody).digest('hex');
        if (signature !== expectedSignature) {
            return res.status(403).send('Invalid signature');
        }
    }
    res.status(200).send('EVENT_RECEIVED'); // ตอบครั้งเดียว ตรงนี้ที่เดียว

    const body = req.body;
    if (body.object !== 'page') return; // จบเงียบๆ ห้ามส่ง response ซ้ำ

    for (const entry of body.entry || []) {
        for (const webhookEvent of entry.messaging || []) {   // <<< วนครบทุก event

            // ===== กรณีลูกค้ามาจากโฆษณา CTM / โพสต์ (referral หรือ postback) =====
            // อาจไม่มี message.text เลย (กดเข้ามาเฉยๆ) -> ต้องทักทายเอง ไม่งั้นบอทเงียบ
            const referral = webhookEvent.referral
                || (webhookEvent.postback && webhookEvent.postback.referral);
            const isPureReferral = referral && !(webhookEvent.message && webhookEvent.message.text);
            const pageId = webhookEvent.recipient ? webhookEvent.recipient.id : null;
            
            const tenantConfig = getTenantConfig(pageId);
            if (!tenantConfig) {
                console.warn(`[META] Config not found for page: ${pageId}`);
                continue;
            }

            if (isPureReferral) {
                const refUserId = webhookEvent.sender.id;
                const refId = `ref-${webhookEvent.timestamp || Date.now()}`; // referral ไม่มี mid ต้องสร้างเอง
                const refCode = referral.ref || referral.ad_id || '';
                const virtualText = refToVirtualMessage(refCode); // แปลง ref -> ข้อความตรงหลักสูตร
                console.log(`\n[META] 🎯 ลูกค้ามาจากโฆษณา/โพสต์ ref=${refCode || 'unknown'} -> "${virtualText}"`);

                const sanitizedVirtualText = sanitizeInput(virtualText);
                handleIncoming({
                    userId: refUserId,
                    messageId: refId,
                    text: sanitizedVirtualText,   // ข้อความเสมือนตามหลักสูตรที่โฆษณาโปรโมท
                    meta: {},
                    processFn: async (userId, combinedText) => {
                        console.log(`[META] 📩 (จากโฆษณา) เริ่มต้อนรับลูกค้าเข้าหลักสูตร`);
                        try {
                            // Fetch FB Profile
                            let displayName = null;
                            let profilePicUrl = null;
                            try {
                                const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${userId}?fields=first_name,last_name,profile_pic&access_token=${tenantConfig.fbAccessToken}`);
                                displayName = profileRes.data.first_name ? `${profileRes.data.first_name} ${profileRes.data.last_name || ''}`.trim() : null;
                                profilePicUrl = profileRes.data.profile_pic;
                            } catch (err) {
                                console.error('[META Profile Fetch Error]', err.message);
                            }

                            const user = await db.getOrCreateUser('facebook', userId, displayName, pageId, profilePicUrl);
                            const session = await db.getOrCreateSession(user.id);
                            await db.logChatMessage(session.id, 'user', combinedText);

                            const rawDifyAnswer = await sendToDify(userId, 'meta', combinedText, tenantConfig);
                            const validation = validateContact(rawDifyAnswer, combinedText);

                            if (validation.isLeak) {
                                alertAdmin(`🚨 สกัดเบอร์โทรหลุด (Meta)!\nเบอร์: ${validation.foundPhones.join(', ')}`, 'contact-leak');
                            }

                            const difyAnswer = validation.safeMessage;
                            await db.logChatMessage(session.id, 'bot', difyAnswer);

                            await deliverMessage('facebook', userId, difyAnswer, (reason) => {
                                alertAdmin(`🔴 ส่งข้อความเข้า Facebook ไม่ได้ (อาจ token หมดอายุ)\nสาเหตุ: ${reason}`, 'fb-send-error');
                            }, tenantConfig.fbAccessToken);
                            console.log(`[META] ✅ ต้อนรับลูกค้าจากโฆษณาสำเร็จ`);
                        } catch (error) {
                            console.error(`[META Error]`, error.message);
                        }
                    },
                });
                continue; // จบ event นี้ ไม่ต้องไปเข้าเงื่อนไข message ด้านล่าง
            }

            // ===== จัดการ echo: แยกว่าเป็นแอดมินพิมพ์มือ หรือบอทส่งเอง =====
            if (webhookEvent.message && webhookEvent.message.is_echo) {
                const echoUserId = webhookEvent.recipient.id; // echo: recipient คือลูกค้า
                const echoText = webhookEvent.message.text || '';

                // ถ้าตรงกับที่บอทเพิ่งส่ง = บอทเอง ไม่ต้องทำอะไร
                if (isBotsOwnEcho(echoUserId, echoText)) {
                    continue;
                }

                // แอดมินพิมพ์ "เปิดบอท" -> ปลดล็อก (ต้องเช็คก่อนล็อก เพราะคำสั่งนี้มาเป็น echo)
                if (isUnlockCommand(echoText)) {
                    await unlockChat('meta', echoUserId);
                    continue;
                }

                // แอดมินพิมพ์ข้อความอื่น = คุยกับลูกค้า -> ล็อกแชท บอทหยุดตอบ
                await lockChat('meta', echoUserId);
                continue;
            }

            if (webhookEvent.message && !webhookEvent.message.is_echo) {
                const hasText = !!webhookEvent.message.text;
                const hasAttachment = webhookEvent.message.attachments && webhookEvent.message.attachments.length > 0;

                if (!hasText && !hasAttachment) continue;

                const senderId = webhookEvent.sender.id;
                const text = hasText ? webhookEvent.message.text : '[Sent an attachment]';
                
                trackUser('meta', senderId, text);

                // ===== คำสั่งปลดล็อก: แอดมินพิมพ์ "เปิดบอท" =====
                if (hasText && isUnlockCommand(text)) {
                    await unlockChat('meta', senderId);
                    continue;
                }

                // ===== คำสั่งล็อก: แอดมินพิมพ์ "รับเอง" → บอทหยุดตอบ =====
                if (hasText && isLockCommand(text)) {
                    await lockChat('meta', senderId);
                    continue;
                }

                // ===== ถ้าแชทถูกล็อก (แอดมินดูแลอยู่) บอทเงียบ =====
                const locked = await isLocked('meta', senderId);
                if (locked) {
                    continue;
                }

                // ถ้ามีทั้งข้อความ + referral (โฆษณาที่มี ice breaker) ให้แนบที่มาไปด้วยใน log
                if (referral) {
                    console.log(`[META] 🎯 ข้อความนี้มาจากโฆษณา ref=${referral.ref || referral.ad_id || 'unknown'}`);
                }
                const sanitizedText = sanitizeInput(webhookEvent.message.text);
                handleIncoming({
                    userId: senderId,
                    messageId: webhookEvent.message.mid,
                    text: sanitizedText,
                    meta: {},
                    processFn: async (userId, combinedText) => {
                        try {
                            // Fetch FB Profile
                            let displayName = null;
                            let profilePicUrl = null;
                            try {
                                const profileRes = await axios.get(`https://graph.facebook.com/v19.0/${userId}?fields=first_name,last_name,profile_pic&access_token=${tenantConfig.fbAccessToken}`);
                                displayName = profileRes.data.first_name ? `${profileRes.data.first_name} ${profileRes.data.last_name || ''}`.trim() : null;
                                profilePicUrl = profileRes.data.profile_pic;
                            } catch (err) {
                                console.error('[META Profile Fetch Error]', err.message);
                            }

                            const user = await db.getOrCreateUser('facebook', userId, displayName, pageId, profilePicUrl);
                            const session = await db.getOrCreateSession(user.id);
                            const chatLog = await db.logChatMessage(session.id, 'user', combinedText);

                            if (hasAttachment) {
                                const attachment = webhookEvent.message.attachments[0];
                                if (attachment.type === 'image' || attachment.type === 'file') {
                                    await processMetaAttachment(attachment.payload.url, chatLog.id);
                                }
                                if (!hasText) return; // ถ้าส่งมาแต่ไฟล์ ไม่ต้องส่งเข้า Dify
                            }

                            const rawDifyAnswer = await sendToDify(userId, 'meta', combinedText, tenantConfig);
                            const validation = validateContact(rawDifyAnswer, combinedText);

                            if (validation.isLeak) {
                                alertAdmin(`🚨 สกัดเบอร์โทรหลุด (Meta)!\nเบอร์: ${validation.foundPhones.join(', ')}`, 'contact-leak');
                            }

                            const difyAnswer = validation.safeMessage;
                            await db.logChatMessage(session.id, 'bot', difyAnswer);

                            let botName = `Facebook (Page: ${pageId})`;
                            const cfg = getTenantConfig(pageId);
                            if (cfg && cfg.pageName) botName = cfg.pageName;

                            console.log('\n=============================================');
                            console.log(`📘 แหล่งที่มา: ${botName}`);
                            console.log(`👤 ลูกค้า (${displayName || userId}): "${combinedText.replace(/\n/g, ' ')}"`);
                            console.log(`🤖 AI ตอบ: "${difyAnswer}"`);
                            console.log('=============================================\n');

                            await deliverMessage('facebook', userId, difyAnswer, (reason) => {
                                alertAdmin(`🔴 ส่งข้อความเข้า Facebook ไม่ได้ (อาจ token หมดอายุ)\nสาเหตุ: ${reason}`, 'fb-send-error');
                            }, tenantConfig.fbAccessToken);
                            console.log(`[META] ✅ ส่งสำเร็จ`);
                        } catch (error) {
                            console.error(`[META Error]`, error.message);
                        }
                    },
                });
            }
        }
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Webhook Server is running on port ${PORT}`);
    alertAdmin(`🟢 เซิร์ฟเวอร์เริ่มทำงาน (port ${PORT})\nหากไม่ได้ตั้งใจ restart อาจมีการ crash เกิดขึ้น`);
});