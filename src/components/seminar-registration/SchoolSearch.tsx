import { prisma } from '@/libs/prisma'
import RegistrationForm from '@/components/seminar-registration/RegistrationForm'

// ดึงข้อมูล School และ Event จาก Server จริง
async function getMasterData() {
  try {
    // 1. ดึงโรงเรียนจาก View (VwMasEducation)
    const schools = await prisma.vwMasEducation.findMany({
      select: { educationId: true, educationNameTh: true, provinceNameTh: true },
      take: 2000, // ดึงมา 2000 รายการ
      orderBy: { educationNameTh: 'asc' }
    })

    // 2. ดึงกิจกรรมจาก Table Event
    const events = await prisma.event.findMany({
      where: { allowStudent: true },
      orderBy: { eventDate: 'asc' }
    })

    return {
      schools: schools.map(s => ({
        id: s.educationId,
        name: s.educationNameTh || '',
        province: s.provinceNameTh || ''
      })),
      events: events.map(e => ({
        id: e.id,
        name: e.eventName || '',
        date: e.eventDate
      }))
    }
  } catch (error) {
    console.error('Database Error:', error) // ถ้า Connect ไม่ได้จริงๆ ให้โยน Error ออกไปเลย เพื่อให้เรารู้ (หรือจะ return ว่างก็ได้)
    throw error
  }
}

export default async function Page() {
  // เรียกฟังก์ชันดึงข้อมูล
  const data = await getMasterData()

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f4f5fa', minHeight: '100vh' }}>
      <RegistrationForm schools={data.schools} events={data.events} />
    </div>
  )
}
