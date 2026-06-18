import type { DailyEventReportData, ProjectReportData, SummaryCardItem } from './types'

export const dailyReportMock: DailyEventReportData = {
  date: '15 January 2026',
  eventName: 'React Fundamentals Training',
  onlineRegistrationSummary: {
    totalOnlineRegistrations: 50,
    advanceRegistrations: 45,
    sameDayRegistrations: 5,
    previousEventCount: 42,
    projectAverage: 38
  },
  provinceRegistrationSummary: {
    provinces: [
      { name: 'Bangkok', count: 15, percentage: 30 },
      { name: 'Chiang Mai', count: 10, percentage: 20 },
      { name: 'Khon Kaen', count: 8, percentage: 16 },
      { name: 'Nakhon Ratchasima', count: 7, percentage: 14 },
      { name: 'Others', count: 10, percentage: 20 }
    ]
  },
  schoolTeacherSummary: {
    totalSchools: 12,
    totalTeachers: 50,
    averageTeachersPerSchool: 4.2,
    topSchools: [
      { name: 'University Demonstration School', teacherCount: 8 },
      { name: 'Bangkok Technical School', teacherCount: 6 },
      { name: 'Wat Phai Ngoen School', teacherCount: 5 },
      { name: 'Chiang Mai Wittaya', teacherCount: 4 },
      { name: 'Khon Kaen Pattana', teacherCount: 4 }
    ],
    byProvince: [
      { province: 'Bangkok', schoolCount: 5, teacherCount: 20 },
      { province: 'Chiang Mai', schoolCount: 3, teacherCount: 10 },
      { province: 'Khon Kaen', schoolCount: 2, teacherCount: 8 },
      { province: 'Nakhon Ratchasima', schoolCount: 2, teacherCount: 7 },
      { province: 'Others', schoolCount: 0, teacherCount: 5 }
    ]
  },
  actualAttendanceSummary: {
    totalOnlineRegistrations: 50,
    actualAttendance: 42,
    absent: 8,
    onsiteRegistrations: 3,
    totalParticipants: 45,
    attendanceRate: 84,
    previousEventRate: 78
  },
  beforeAfterComparison: {
    provinces: [
      { name: 'Bangkok', before: 15, after: 14, change: -1 },
      { name: 'Chiang Mai', before: 10, after: 9, change: -1 },
      { name: 'Khon Kaen', before: 8, after: 8, change: 0 },
      { name: 'Nakhon Ratchasima', before: 7, after: 7, change: 0 },
      { name: 'Others', before: 10, after: 4, change: -6 }
    ],
    schools: [
      { name: 'University Demonstration School', before: 8, after: 7, change: -1 },
      { name: 'Bangkok Technical School', before: 6, after: 6, change: 0 },
      { name: 'Wat Phai Ngoen School', before: 5, after: 5, change: 0 },
      { name: 'Chiang Mai Wittaya', before: 4, after: 4, change: 0 },
      { name: 'Khon Kaen Pattana', before: 4, after: 4, change: 0 }
    ],
    teachers: {
      registered: 50,
      attended: 42,
      absent: 8,
      onsite: 3
    }
  },
  increasedProvinces: {
    provinces: [
      { name: 'Sukhothai', increase: 2, from: 0, to: 2 },
      { name: 'Phitsanulok', increase: 1, from: 0, to: 1 }
    ],
    schools: [
      { name: 'Sukhothai Wittaya School', teacherCount: 2 },
      { name: 'Phitsanulok Pattana School', teacherCount: 1 }
    ],
    summary: {
      provinceCount: 2,
      schoolCount: 2,
      teacherCount: 3
    }
  }
}

export const projectReportMock: ProjectReportData = {
  activityComparison: {
    projectName: 'Digital Skills Development Project',
    totalActivities: 5,
    topActivities: [
      { name: 'React Fundamentals', count: 50, percentage: 25 },
      { name: 'UI/UX Workshop', count: 45, percentage: 22.5 },
      { name: 'Python Basics', count: 40, percentage: 20 },
      { name: 'JavaScript Advanced', count: 35, percentage: 17.5 },
      { name: 'Database Design', count: 30, percentage: 15 }
    ]
  },
  provinceRanking: {
    projectName: 'Digital Skills Development Project',
    topProvinces: [
      { name: 'Bangkok', teacherCount: 60, schoolCount: 8, attendanceRate: 95 },
      { name: 'Chiang Mai', teacherCount: 45, schoolCount: 6, attendanceRate: 92 },
      { name: 'Khon Kaen', teacherCount: 35, schoolCount: 5, attendanceRate: 88 },
      { name: 'Nakhon Ratchasima', teacherCount: 30, schoolCount: 4, attendanceRate: 85 },
      { name: 'Sukhothai', teacherCount: 20, schoolCount: 3, attendanceRate: 82 }
    ],
    comparison: [
      { province: 'Bangkok', change: 10 },
      { province: 'Chiang Mai', change: 5 },
      { province: 'Khon Kaen', change: 3 },
      { province: 'Nakhon Ratchasima', change: 2 },
      { province: 'Sukhothai', change: 8 }
    ]
  },
  topSchoolsByLocation: {
    byProvince: [
      {
        province: 'Bangkok',
        topSchools: [
          { name: 'University Demonstration School', teacherCount: 15 },
          { name: 'Bangkok Technical School', teacherCount: 12 },
          { name: 'Wat Phai Ngoen School', teacherCount: 10 },
          { name: 'Ratchadaphisek School', teacherCount: 8 },
          { name: 'Suwannarangsan School', teacherCount: 7 }
        ]
      },
      {
        province: 'Chiang Mai',
        topSchools: [
          { name: 'Chiang Mai Wittaya', teacherCount: 12 },
          { name: 'Prince Royal School', teacherCount: 10 },
          { name: 'Mongkol Wittaya', teacherCount: 8 },
          { name: 'Doi Saket School', teacherCount: 7 },
          { name: 'Mae Hia School', teacherCount: 6 }
        ]
      },
      {
        province: 'Khon Kaen',
        topSchools: [
          { name: 'Khon Kaen Wittaya', teacherCount: 10 },
          { name: 'Khon Kaen Pattana', teacherCount: 8 },
          { name: 'Khon Kaen University School', teacherCount: 7 },
          { name: 'Ban Phai School', teacherCount: 5 },
          { name: 'Nong Ruea School', teacherCount: 5 }
        ]
      }
    ]
  }
}

export const dailySummaryCards: SummaryCardItem[] = [
  {
    label: 'Total Online Registrations',
    value: '50',
    caption: '+8 vs last event',
    tone: 'success',
    icon: 'tabler-user-plus'
  },
  {
    label: 'Actual Attendance',
    value: '42',
    caption: '84% attendance rate',
    tone: 'info',
    icon: 'tabler-users'
  },
  {
    label: 'Total Schools',
    value: '12',
    caption: 'Avg 4.2 teachers/school',
    tone: 'warning',
    icon: 'tabler-building-community'
  },
  {
    label: 'Onsite Registrations',
    value: '3',
    caption: '6% of attendance',
    tone: 'success',
    icon: 'tabler-login'
  }
]

export const projectSummaryCards: SummaryCardItem[] = [
  {
    label: 'Total Activities',
    value: '5',
    caption: 'Across the project',
    tone: 'info',
    icon: 'tabler-calendar-stats'
  },
  {
    label: 'Top Province',
    value: 'Bangkok',
    caption: '60 teachers registered',
    tone: 'success',
    icon: 'tabler-map-pin'
  },
  {
    label: 'Avg Attendance Rate',
    value: '88%',
    caption: 'Top 5 provinces',
    tone: 'warning',
    icon: 'tabler-chart-bar'
  },
  {
    label: 'Most Popular Activity',
    value: 'React Fundamentals',
    caption: '25% of registrations',
    tone: 'success',
    icon: 'tabler-star'
  }
]
