import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seeding...') // ถ้าบรรทัดนี้ทำงาน ต้องเห็น Log ครับ

  // 1. ล้างข้อมูลเก่า
  try {
    await prisma.joinActivity.deleteMany()
    await prisma.teacher.deleteMany()
    await prisma.registration.deleteMany()
    await prisma.event.deleteMany()
    await prisma.school.deleteMany()
    await prisma.location.deleteMany()
    console.log('🧹 Cleared old data.')
  } catch (error) {
    console.log('⚠️ No old data to clear or table missing.')
  }

  // 2. สร้างสถานที่
  const location = await prisma.location.create({
    data: {
      locationName: 'หอประชุมพญางำเมือง',
      province: 'พะเยา',
      district: 'เมือง',
      subDistrict: 'แม่กา',
      address: 'มหาวิทยาลัยพะเยา',
      conferenceRoom: 'ห้องประชุมใหญ่ Zone A',
    },
  })

  // 3. สร้างโรงเรียน
  const school1 = await prisma.school.create({
    data: {
      schoolName: 'โรงเรียนสาธิต มพ.',
      schoolType: 'มัธยมศึกษา',
      province: 'พะเยา',
      district: 'เมือง',
      email: 'demo@up.ac.th',
      contactPhone: '054-123-456',
    },
  })

  const school2 = await prisma.school.create({
    data: {
      schoolName: 'โรงเรียนแม่กาวิทยาคม',
      schoolType: 'ขยายโอกาส',
      province: 'พะเยา',
      district: 'แม่กา',
      email: 'maeka@school.ac.th',
      contactPhone: '054-987-654',
    },
  })

  // 4. สร้างกิจกรรม
  const event = await prisma.event.create({
    data: {
      eventName: 'ค่ายวิทยาศาสตร์สัมพันธ์ ครั้งที่ 1',
      eventDate: new Date('2025-11-25'),
      allowStudent: true,
      locationId: location.id,
    },
  })

  // 5. สร้างการลงทะเบียน
  const registration = await prisma.registration.create({
    data: {
      schoolId: school1.id,
      activityId: event.id,
      password: 'password123',
      studentAmount: 50,
      startDate: new Date(),
      endDate: new Date(),
    },
  })

  // 6. สร้างครู
  const teacher = await prisma.teacher.create({
    data: {
      teacherName: 'อ.สมชาย ใจดี',
      position: 'ครูชำนาญการ',
      department: 'หมวดวิทยาศาสตร์',
      phone: '081-111-2222',
      email: 'somchai@demo.ac.th',
      registrationId: registration.id,
    },
  })

  // 7. สร้าง JoinActivity
  await prisma.joinActivity.create({
    data: {
      teacherId: teacher.id,
      registrationId: registration.id,
    },
  })

  console.log('✅ Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
