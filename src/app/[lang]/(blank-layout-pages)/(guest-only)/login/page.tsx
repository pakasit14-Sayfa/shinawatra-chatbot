// src/app/[lang]/login/page.tsx

import type { Metadata } from 'next'

import { getDictionary } from '@/utils/getDictionary'
import type { Locale } from '@/configs/i18n'

// Import Component ที่เราสร้างในขั้นตอนที่ 1
import LoginContent from './LoginContent'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

// Server Component (ยังคงเป็น async ได้เหมือนเดิม)
const LoginPage = async ({ params }: { params: Promise<{ lang: Locale }> }) => {
  const { lang } = await params

  // 1. ดึง Dictionary
  const dictionary = await getDictionary(lang)
  const t = dictionary.login

  // 2. จัดการ string (Logic เดิมของคุณ)
  const contactParts = t.contactSupport.split(' (')
  const contactLine1 = contactParts[0]
  const contactLine2 = contactParts[1] ? `(${contactParts[1]}` : ''

  // 3. เตรียมข้อมูล UI text
  const ui =
    lang === 'th'
      ? {
          navProduct: 'PRODUCT',
          navHome: 'หน้าหลัก',
          navUp: 'ม.พะเยา',
          navDesc: 'เข้าใช้งานระบบสำหรับสถาบันที่ลงทะเบียนแล้ว',
          navAdmin: 'ADMIN',
          schoolLabel: 'เลือก โรงเรียน',
          schoolPlaceholder: 'เลือกโรงเรียน...',
          passwordLabel: 'รหัสผ่าน',
          passwordPlaceholder: 'กรอกรหัสผ่าน...',
          buttonText: t.loginWithUPAccount
        }
      : {
          navProduct: 'PRODUCT',
          navHome: 'Home',
          navUp: 'UP',
          navDesc: 'Login for registered institutions',
          navAdmin: 'ADMIN',
          schoolLabel: 'Select school',
          schoolPlaceholder: 'Select school...',
          passwordLabel: 'Password',
          passwordPlaceholder: 'Enter password...',
          buttonText: t.loginWithUPAccount
        }

  // 4. ส่งข้อมูลทั้งหมดไปให้ Client Component จัดการหน้าตา
  return <LoginContent dictionary={t} lang={lang} ui={ui} contactLine1={contactLine1} contactLine2={contactLine2} />
}

export default LoginPage
