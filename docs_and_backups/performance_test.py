import threading
import time
import random
from validate_contact import validate_contact

def simulate_user_requests(user_id, requests_per_user, results):
    """
    จำลองผู้ใช้งาน 1 คน ส่งคำถามเข้าไปรัวๆ
    """
    test_phrases = [
        ("สวัสดี", "greeting"),
        ("ติดต่อแอดมิน", "contact_request"),
        ("อยากเรียน ป.โท", "general_query"),
        ("ขอเบอร์", "contact_request"),
        ("สมัครพยาบาล", "general_query")
    ]
    
    success_count = 0
    start_time = time.time()
    
    for i in range(requests_per_user):
        text, req = random.choice(test_phrases)
        
        # รัน Validation
        try:
            res = validate_contact(text)
            if res is not None:
                success_count += 1
        except Exception as e:
            print(f"Error User {user_id}: {e}")
            
    end_time = time.time()
    
    results.append({
        'user_id': user_id,
        'success': success_count,
        'total': requests_per_user,
        'time': end_time - start_time
    })

def run_performance_test(num_users=100, requests_per_user=10):
    print(f"\n🚀 เริ่มต้น Performance Test...")
    print(f"👥 จำนวนผู้ใช้จำลอง: {num_users} คน")
    print(f"💬 จำนวนคำถามต่อคน: {requests_per_user} คำถาม")
    print(f"📊 รวมทั้งหมด: {num_users * requests_per_user:,} คำถาม\n")
    
    threads = []
    results = []
    
    start_all = time.time()
    
    # สร้าง Threads จำลองคนเข้ามาพร้อมกัน
    for i in range(num_users):
        t = threading.Thread(target=simulate_user_requests, args=(i, requests_per_user, results))
        threads.append(t)
        t.start()
        
    # รอจนกว่าทุกคนจะยิงคำถามเสร็จ
    for t in threads:
        t.join()
        
    end_all = time.time()
    total_time = end_all - start_all
    
    # สรุปผล
    total_success = sum(r['success'] for r in results)
    total_expected = num_users * requests_per_user
    
    print("=" * 50)
    print("📈 PERFORMANCE REPORT")
    print("=" * 50)
    print(f"เวลาที่ใช้ทั้งหมด : {total_time:.4f} วินาที")
    print(f"จำนวนที่ประมวลผล : {total_success:,} / {total_expected:,} สำเร็จ")
    print(f"ความเร็วเฉลี่ย   : {total_expected / total_time:.2f} คำถาม/วินาที")
    print("=" * 50)
    
    if total_success == total_expected:
        print("✅ STATUS: PASS (ระบบประมวลผลได้ 100% ไม่มีคอขวด)")
    else:
        print("❌ STATUS: FAILED (มีการ Drop หรือ Error)")

if __name__ == '__main__':
    # ยิง 100 คน คนละ 10 คำถาม = 1,000 Request พร้อมกัน
    run_performance_test(num_users=100, requests_per_user=10)
