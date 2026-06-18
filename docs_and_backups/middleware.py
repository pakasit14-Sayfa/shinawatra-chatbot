import os
import httpx
from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Dict

from validate_contact import validate_contact
from send_alert import send_alert

app = FastAPI(title="Shinawatra Chatbot Middleware")

# --- Configuration ---
# ใส่ DIFY_API_KEY ที่ได้จากการกด Publish ตรงนี้
DIFY_API_URL = os.getenv("DIFY_API_URL", "https://api.dify.ai/v1/chat-messages")
DIFY_API_KEY = os.getenv("DIFY_API_KEY", "app-G8QRfdyvO9wY9jTtpiyKIyXs")

# --- In-Memory State ---
# Store handoff state. True = Admin is talking, Bot is paused.
handoff_state: Dict[str, bool] = {}

# --- Dify API Call ---
async def call_dify(query: str, user_id: str) -> str:
    headers = {
        "Authorization": f"Bearer {DIFY_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": {},
        "query": query,
        "response_mode": "blocking",
        "conversation_id": "", # ในอนาคตสามารถ track conversation_id เพื่อจำบริบทได้
        "user": user_id
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(DIFY_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return data.get("answer", "เกิดข้อผิดพลาดในการรับข้อมูลจากระบบ")
        except Exception as e:
            print(f"Dify Error: {e}")
            return "ขออภัยค่ะ ระบบขัดข้องชั่วคราว"

# --- Main Logic ---
async def process_message(channel: str, user_id: str, user_text: str) -> str:
    # 1. ตรวจสอบสถานะการ Handoff (ว่าแอดมินคุยอยู่หรือไม่)
    if handoff_state.get(user_id, False):
        if user_text.strip().lower() == "/start":
            handoff_state[user_id] = False
            return "🟢 ระบบบอทเปิดการทำงานอีกครั้งค่ะ มีอะไรให้อาจารย์/แอดมินช่วยไหมคะ?"
        else:
            # ไม่ตอบอะไร ปล่อยให้แอดมินคุยต่อ
            return ""

    # 2. ตรวจจับคำสั่งเปลี่ยนโหมด
    if user_text.strip().lower() == "/stop" or "ติดต่อแอดมิน" in user_text:
        handoff_state[user_id] = True
        send_alert(f"🚨 Handoff Triggered by {user_id} in channel {channel}. Message: {user_text}", "warning")
        return "รอสักครู่นะคะ ระบบกำลังโอนสายให้แอดมิน/อาจารย์เข้ามาดูแลค่ะ"

    # 3. Persona & Channel Injection (การแนบคำสั่งลับตามเพจ)
    persona_prefix = ""
    if channel == "fb_nurse":
        persona_prefix = "[System: สวมบทบาทเป็น 'อาจารย์' ห้ามตอบเรื่อง ป.โท]\n\nคำถามจากนักศึกษา: "
    elif channel == "fb_main":
        persona_prefix = "[System: สวมบทบาท 'แอดมินทางการ' ห้ามตอบเรื่องพยาบาล]\n\nคำถามจากนักศึกษา: "
    elif channel == "line":
        persona_prefix = "[System: ตอบแบบ 'Hybrid' สุภาพและเป็นมิตร]\n\nคำถามจากนักศึกษา: "
    
    injected_query = f"{persona_prefix}{user_text}"

    # 4. เรียก Dify
    bot_response = await call_dify(injected_query, user_id)

    # 5. Interceptor (ด่านตรวจเบอร์โทรหลุด)
    validation = validate_contact(bot_response)
    if validation.get("phone"):
        send_alert(f"⚠️ Contact Leak Prevented for user {user_id}! Bot tried to send: {bot_response}", "critical")
        # เปลี่ยนคำตอบไม่ให้เบอร์หลุด
        bot_response = "หากต้องการติดต่อโดยตรง รบกวนแจ้งความประสงค์ทิ้งไว้ แอดมินจะรีบเข้ามาดูแลนะคะ"

    return bot_response

# --- Webhook Endpoints ---
class WebhookPayload(BaseModel):
    user_id: str
    message: str

@app.post("/webhook/fb_nurse")
async def webhook_fb_nurse(payload: WebhookPayload):
    response = await process_message("fb_nurse", payload.user_id, payload.message)
    return {"reply": response}

@app.post("/webhook/fb_main")
async def webhook_fb_main(payload: WebhookPayload):
    response = await process_message("fb_main", payload.user_id, payload.message)
    return {"reply": response}

@app.post("/webhook/line")
async def webhook_line(payload: WebhookPayload):
    response = await process_message("line", payload.user_id, payload.message)
    return {"reply": response}

@app.get("/health")
def health_check():
    return {"status": "OK", "dify_configured": DIFY_API_KEY != "YOUR_DIFY_API_KEY_HERE"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
