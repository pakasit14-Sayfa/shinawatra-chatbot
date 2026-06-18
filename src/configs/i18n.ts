// src/configs/i18n.ts
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'th'],
  langDirection: {
    en: 'ltr', // ltr = Left to Right (ซ้ายไปขวา)
    th: 'ltr' // ไทยก็อ่านซ้ายไปขวา
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
