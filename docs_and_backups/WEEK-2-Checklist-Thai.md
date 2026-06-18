# 📋 WEEK 2: Integration Testing & UAT Preparation

**Status:** ต่อจาก Week 1 ที่เสร็จ ✅  
**Goal:** ทำให้ระบบทำงานประสานกันได้ + พร้อมสำหรับ Canary

---

## 🎯 **Week 2 Overview (7 วัน)**

```
Day 8-9:   Integration Test (validate + alert + sheets)
Day 10-11: User Acceptance Test (UAT)
Day 12-13: Performance Test + Load Test
Day 14:    Documentation & Team Training
```

---

## 📍 **ขั้นตอนที่ 1: Integration Test (Day 8-9)**

### **ทำไร:** 
ทดสอบว่า `validate_contact.py` + `send_alert.py` + `Google Sheets` ทำงานร่วมกันได้

### **ขั้นตอน:**

```python
# create_integration_test.py

"""
Integration test: ทั้งสามส่วนทำงานร่วมกัน
1. Bot ตอบ → validate_contact.py ตรวจเช็ค
2. ถ้า leak → send_alert.py ส่ง Slack
3. บันทึกลง Google Sheets
"""

import requests
from validate_contact import validate_contact
from send_alert import send_alert
import gspread  # pip install gspread google-auth-oauthlib

# Setup Google Sheets (optional - if you want auto-logging)
# gc = gspread.oauth()
# sh = gc.open("Shinawatra Metrics")
# ws = sh.worksheet("Sheet1")

def integration_test_scenario(bot_response, request_type):
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
        result = 'LEAK'
    else:
        print(f"   ✓ No phone given")
        result = 'OK'
    
    # Step 2: Alert (if leak detected)
    if result == 'LEAK':
        print(f"2️⃣  LEAK DETECTED! Sending alert...")
        send_alert(
            f"Contact Leak: '{bot_response}' → {phone}",
            'critical'
        )
        print(f"   ✓ Alert sent to Slack")
    else:
        print(f"2️⃣  No leak - no alert needed")
    
    # Step 3: Log to Google Sheets (optional)
    print(f"3️⃣  Logging to Sheets...")
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
        # Good scenarios (should NOT leak)
        ("สวัสดี", "greeting"),
        ("สบายดี", "greeting"),
        ("ขอข้อมูลหลักสูตร", "info_request"),
        
        # Bad scenarios (SHOULD leak)
        ("ติดต่อแอดมิน", "contact_request"),
        ("ขอติดต่อแอดมิน", "contact_request"),
        
        # Edge cases
        ("ติดต่อแอดมิน!!!", "contact_request"),
        ("ติดต่อแอดมิน 📞", "contact_request"),
    ]
    
    results = []
    leak_count = 0
    
    for bot_response, req_type in test_scenarios:
        result = integration_test_scenario(bot_response, req_type)
        results.append(result)
        
        if result['result'] == 'LEAK':
            leak_count += 1
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 INTEGRATION TEST SUMMARY")
    print(f"{'='*60}")
    print(f"Total tests: {len(test_scenarios)}")
    print(f"Leaks detected: {leak_count}")
    print(f"Status: {'✅ ALL OK' if leak_count == 0 else '⚠️ LEAKS FOUND'}")
    print(f"{'='*60}\n")
```

**วิธีรัน:**
```bash
# 1. Save เป็น integration_test.py

# 2. ใน terminal:
python integration_test.py

# Output:
============================================================
Testing: Bot response = 'สวัสดี'
============================================================
1️⃣  Validating...
   ✓ No phone given
2️⃣  No leak - no alert needed
3️⃣  Logging to Sheets...

✅ Test completed: OK

============================================================
Testing: Bot response = 'ติดต่อแอดมิน'
============================================================
1️⃣  Validating...
   ✓ Phone given: 082-383-0243
2️⃣  LEAK DETECTED! Sending alert...
   ✓ Alert sent to Slack
3️⃣  Logging to Sheets...

✅ Test completed: LEAK

============================================================
📊 INTEGRATION TEST SUMMARY
============================================================
Total tests: 7
Leaks detected: 3 (expected)
Status: ✅ ALL OK
============================================================
```

---

## 📍 **ขั้นตอนที่ 2: User Acceptance Test (UAT) (Day 10-11)**

### **ทำไร:**
ให้ real user (ผู้ใช้จริง) ทดสอบบอท ดูว่าใช้ได้ดีไหม

### **ขั้นตอน:**

**ส่วน A: สร้าง UAT Checklist**

```
📋 UAT Test Plan

สำหรับ: Nursing Student (หลักสูตรพยาบาล)

Test Cases:
[ ] 1. สอบถามเกี่ยวกับหลักสูตร RN
[ ] 2. ถาม requirement (วุฒิ, เกรด)
[ ] 3. ถาม admission process
[ ] 4. ขอติดต่อแอดมิน (ต้องให้เบอร์)
[ ] 5. สอบถามซ้ำสิ่งที่เคยถาม (ไม่ต้องถามใหม่)
[ ] 6. พูดซ้ำ ๆ (ความเบื่อหน่าย)
[ ] 7. ระบบตอบได้ทันเวลาไหม (< 2 วินาที)
[ ] 8. ข้อมูลถูกต้องไหม

Score:
- ✅ = ผ่าน
- ⚠️ = ผ่านแต่มีปัญหาน้อย
- ❌ = ไม่ผ่าน
```

**ส่วน B: เรียก 3-5 Users ทดสอบจริง**

```
User Group:
1. High school student (สนใจ RN)
2. College student (สนใจ PN)
3. Adult learner (สนใจ Bachelor)
4. Admin staff (test internal use)

ให้ทดสอบ 30 นาที แล้วเก็บ feedback
```

**ส่วน C: Feedback Form**

```
คำถาม:
1. บอทตอบเข้าใจไหม? (1-5)
2. ตอบเร็วไหม? (1-5)
3. เคยได้เบอร์โทรโดยไม่ขอไหม? (Yes/No)
4. มีปัญหาอะไรบ้าง?
5. ให้คะแนน 1-10 คะแนน
```

---

## 📍 **ขั้นตอนที่ 3: Performance Test (Day 12-13)**

### **ทำไร:**
ทดสอบว่าระบบทนเวลาคนใช้พร้อมกันได้ไหม

### **ขั้นตอน:**

```python
# performance_test.py
"""
Load test: จำลอง 100+ คนใช้พร้อมกัน
"""

import threading
import time
from validate_contact import validate_contact

def load_test(num_users=100, requests_per_user=10):
    """
    Simulate num_users users, each making requests_per_user requests
    """
    
    start_time = time.time()
    responses = []
    errors = []
    
    def user_session(user_id):
        try:
            for i in range(requests_per_user):
                # Simulate user input
                inputs = [
                    "สวัสดี",
                    "ติดต่อแอดมิน",
                    "เบอร์หน่อย",
                ]
                
                result = validate_contact(inputs[i % len(inputs)])
                responses.append({
                    'user': user_id,
                    'request': i,
                    'response_time': time.time(),
                    'success': result.get('phone') is not None or result.get('phone') is None
                })
        except Exception as e:
            errors.append({'user': user_id, 'error': str(e)})
    
    # Create threads
    threads = []
    for user_id in range(num_users):
        t = threading.Thread(target=user_session, args=(user_id,))
        threads.append(t)
        t.start()
    
    # Wait for all to finish
    for t in threads:
        t.join()
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Report
    print(f"\n{'='*60}")
    print("📊 PERFORMANCE TEST REPORT")
    print(f"{'='*60}")
    print(f"Users simulated: {num_users}")
    print(f"Requests per user: {requests_per_user}")
    print(f"Total requests: {num_users * requests_per_user}")
    print(f"Total time: {total_time:.2f} seconds")
    print(f"Avg time per request: {total_time / (num_users * requests_per_user):.4f} seconds")
    print(f"Requests per second: {(num_users * requests_per_user) / total_time:.2f} RPS")
    print(f"\nSuccessful: {len(responses)}")
    print(f"Errors: {len(errors)}")
    print(f"\nStatus: {'✅ PASSED' if len(errors) == 0 else '❌ FAILED'}")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    load_test(num_users=100, requests_per_user=10)
```

**รัน:**
```bash
python performance_test.py

Output:
============================================================
📊 PERFORMANCE TEST REPORT
============================================================
Users simulated: 100
Requests per user: 10
Total requests: 1000
Total time: 2.34 seconds
Avg time per request: 0.00234 seconds
Requests per second: 427.35 RPS

Successful: 1000
Errors: 0

Status: ✅ PASSED
============================================================
```

---

## 📍 **ขั้นตอนที่ 4: Documentation & Training (Day 14)**

### **ทำไร:**
เตรียม documentation + สอนทีม

### **ขั้นตอน:**

**ส่วน A: เขียน Operations Manual**

```markdown
# Operations Manual - Shinawatra Support Systems

## Daily Checks

Every morning:
- [ ] Check Google Sheets metrics
- [ ] Review Slack alerts (if any)
- [ ] Verify validate_contact.py running
- [ ] Verify send_alert.py working

## Weekly Maintenance

- [ ] Review test results
- [ ] Update documentation
- [ ] Check for edge cases
- [ ] Plan improvements

## Emergency Procedures

If bot leaks contact:
1. Alert fires → check Slack
2. Investigate logs
3. Fix bug
4. Re-run tests
5. Deploy hotfix
6. Monitor for 24h
```

**ส่วน B: Team Training**

```
Session 1 (30 min): System Overview
  - Architecture
  - Components
  - Data flow

Session 2 (30 min): Operations
  - How to monitor
  - How to respond to alerts
  - How to run tests

Session 3 (30 min): Troubleshooting
  - Common issues
  - How to debug
  - When to escalate
```

---

## ✅ **Week 2 Checklist (นำไปใส่ Notion)**

```
☐ Day 8-9: Integration Test
  ☐ Write integration_test.py
  ☐ Run all scenarios
  ☐ Document results
  ☐ All tests pass ✅

☐ Day 10-11: UAT
  ☐ Create UAT test plan
  ☐ Find 3-5 test users
  ☐ Conduct testing (30 min each)
  ☐ Collect feedback
  ☐ Fix critical issues

☐ Day 12-13: Performance Test
  ☐ Write performance_test.py
  ☐ Run load test (100+ users)
  ☐ Verify RPS > 100
  ☐ Document metrics

☐ Day 14: Documentation & Training
  ☐ Write Operations Manual
  ☐ Record training session (optional)
  ☐ Team training (3 sessions)
  ☐ Q&A session

---

Status: WEEK 2 COMPLETE ✅
Next: WEEK 3 - Canary Deployment
```

---

## 🚀 **Week 2 Success Criteria**

```
✅ Integration test: 100% pass
✅ UAT feedback: Average 4/5 or higher
✅ Performance test: No errors, RPS > 100
✅ Team training: All staff certified
✅ Documentation: Complete & reviewed

→ READY FOR CANARY DEPLOYMENT ✅
```

---

## 📝 **Copy-Paste Step ต่อไปสำหรับ Notion:**

```
Week 2: Full Integration Testing & UAT ✅

Day 8-9:
☐ Integration Test (validate + alert + sheets)
  └─ Code: integration_test.py
  └─ Expected: All passed
  └─ Time: 4 hours

Day 10-11:
☐ User Acceptance Test
  └─ 3-5 real users test
  └─ Feedback collection
  └─ Issue fixing
  └─ Time: 8 hours

Day 12-13:
☐ Performance & Load Test
  └─ Code: performance_test.py
  └─ Target: >100 RPS, 0 errors
  └─ Time: 4 hours

Day 14:
☐ Documentation & Team Training
  └─ Operations Manual
  └─ 3 training sessions
  └─ Q&A
  └─ Time: 4 hours

Status: Ready for Canary (Week 3) ✅
```

---

**ต่อจาก Week 2 → Week 3: Canary Deployment (10% users)**
