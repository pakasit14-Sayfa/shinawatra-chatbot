# 🚀 วิธีเปิดระบบบอท PLU หลังเปิดคอมใหม่

---

## ✅ ทำตามลำดับนี้ทุกครั้ง (2 ขั้นตอน)

### ขั้นที่ 1 — เปิดบอท (PowerShell หน้าต่างที่ 1)

```powershell
cd c:\Dilion\dify-webhook-middleware
pm2 start ecosystem.config.js
```

> ถ้าขึ้นว่า `[plu-chatbot] already launched` ไม่ต้องทำอะไร บอทรันอยู่แล้วครับ

---

### ขั้นที่ 2 — เปิด ngrok (PowerShell หน้าต่างที่ 2)

```powershell
ngrok http --url=festivity-willfully-anchor.ngrok-free.dev 3000
```

> หน้าต่างนี้ต้องเปิดค้างไว้ตลอดเวลาที่บอทใช้งานครับ ห้ามปิด!

---

## 🔍 เช็คว่าระบบพร้อมหรือยัง

```powershell
pm2 status
```

ต้องเห็น `plu-chatbot` สถานะ **online** ✅

```powershell
pm2 logs plu-chatbot --lines 5 --nostream
```

ต้องเห็น `🚀 Webhook Server is running on port 3000` ✅

---

## 📟 คำสั่งที่ใช้บ่อย

| คำสั่ง | ใช้เมื่อ |
|--------|---------|
| `pm2 status` | ดูว่าบอทรันอยู่ไหม |
| `pm2 logs plu-chatbot` | ดู Log สดๆ (กด Ctrl+C เพื่อออก) |
| `pm2 restart plu-chatbot --update-env` | รีสตาร์ทหลังแก้ไฟล์ .env หรือโค้ด |
| `pm2 stop plu-chatbot` | หยุดบอทชั่วคราว |
| `pm2 start ecosystem.config.js` | เปิดบอทใหม่ |

---

## 🌐 Webhook URLs (ไม่เปลี่ยน — ใช้ได้ตลอด)

| Platform | URL |
|----------|-----|
| **LINE** | `https://festivity-willfully-anchor.ngrok-free.dev/webhook/line` |
| **Facebook** | `https://festivity-willfully-anchor.ngrok-free.dev/webhook/meta` |
| **Facebook Verify Token** | `Dilion1234` |

---

## 🤝 คำสั่งแอดมิน (พิมพ์ในแชทลูกค้า)

| พิมพ์ | ผลลัพธ์ |
|-------|---------|
| 😊 | 🔒 บอทหยุดตอบ — แอดมินคุยเอง |
| ❤️ | 🔓 บอทกลับมาตอบ |

---

## ⚠️ ถ้าบอทไม่ตอบ ให้เช็คตามลำดับ

1. `pm2 status` → ต้องเป็น **online**
2. ดูว่าหน้าต่าง ngrok ยังเปิดค้างอยู่ไหม
3. `pm2 logs plu-chatbot --lines 20 --nostream` → ดูว่ามี Error อะไร
4. ถ้ามี `Access token is invalid` → ต้องอัปเดต Dify API Key ใน `.env` แล้วรัน:
   ```powershell
   pm2 restart plu-chatbot --update-env
   ```
