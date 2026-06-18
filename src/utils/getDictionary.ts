// src/utils/getDictionary.ts

import 'server-only'
import type { Locale } from '@/configs/i18n'

const dictionaries = {
  en: () => import('@/data/dictionaries/en.json').then(module => module.default),
  th: () => import('@/data/dictionaries/th.json').then(module => module.default) // เพิ่มบรรทัดนี้สำหรับภาษาไทย
  // fr: () => import('@/data/dictionaries/fr.json').then(module => module.default),  <-- ลบหรือ comment ทิ้ง
  // ar: () => import('@/data/dictionaries/ar.json').then(module => module.default)   <-- ลบหรือ comment ทิ้ง
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
