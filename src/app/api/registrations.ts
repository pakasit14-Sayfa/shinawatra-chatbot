// ตัวอย่าง (Pseudo-code) ใน Next.js API Handler

// await prisma.$transaction(async (tx) => {
//     // 1. สร้าง Record การลงทะเบียนหลัก
//     const registration = await tx.registration.create({
//         data: {
//             schoolId: payload.schoolId,
//             studentAmount: payload.studentAmount,
//             // ... ข้อมูล Registration อื่นๆ
//         }
//     });

//     // 2. สร้าง Record ครู โดยผูกกับ registrationId ที่เพิ่งสร้าง
//     const teacherData = payload.teachers.map(t => ({
//         registrationId: registration.id,
//         teacherName: t.teacherName,
//         // ... ข้อมูล Teacher อื่นๆ
//     }));

//     await tx.teacher.createMany({
//         data: teacherData,
//         skipDuplicates: true, // หรือจัดการตามความเหมาะสม
//     });

//     return registration;
// });
