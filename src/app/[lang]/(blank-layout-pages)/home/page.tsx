// src/app/[lang]/home/page.tsx

import React from 'react'

// 👇 แก้เป็นแบบนี้ครับ (จุดเดียว ./ แปลว่าไฟล์อยู่ที่เดียวกัน)
import RegistrationForm from './RegistrationForm'

export const metadata = {
  title: 'ลงทะเบียนสัมมนาครูแนะแนว | มหาวิทยาลัยพะเยา',
  description: 'ระบบลงทะเบียนเข้าร่วมโครงการสัมมนาครูแนะแนว'
}

type Props = {
  params: Promise<{ lang: string }>
}

export default async function Page({ params }: Props) {
  const { lang } = await params

  return <RegistrationForm locale={lang as any} />
}
