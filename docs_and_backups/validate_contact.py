def validate_contact(input_text):
    """
    ตรวจสอบข้อความเพื่อดูว่าต้องให้เบอร์โทรศัพท์หรือไม่
    
    Args:
        input_text (str): ข้อความจากผู้ใช้
        
    Returns:
        dict: {'phone': '082-383-0243'} หรือ {'phone': None}
    """
    if not isinstance(input_text, str):
        return {'phone': None}
        
    # เงื่อนไข: ให้เบอร์เฉพาะเมื่อมีการขอ "ติดต่อแอดมิน" อย่างชัดเจน
    if "ติดต่อแอดมิน" in input_text or "ติดต่อ แอดมิน" in input_text:
        return {'phone': '082-383-0243'}
        
    # กรณีอื่นๆ ไม่ให้เบอร์
    return {'phone': None}
