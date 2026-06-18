// Type Imports
import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'

export default function AuthGuard({ children }: ChildrenType & { locale?: Locale }) {
  return <>{children}</>
}
