import requests
from validate_contact import validate_contact
from send_alert import send_alert

def integration_test_scenario(bot_response, request_type="general"):
    """
    Test บอทตอบ + validation + alert + logging
    
    Args:
        bot_response: ตัวอักษรที่บอทตอบ (เช่น "ติดต่อแอดมิน" หรือ "สวัสดี")
        request_type: ประเภท request
    
    Returns:
        result dict
    """
    
    print(f"\n{'='*60}")
    print(f"Testing: Bot response = '{bot_response}'")
    print(f"{'='*60}")
    
    # Step 1: Validate
    print(f"1️⃣  Validating...")
    validation = validate_contact(bot_response)
    phone = validation.get('phone')
    
    if phone:
        print(f"   ✓ Phone given: {phone}")
        # ถ้าให้เบอร์ในบริบทที่ขอ "ติดต่อแอดมิน" ก็คือปกติ (OK) 
        # แต่ถ้าให้ในบริบททั่วไป ถือเป็น LEAK
        if "ติดต่อแอดมิน" in bot_response or "ติดต่อ แอดมิน" in bot_response:
             result = 'OK (Authorized Contact)'
        else:
             result = 'LEAK'
    else:
        print(f"   ✓ No phone given")
        result = 'OK (Safe)'
    
    # Step 2: Alert (if leak detected)
    if result == 'LEAK':
        print(f"2️⃣  LEAK DETECTED! Sending alert...")
        success = send_alert(
            f"Contact Leak Detected: '{bot_response}' → {phone}",
            'critical'
        )
        if success:
            print(f"   ✓ Alert sent to Slack")
        else:
            print(f"   ❌ Failed to send alert")
    else:
        print(f"2️⃣  No leak - no alert needed")
    
    # Step 3: Log to Google Sheets (optional placeholder)
    print(f"3️⃣  Logging to Sheets (Placeholder)...")
    print(f"   ✓ Logged: {bot_response} | {result} | {phone}")
    
    print(f"\n✅ Test completed: {result}")
    return {
        'input': bot_response,
        'result': result,
        'phone': phone
    }

# ===== RUN INTEGRATION TESTS =====
if __name__ == '__main__':
    
    test_scenarios = [
        # 1. ปกติ: ไม่มีการหลุดเบอร์
        ("สวัสดีค่ะ สนใจเรียน ป.โท หรือเปล่าคะ?", "greeting"),
        
        # 2. ปกติ: ให้เบอร์ถูกต้องเพราะมีการขอ
        ("หากต้องการติดต่อแอดมิน โทร 082-383-0243 ได้เลยค่ะ", "contact_request"),
        
        # 3. LEAK: บอทเผลอพ่นเบอร์ออกมาตอนคุยเรื่องอื่น (ตัวอย่างเพื่อให้ระบบ Slack ร้องเตือน)
        ("ค่าเทอม 25,000 บาทค่ะ (082-383-0243)", "general_query")
    ]
    
    for text, req in test_scenarios:
        integration_test_scenario(text, req)
