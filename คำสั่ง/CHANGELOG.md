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

### Phitsanulok University (PLU)
- **Model Optimization:** เปลี่ยน LLM จาก `gpt-4.1` เป็น `gpt-4o-mini` (ประหยัดค่าใช้จ่ายและเร็วกว่า)
- **Fix Missing Fallback Edge:** เชื่อมต่อเส้นทาง `Else` ของกล่อง IF/ELSE กลับไปยังกล่อง Answer (แก้ปัญหาแชทบอทค้างไม่ตอบกลับเมื่อ Tag ผิดพลาด)
- **Anti-Loop Prompt:** เพิ่มกฎเหล็ก "ป้องกันการส่งข้อมูลซ้ำ" ใน Prompt ของ LLM หากเคยส่งโบชัวร์สาขาไปแล้วและลูกค้าถามต่อยอด ให้ใช้ `[ติดต่อแอดมิน]` แทนการคาย Tag สาขาเดิม เพื่อไม่ให้ลูกค้าได้รับข้อความอัตโนมัติซ้ำซาก

### Shinawatra University (ชินวัตร)
- **Memory Feature:** เปิดใช้งานระบบความจำให้ LLM ผู้เชี่ยวชาญทั้ง 6 สาขา (เพื่อให้ตอบคำถามต่อเนื่องได้)
- **Temperature Fix:** ลดค่าความร้อน (Temperature) ของ Router ลงเหลือ 0.3 ป้องกันการคาย Tag ผิดพลาด
- **Regex Fix:** ปรับ Regex ใน Code Node ให้รองรับการเว้นวรรครอบๆ `:` 
- **Routing Edge:** เพิ่มเส้นทางรองรับ Tag `[ติดต่อแอดมิน]` เพื่อให้บทสนทนาถูกส่งไปหาแอดมินได้ถูกต้อง
- **Anti-Loop Prompt:** เพิ่มกฎการหลีกเลี่ยงการถามข้อมูลประวัติซ้ำซากใน Router

### Dilion Education (ศูนย์แนะแนวเรียนจีน)
- **Architecture Upgrade:** เปลี่ยนจาก Single-LLM เป็นโครงสร้าง "Router + ผู้เชี่ยวชาญ 4 เมือง"
- **Knowledge Base Fix:** เปลี่ยนรหัสอ้างอิง KB จากของชินวัตร ให้กลับมาใช้ KB ของศูนย์เรียนจีนที่ถูกต้อง
- **Model & Cost:** ลดต้นทุนโดยสลับไปใช้ `gpt-4o-mini` สำหรับผู้เชี่ยวชาญทั้งหมด
- **Prompt Fix:** แก้ไขตัวตนใน Fallback Prompt ที่บอกว่าเป็น "ชินวัตร" ให้กลับมาเป็น "Dilion Education"

### 🛠️ Server Troubleshooting (แก้ปัญหาหน้างาน)
- **Port Conflict Fix:** ตรวจพบและทำการปิด (Kill) โปรเซส Node.js เก่าที่รันค้างอยู่ในพอร์ต 3005 ซึ่งทำให้คำสั่ง `npm run dev` แครชด้วย Error `EADDRINUSE` จนตอนนี้รันพอร์ต 3005 ได้ปกติแล้ว
- **Docker Compose:** ยืนยันการรันเซิร์ฟเวอร์ฐานข้อมูล Redis และ MySQL ผ่าน `docker-compose up -d` อย่างสมบูรณ์
