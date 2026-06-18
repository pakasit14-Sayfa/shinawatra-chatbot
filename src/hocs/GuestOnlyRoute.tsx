// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

const GuestOnlyRoute = ({ children }: ChildrenType & { lang?: Locale }) => {
  return <>{children}</>
}

export default GuestOnlyRoute
