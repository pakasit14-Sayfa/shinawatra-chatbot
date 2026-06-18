// ตามโครงสร้าง School, Event, Teacher ใน schema.prisma

// ----------------------------------------------------
// I. Input Types สำหรับการลงทะเบียน (สิ่งที่ต้องส่งไป API)
// ----------------------------------------------------

export interface TeacherInput {
  tempId?: number; // ใช้สำหรับ Key ใน Front-end ก่อนบันทึกจริง
  teacherName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
}

export interface RegistrationPayload {
  schoolId: number;
  studentAmount: number;
  startDate: Date; // หรือ string ในรูปแบบ ISO 8601
  endDate: Date; // หรือ string ในรูปแบบ ISO 8601
  activityId: number[]; // ID ของ Event ที่เลือกเข้าร่วม
  teachers: TeacherInput[]; // ข้อมูลครูที่สร้างใหม่
  // ข้อมูลโรงเรียนเพิ่มเติม (ถ้าต้องสร้างโรงเรียนใหม่พร้อมกัน)
  schoolName?: string;
  contactPhone?: string;
  email?: string;
}

// ----------------------------------------------------
// II. Data Types ที่รับจาก API (สำหรับ Event Selector)
// ----------------------------------------------------

export interface EventData {
  id: number;
  eventName: string;
  eventDate: string; // "YYYY-MM-DD"
  locationName: string;
}
