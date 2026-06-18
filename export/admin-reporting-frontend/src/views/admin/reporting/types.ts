export type ReportType = 'daily' | 'project'

export type DailyReportSection = 'all' | 'before' | 'after'
export type ProjectReportSection = 'all' | 'activity' | 'province' | 'schools'
export type ReportSection = DailyReportSection | ProjectReportSection

export type ComparisonRow = {
  name: string
  before: number
  after: number
  change: number
}

export type BarItem = {
  label: string
  value: number
  percentage?: number
}

export type OnlineRegistrationSummary = {
  totalOnlineRegistrations: number
  advanceRegistrations: number
  sameDayRegistrations: number
  previousEventCount: number
  projectAverage: number
}

export type ProvinceRegistrationSummary = {
  provinces: Array<{
    name: string
    count: number
    percentage: number
  }>
}

export type SchoolTeacherSummary = {
  totalSchools: number
  totalTeachers: number
  averageTeachersPerSchool: number
  topSchools: Array<{
    name: string
    teacherCount: number
  }>
  byProvince: Array<{
    province: string
    schoolCount: number
    teacherCount: number
  }>
}

export type ActualAttendanceSummary = {
  totalOnlineRegistrations: number
  actualAttendance: number
  absent: number
  onsiteRegistrations: number
  totalParticipants: number
  attendanceRate: number
  previousEventRate: number
}

export type BeforeAfterComparison = {
  provinces: ComparisonRow[]
  schools: ComparisonRow[]
  teachers: {
    registered: number
    attended: number
    absent: number
    onsite: number
  }
}

export type IncreasedProvinces = {
  provinces: Array<{
    name: string
    increase: number
    from: number
    to: number
  }>
  schools: Array<{
    name: string
    teacherCount: number
  }>
  summary: {
    provinceCount: number
    schoolCount: number
    teacherCount: number
  }
}

export type DailyEventReportData = {
  date: string
  eventName: string
  onlineRegistrationSummary: OnlineRegistrationSummary
  provinceRegistrationSummary: ProvinceRegistrationSummary
  schoolTeacherSummary: SchoolTeacherSummary
  actualAttendanceSummary: ActualAttendanceSummary
  beforeAfterComparison: BeforeAfterComparison
  increasedProvinces: IncreasedProvinces
}

export type ActivityComparison = {
  projectName: string
  totalActivities: number
  topActivities: Array<{
    name: string
    count: number
    percentage: number
  }>
}

export type ProvinceRanking = {
  projectName: string
  topProvinces: Array<{
    name: string
    teacherCount: number
    schoolCount: number
    attendanceRate: number
  }>
  comparison: Array<{
    province: string
    change: number
  }>
}

export type TopSchoolsByLocation = {
  byProvince: Array<{
    province: string
    topSchools: Array<{
      name: string
      teacherCount: number
    }>
  }>
}

export type ProjectReportData = {
  activityComparison: ActivityComparison
  provinceRanking: ProvinceRanking
  topSchoolsByLocation: TopSchoolsByLocation
}

export type SummaryCardItem = {
  label: string
  value: string
  caption?: string
  tone?: 'success' | 'warning' | 'info' | 'error'
  icon?: string
}
