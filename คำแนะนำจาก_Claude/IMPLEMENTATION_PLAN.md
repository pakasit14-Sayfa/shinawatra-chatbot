# Implementation Plan: ระบบรักษาความปลอดภัย LINE และ Redis (Conversation Memory)

**โปรเจกต์:** shinawatra-chatbot / backend-middleware
**วันที่จัดทำแผน:** 2026-06-22
**สถานะ:** รอการอนุมัติ (ยังไม่มีการแก้ไขโค้ดจริง)

---

## 1. เป้าหมาย

1. ป้องกัน Webhook ของ LINE จากการถูกปลอมแปลงคำขอ (request forgery) โดยตรวจสอบลายเซ็น `x-line-signature`
2. แก้ปัญหา AI "ลืมบริบทการสนทนา" (conversation_id หาย) เมื่อเซิร์ฟเวอร์ restart โดยย้ายจาก in-memory object ไปเก็บใน Redis

---

## 2. ผลการตรวจสอบโค้ดปัจจุบัน

| จุดที่ตรวจพบ | ไฟล์ | รายละเอียด |
|---|---|---|
| ⚠️ ไม่มีการตรวจลายเซ็น LINE | `server.js` บรรทัด ~229 (`POST /webhook/line/:campus`) | ตอบ `200 OK` ทันทีและประมวลผล event โดยไม่เช็คว่าใครเป็นผู้ส่งคำขอเข้ามา ต่างจาก `/webhook/meta` ที่มีการเช็ค `x-hub-signature-256` อยู่แล้ว (ใช้เป็นต้นแบบได้) |
| ⚠️ Conversation ID อยู่ใน Memory | `server.js` บรรทัด ~168 (`const conversations = {}`) | ตัวแปรนี้อยู่ใน RAM ของ process เดียว เมื่อ `node server.js` restart (เช่น crash, deploy ใหม่, PM2 reload) ค่าทั้งหมดหายทันที ทำให้ Dify เริ่มบทสนทนาใหม่กับลูกค้าเก่า |
| 🐞 บั๊กแฝง: reassign ตัวแปร `const` | `server.js` บรรทัด 254 vs 276 | `const text = ...` ถูกเขียนทับด้วย `text = sanitizeInput(text)` ในบรรทัดถัดมา ซึ่งจะทำให้เกิด `TypeError: Assignment to constant variable` ทุกครั้งที่มีข้อความตัวอักษรเข้ามาทาง LINE — **เป็นบั๊กที่ทำให้บอท LINE ใช้งานไม่ได้เลยในสถานการณ์จริง** ควรแก้พร้อมกันเพราะอยู่ในบล็อกเดียวกับที่จะแก้เรื่อง signature |
| ℹ️ Dependency พร้อมแล้ว | `package.json` | มี `"redis": "^6.0.0"` อยู่แล้ว ไม่ต้องติดตั้งเพิ่ม |
| ℹ️ ชื่อ env var ไม่ตรงกัน | `_env.example` vs `config.js` | `_env.example` ใช้ `LINE_ACCESS_TOKEN_SHINA/PLU/CHINA` แต่โค้ดจริงใน `config.js` อ้างอิง `LINE_TOKEN_1/2/3` — ไฟล์ตัวอย่างไม่ตรงกับของจริงที่ใช้รัน ควรจะสะสางให้ตรงกันในอนาคต (อยู่นอกขอบเขตงานนี้) |

---

## 3. แผนการแก้ไขแบบละเอียด

### 3.1 `config.js`

เพิ่ม field `lineChannelSecret` ให้ tenant ที่เป็น LINE ทั้ง 3 ตัว เพื่อใช้ตรวจลายเซ็นแยกตามแต่ละ LINE OA (multi-tenant แต่ละตัวมี Channel Secret ของตัวเอง):

```js
'line_1': {
  ...
  lineAccessToken: process.env.LINE_TOKEN_1,
  lineChannelSecret: process.env.LINE_SECRET_1,   // ใหม่
  ...
},
'line_2': {
  ...
  lineAccessToken: process.env.LINE_TOKEN_2,
  lineChannelSecret: process.env.LINE_SECRET_2,   // ใหม่
  ...
},
'line_3': {
  ...
  lineAccessToken: process.env.LINE_TOKEN_3,
  lineChannelSecret: process.env.LINE_SECRET_3,   // ใหม่
  ...
}
```

> ตั้งชื่อ `LINE_SECRET_1/2/3` ให้สอดคล้องกับรูปแบบ `LINE_TOKEN_1/2/3` ที่โค้ดใช้งานจริงอยู่แล้ว (ไม่ใช้รูปแบบ `_SHINA/_PLU/_CHINA` ใน `_env.example` เพราะไม่ตรงกับของจริง)

---

### 3.2 `server.js` — Redis Integration (Conversation Memory)

**แนวคิด:** อ่าน/เขียน `conversation_id` ผ่าน Redis เป็นหลัก แต่เขียนลง memory object เดิมคู่ขนานเสมอ เพื่อเป็น fallback อัตโนมัติถ้า Redis ล่มกลางคัน โดยไม่ต้องสลับโหมดเอง

**3.2.1 สร้าง Redis Client (ใกล้ๆ จุด import เดิม)**

```js
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
```

**3.2.2 Helper อ่าน/เขียน (แทนการเข้าถึง `conversations[userKey]` ตรงๆ)**

```js
const CONVERSATION_TTL_SECONDS = 60 * 60 * 24 * 30; // เก็บ 30 วัน กันข้อมูลค้างใน Redis ไม่จำกัด

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
  conversations[userKey] = conversationId; // เขียน memory ไว้เสมอ = fallback อัตโนมัติ
  if (redisReady) {
    try {
      await redisClient.set(`conv:${userKey}`, conversationId, { EX: CONVERSATION_TTL_SECONDS });
    } catch (err) {
      console.error('[Redis Set Error]', err.message);
    }
  }
}
```

**3.2.3 แก้ `sendToDify` ให้เป็น async I/O**

```js
async function sendToDify(userId, platform, userMessage, tenantConfig) {
  const userKey = `${platform}:${userId}`;
  const conversationId = await getConversationId(userKey);   // เปลี่ยนจากอ่าน object ตรงๆ
  ...
  if (data.conversation_id) {
    await setConversationId(userKey, data.conversation_id);  // เปลี่ยนจากเขียน object ตรงๆ
  }
  ...
}
```

> หมายเหตุ: TTL 30 วันเป็นค่าตั้งต้นที่แนะนำ — ปรับได้ตามพฤติกรรมลูกค้าจริง (เช่นถ้าลูกค้าทักกลับมาหลัง 30 วัน ระบบจะเริ่ม conversation ใหม่ ซึ่งเป็นพฤติกรรมที่ยอมรับได้)

---

### 3.3 `server.js` — LINE Signature Verification

**ตำแหน่ง:** `POST /webhook/line/:campus` ต้องตรวจสอบ **ก่อน** ตอบ `200 OK` กลับไป (ปัจจุบันโค้ดตอบ 200 ทันทีบรรทัดแรกของ handler เพื่อกัน LINE retry — ต้องสลับลำดับ ย้ายการตรวจสอบไปอยู่ก่อนบรรทัดนี้)

```js
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
      .digest('base64');           // LINE ใช้ base64 (ต่างจาก Meta ที่ใช้ hex)
    if (signature !== expectedSignature) {
      console.warn(`[LINE] ⛔ Signature ไม่ตรง บล็อกคำขอ (${campusPath})`);
      return res.status(403).send('Invalid signature');
    }
  } else {
    console.warn(`[LINE] ⚠️ ไม่ได้ตั้งค่า LINE_SECRET สำหรับ ${campusPath} — ข้ามการตรวจสอบ (ไม่แนะนำสำหรับ Production)`);
  }

  res.sendStatus(200); // ตอบทันที กัน LINE retry (เหมือนเดิม แต่ย้ายมาอยู่หลังเช็ค signature)

  const events = req.body.events || [];
  ...
```

**3.3.1 แก้บั๊ก `const text` ในบล็อกเดียวกัน**

```js
// เดิม
const text = isText ? event.message.text : '[Sent an image]';
...
text = sanitizeInput(text);   // ❌ TypeError

// แก้เป็น
let text = isText ? event.message.text : '[Sent an image]';
...
text = sanitizeInput(text);   // ✅ ใช้งานได้ปกติ
```

---

### 3.4 `_env.example`

เพิ่มตัวแปรใหม่ในหมวด Security:

```env
# --- LINE Channel Secret (สำหรับยืนยันลายเซ็น Webhook) ---
LINE_SECRET_1=line_channel_secret_1_here   # line_1 / PLU
LINE_SECRET_2=line_channel_secret_2_here   # line_2 / ชินวัตร
LINE_SECRET_3=line_channel_secret_3_here   # line_3 / จีน
```

---

## 4. ตัวแปร .env ที่ต้องเพิ่มในเซิร์ฟเวอร์จริง

| ตัวแปร | ค่าตัวอย่าง | หมายเหตุ |
|---|---|---|
| `LINE_SECRET_1` | (Channel Secret จาก LINE Developers Console ของ LINE OA ตัวที่ 1) | บังคับ ถ้าต้องการเปิดการตรวจสอบจริง |
| `LINE_SECRET_2` | (Channel Secret ของ LINE OA ตัวที่ 2) | เช่นเดียวกัน |
| `LINE_SECRET_3` | (Channel Secret ของ LINE OA ตัวที่ 3) | เช่นเดียวกัน |
| `REDIS_HOST` | `127.0.0.1` | มีอยู่แล้วใน `_env.example` |
| `REDIS_PORT` | `6379` | มีอยู่แล้วใน `_env.example` |
| `REDIS_PASSWORD` | (ถ้ามี) | มีอยู่แล้วใน `_env.example` |

> หา Channel Secret ได้จาก LINE Developers Console → เลือก Channel ของแต่ละ LINE OA → แท็บ "Basic settings" → "Channel secret"

---

## 5. แผนการตรวจสอบ (Verification Plan)

### Automated
- ไม่ต้องรัน `npm install redis` (มีอยู่แล้ว) — รัน `npm install` เฉยๆ เพื่อยืนยัน lockfile ตรงกัน
- รัน `node server.js` หรือ `npm run dev` แล้วดู log ว่าขึ้น `[Redis] เชื่อมต่อสำเร็จ ✅` หรือไม่ ถ้า Redis ยังไม่ได้รันใน Docker จะเห็น log fallback แทน (ไม่ crash)

### Manual
- ทดสอบยิง LINE webhook โดยไม่มี header `x-line-signature` → ต้องได้ `403`
- ทดสอบยิงด้วย signature ปลอม → ต้องได้ `403`
- ทดสอบส่งข้อความจริงผ่าน LINE OA แต่ละตัว (3 ตัว) → บอทต้องตอบปกติ และไม่เกิด `TypeError`
- ทดสอบ restart เซิร์ฟเวอร์กลางบทสนทนา แล้วพิมพ์ข้อความถัดไป → Dify ต้องจำบริบทเดิมได้ (เช็คจาก `conversation_id` ใน Redis ด้วยคำสั่ง `redis-cli GET conv:line:<userId>`)
- ปิด Redis ระหว่างใช้งาน (จำลอง Redis ล่ม) → บอทต้องยังตอบได้ปกติโดยใช้ memory fallback (จะลืมบริบทถ้า restart ระหว่างนั้น ซึ่งเป็นพฤติกรรมที่ยอมรับได้สำหรับ fallback)

---

## 6. สิ่งที่ควรพิจารณาเพิ่มเติม (นอกขอบเขตแผนนี้ แต่ควรรู้ไว้)

1. **ชื่อ env var ไม่ตรงกันระหว่าง `_env.example` กับโค้ดจริง** (`LINE_ACCESS_TOKEN_SHINA` vs `LINE_TOKEN_1`) — ควรสะสางให้ตรงกันในรอบถัดไป เพื่อไม่ให้คนตั้งค่าใหม่สับสน
2. **`FB_APP_SECRET` signature check ของ Meta** ปัจจุบันเป็น optional (ถ้าไม่ตั้งค่าจะข้ามการตรวจ) — ใช้ pattern เดียวกับที่แผนนี้เสนอสำหรับ LINE ดังนั้นเมื่อ deploy จริงควรบังคับตั้งทั้งสองค่าเสมอ ไม่ปล่อยให้ optional
3. Redis client ใหม่ที่สร้างใน `server.js` เป็นคนละ instance กับที่อาจมีอยู่แล้วใน `Handoff.js` (ใช้เก็บสถานะ lock/unlock แชท) — ไฟล์นั้นไม่ได้อยู่ในชุดที่อัปโหลดมา ควรตรวจสอบว่ามี Redis client ซ้ำซ้อนหรือไม่ และพิจารณารวมเป็น client เดียวเพื่อประหยัด connection

---

## 7. สรุปไฟล์ที่จะถูกแก้ (เมื่ออนุมัติให้ลงมือ)

| ไฟล์ | ประเภทการแก้ไข |
|---|---|
| `config.js` | MODIFY — เพิ่ม `lineChannelSecret` ต่อ tenant |
| `server.js` | MODIFY — Redis client, async conversation get/set, LINE signature check, แก้บั๊ก `const text` |
| `_env.example` | MODIFY — เพิ่ม `LINE_SECRET_1/2/3` |
| `CHANGELOG.md` | NEW — บันทึกการแก้ไขเมื่อดำเนินการเสร็จ |

---

**หากอนุมัติแผนนี้** พิมพ์ "ตกลง" หรือ "ดำเนินการเลย" แล้วผมจะแก้ไขไฟล์จริงตามแผนข้างต้น พร้อมไฟล์ให้ดาวน์โหลดและ `CHANGELOG.md`
