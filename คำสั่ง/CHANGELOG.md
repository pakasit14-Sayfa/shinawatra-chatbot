# Changelog (ประวัติการแก้ไข)

## [2026-06-22] - เพิ่มระบบความปลอดภัยและการจำลูกค้า

### Added (เพิ่ม)
- **Redis Integration:** ระบบการเชื่อมต่อกับ Redis เพื่อเซฟและดึง `conversation_id` ของลูกค้า ป้องกันไม่ให้ AI เริ่มคุยใหม่ทุกครั้งที่ Server รีสตาร์ทหรือมีการ Deploy โค้ดใหม่
- **LINE Signature Verification:** ตรวจสอบความถูกต้องของ Webhook ที่ส่งเข้ามาทางเส้นทาง `/webhook/line/:campus` ด้วยการคำนวณ Hash ของ Request Body เทียบกับ `x-line-signature` ช่วยบล็อก Request ปลอมที่ไม่ได้มาจากเซิร์ฟเวอร์ของ LINE จริงๆ
- ตัวแปรใน `.env.example` และ `.env`: เพิ่ม `LINE_SECRET_1`, `LINE_SECRET_2`, `LINE_SECRET_3` สำหรับตั้งค่า Channel Secret เพื่อตรวจสอบลายเซ็น

### Changed (แก้ไข)
- **`config.js`:** เพิ่มฟิลด์ `lineChannelSecret` ไปใน Config ของ LINE แต่ละเพจ (line_1, line_2, line_3) เพื่อรองรับฟีเจอร์ Multi-Tenant สำหรับการตรวจสอบลายเซ็น
- **`server.js`:** 
  - ย้ายการส่งสถานะ `res.sendStatus(200)` ไปไว้ *หลัง* ขั้นตอนการตรวจสอบลายเซ็น เพื่อให้สามารถบล็อก Request ได้จริงด้วยสถานะ `403 Forbidden`
  - ปรับการทำงานของฟังก์ชัน `sendToDify` ให้สามารถอ่านและเขียนค่าลง Redis ผ่าน `await` แบบ Asynchronous

### Fixed (แก้บั๊ก)
- **`server.js`:** แก้บั๊กการประกาศตัวแปรในส่วนรับข้อความ LINE ที่ใช้คำสั่ง `const text = ...` แล้วมีการแก้ค่า (Reassign) ทีหลังด้วยฟังก์ชัน `sanitizeInput()` ซึ่งก่อให้เกิด `TypeError: Assignment to constant variable` ได้เปลี่ยนเป็น `let text = ...` ทำให้โค้ดรันได้ปกติ

### Known Issues / ขั้นตอนถัดไป
- ต้องใส่ค่าจริงของ `LINE_SECRET_1/2/3` ใน `.env` บนเครื่อง Production (ปัจจุบันเป็นค่า Placeholder)
- ต้องทดสอบ 403 response (กรณีไม่มี x-line-signature) และการคงบริบท Conversation หลัง Restart Server บนเครื่อง Production
- (หมายเหตุ: ไฟล์ `.env.example` ได้ทำการลบตัวแปรซากเก่าออกและอัปเดตเรียบร้อยแล้วใน Commit ล่าสุด)
