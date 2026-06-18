import requests
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint_path, user_id, message):
    print(f"\n{'='*50}")
    print(f"📤 ส่งข้อความ: '{message}'")
    print(f"📍 ปลายทาง: {endpoint_path} | User: {user_id}")
    
    payload = {
        "user_id": user_id,
        "message": message
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}{endpoint_path}", json=payload)
        response.raise_for_status()
        end_time = time.time()
        
        reply = response.json().get("reply", "")
        print(f"📥 บอทตอบกลับ ({(end_time - start_time):.2f}s):")
        if reply == "":
            print("   [ 🤫 ไม่มีการตอบกลับ - ปล่อยให้แอดมินคุย ]")
        else:
            print(f"   💬 {reply}")
            
    except requests.exceptions.ConnectionError:
        print("❌ เชื่อมต่อไม่ได้: โปรดตรวจสอบให้แน่ใจว่าได้เปิดหน้าต่าง Terminal รัน 'python middleware.py' ทิ้งไว้แล้ว")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 เริ่มจำลองการทดสอบ Middleware (พอร์ต 8000)...")
    
    # 1. ทดสอบเพจพยาบาล (fb_nurse)
    print("\n--- TEST 1: เพจพยาบาล (ควรแทนตัวเองว่า 'อาจารย์') ---")
    test_endpoint("/webhook/fb_nurse", "user_nurse_01", "สวัสดีค่ะ สนใจหลักสูตรพยาบาลค่ะ")
    time.sleep(1)
    
    # 2. ทดสอบเพจหลัก (fb_main)
    print("\n--- TEST 2: เพจหลัก (ควรแทนตัวเองว่า 'แอดมิน') ---")
    test_endpoint("/webhook/fb_main", "user_main_01", "สวัสดีครับ มีหลักสูตรวิศวกรรมไหมครับ")
    time.sleep(1)
    
    # 3. ทดสอบการเข้าสู่โหมดสลับคน (Handoff Mode)
    print("\n--- TEST 3: ขอเบอร์โทร/ติดต่อแอดมิน (บอทควรโอนสาย) ---")
    test_endpoint("/webhook/fb_nurse", "user_nurse_01", "มีปัญหาการสมัคร ขอติดต่อแอดมินหน่อยครับ")
    time.sleep(1)
    
    # 4. ทดสอบคุยขณะที่แอดมินเข้ามาเทคโอเวอร์ (บอทต้องเงียบ)
    print("\n--- TEST 4: พิมพ์ต่อในขณะที่บอทปิดอยู่ (บอทควรจะเงียบ) ---")
    test_endpoint("/webhook/fb_nurse", "user_nurse_01", "แอดมินมาหรือยังครับ?")
    time.sleep(1)
    
    # 5. แอดมินสั่งเริ่มบอทใหม่
    print("\n--- TEST 5: แอดมินพิมพ์ /start เพื่อเปิดบอทอีกครั้ง ---")
    test_endpoint("/webhook/fb_nurse", "user_nurse_01", "/start")
