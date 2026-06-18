'use server'

import { prisma } from '@/libs/prisma'

// Type ข้อมูลครู
export interface TeacherInput {
  title: string
  firstName: string
  lastName: string
  position: string
  email: string
  phone: string
}

// Type ข้อมูลที่จะส่งมาบันทึก
export interface RegistrationPayload {
  schoolId: number
  eventId: number
  teachers: TeacherInput[]
  password: string // 💡 NEW: รับรหัสผ่านจากฟอร์ม
}

export async function submitSeminarRegistration(data: RegistrationPayload) {
  // เพิ่มการตรวจสอบรหัสผ่าน
  if (!data.schoolId || !data.eventId || data.teachers.length === 0 || !data.password) {
    return { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (โรงเรียน, กิจกรรม, รายชื่อครู และรหัสผ่าน)' }
  }

  try {
    // ใช้ Transaction เพื่อความชัวร์ (ถ้าพัง ให้พังทั้งหมด ไม่บันทึกครึ่งๆ กลางๆ)
    await prisma.$transaction(async tx => {
      // 1. ตรวจสอบว่ามีโรงเรียนในตาราง School หรือยัง
      let school = await tx.school.findFirst({ where: { id: data.schoolId } })

      // ถ้ายังไม่มีโรงเรียนนี้ในตาราง School ให้ Copy มาจาก View
      if (!school) {
        const masterSchool = await tx.vwMasEducation.findUnique({ where: { educationId: data.schoolId } })

        if (!masterSchool) {
          throw new Error(`ไม่พบข้อมูลโรงเรียน ID: ${data.schoolId} ใน Master View`)
        }

        // 💡 FIX: รวมคำสั่งเป็น Batch เดียวเพื่อให้ IDENTITY_INSERT ทำงานได้ถูกต้องไม่หลุด Session
        await tx.$executeRawUnsafe(`
          SET IDENTITY_INSERT [School] ON;
          INSERT INTO [School] (school_id, school_name, province, school_type, address, district, contact_phone, email)
          VALUES (
            ${masterSchool.educationId},
            N'${(masterSchool.educationNameTh || '').replace(/'/g, "''")}',
            N'${(masterSchool.provinceNameTh || '').replace(/'/g, "''")}',
            'Secondary',
            '-',
            '-',
            '-',
            '-'
          );
          SET IDENTITY_INSERT [School] OFF;
        `)

        // 4. ดึงข้อมูลกลับมาใส่ตัวแปร school เพื่อให้โค้ดด้านล่างทำงานต่อได้
        school = await tx.school.findUnique({ where: { id: data.schoolId } })

        if (!school) throw new Error('ไม่สามารถสร้างข้อมูลโรงเรียนได้')
      }

      // 2. สร้างใบสมัคร (Registration)
      // 💡 FIX: ใช้รหัสผ่านที่ส่งมาจาก Client แทนการสุ่ม
      const newReg = await tx.registration.create({
        data: {
          schoolId: school.id,
          activityId: data.eventId,
          password: data.password, // 👈 ใช้ password ที่กำหนดเอง
          studentAmount: 0,
          startDate: new Date(),
          endDate: new Date()
        }
      })

      // 3. วนลูปสร้างครู (Teacher) และจับคู่ (JoinActivity)
      for (const t of data.teachers) {
        const newTeacher = await tx.teacher.create({
          data: {
            teacherName: `${t.title}${t.firstName} ${t.lastName}`,
            email: t.email,
            phone: t.phone,
            position: t.position,
            department: '-',
            registrationId: newReg.id
          }
        })

        await tx.joinActivity.create({
          data: {
            teacherId: newTeacher.id,
            registrationId: newReg.id
          }
        })
      }
    })

    return { success: true, message: 'ลงทะเบียนสำเร็จเรียบร้อยแล้ว' }
  } catch (error: any) {
    console.error('Registration Error:', error)

    return { success: false, message: `เกิดข้อผิดพลาด: ${error.message}` }
  }
}
