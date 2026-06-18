'use client'

// ========================================
// 🚀 PORTABLE YEARLY COMPARISON DASHBOARD
// ========================================
// This component is 100% self-contained and portable.
// Copy this entire file to any Next.js + MUI + ApexCharts project.
//
// Required dependencies:
// - @mui/material
// - apexcharts
// - react-apexcharts
// - next (for dynamic import)

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import dynamic from 'next/dynamic'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Dynamic import for ApexCharts (works in any Next.js project)
const ReactApexcharts = dynamic(() => import('react-apexcharts'), { ssr: false })

// ========================================
// 📊 TYPE DEFINITIONS
// ========================================
type YearKey = '2022' | '2023' | '2024'
type ProjectKey = 'all' | 'digital' | 'stem'

type ProvinceStat = {
  name: string
  value: number
}

type YearSnapshot = {
  total: number
  projects: number
  events: number
  attendance: number
  monthly: number[]
  provinces: ProvinceStat[]
}

type Dataset = Record<ProjectKey, Record<YearKey, YearSnapshot>>

// ========================================
// 💾 MOCK DATA (Self-contained)
// ========================================
const datasets: Dataset = {
  all: {
    2022: {
      total: 1235,
      projects: 12,
      events: 68,
      attendance: 72,
      monthly: [95, 92, 98, 85, 90, 100, 110, 120, 124, 132, 138, 151],
      provinces: [
        { name: 'กรุงเทพฯ', value: 210 },
        { name: 'เชียงใหม่', value: 150 },
        { name: 'ขอนแก่น', value: 120 },
        { name: 'ภูเก็ต', value: 90 },
        { name: 'นครปฐม', value: 80 }
      ]
    },
    2023: {
      total: 2456,
      projects: 18,
      events: 85,
      attendance: 78,
      monthly: [150, 165, 170, 185, 195, 200, 205, 215, 230, 240, 265, 321],
      provinces: [
        { name: 'กรุงเทพฯ', value: 320 },
        { name: 'เชียงใหม่', value: 210 },
        { name: 'ขอนแก่น', value: 165 },
        { name: 'ภูเก็ต', value: 140 },
        { name: 'นครปฐม', value: 130 }
      ]
    },
    2024: {
      total: 3789,
      projects: 25,
      events: 120,
      attendance: 85,
      monthly: [280, 295, 310, 325, 320, 315, 320, 340, 360, 382, 401, 441],
      provinces: [
        { name: 'กรุงเทพฯ', value: 450 },
        { name: 'เชียงใหม่', value: 280 },
        { name: 'ขอนแก่น', value: 210 },
        { name: 'ภูเก็ต', value: 190 },
        { name: 'นครปฐม', value: 170 }
      ]
    }
  },
  digital: {
    2022: {
      total: 950,
      projects: 8,
      events: 40,
      attendance: 80,
      monthly: [60, 65, 70, 72, 76, 80, 82, 85, 90, 95, 105, 120],
      provinces: [
        { name: 'กรุงเทพฯ', value: 170 },
        { name: 'เชียงใหม่', value: 120 },
        { name: 'ภูเก็ต', value: 90 },
        { name: 'ขอนแก่น', value: 70 },
        { name: 'ชลบุรี', value: 60 }
      ]
    },
    2023: {
      total: 1500,
      projects: 12,
      events: 55,
      attendance: 84,
      monthly: [105, 110, 120, 130, 135, 140, 150, 160, 165, 170, 185, 230],
      provinces: [
        { name: 'กรุงเทพฯ', value: 240 },
        { name: 'เชียงใหม่', value: 165 },
        { name: 'ภูเก็ต', value: 120 },
        { name: 'ขอนแก่น', value: 110 },
        { name: 'ชลบุรี', value: 95 }
      ]
    },
    2024: {
      total: 2100,
      projects: 15,
      events: 72,
      attendance: 88,
      monthly: [150, 165, 175, 185, 190, 195, 205, 215, 225, 240, 250, 305],
      provinces: [
        { name: 'กรุงเทพฯ', value: 310 },
        { name: 'เชียงใหม่', value: 200 },
        { name: 'ภูเก็ต', value: 150 },
        { name: 'ขอนแก่น', value: 135 },
        { name: 'ชลบุรี', value: 120 }
      ]
    }
  },
  stem: {
    2022: {
      total: 780,
      projects: 6,
      events: 32,
      attendance: 75,
      monthly: [55, 58, 60, 62, 64, 68, 70, 72, 74, 76, 80, 81],
      provinces: [
        { name: 'กรุงเทพฯ', value: 140 },
        { name: 'เชียงใหม่', value: 110 },
        { name: 'ขอนแก่น', value: 90 },
        { name: 'พิษณุโลก', value: 70 },
        { name: 'สุราษฎร์ธานี', value: 60 }
      ]
    },
    2023: {
      total: 1280,
      projects: 10,
      events: 50,
      attendance: 82,
      monthly: [90, 92, 96, 100, 105, 108, 112, 118, 124, 130, 142, 163],
      provinces: [
        { name: 'กรุงเทพฯ', value: 200 },
        { name: 'เชียงใหม่', value: 150 },
        { name: 'ขอนแก่น', value: 120 },
        { name: 'พิษณุโลก', value: 95 },
        { name: 'สุราษฎร์ธานี', value: 88 }
      ]
    },
    2024: {
      total: 1705,
      projects: 14,
      events: 68,
      attendance: 87,
      monthly: [120, 125, 130, 136, 140, 143, 145, 150, 160, 170, 184, 202],
      provinces: [
        { name: 'กรุงเทพฯ', value: 250 },
        { name: 'เชียงใหม่', value: 190 },
        { name: 'ขอนแก่น', value: 150 },
        { name: 'พิษณุโลก', value: 120 },
        { name: 'สุราษฎร์ธานี', value: 100 }
      ]
    }
  }
}

const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

const yearOptions: YearKey[] = ['2024', '2023', '2022']

const projectOptions: { label: string; value: ProjectKey }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'โครงการแนะแนวดิจิทัล', value: 'digital' },
  { label: 'ค่าย STEM', value: 'stem' }
]

// ========================================
// 🛠️ UTILITY FUNCTIONS
// ========================================
const formatNumber = (value: number) => new Intl.NumberFormat('th-TH').format(value)

const calcYoY = (year: YearKey, project: ProjectKey) => {
  const current = datasets[project][year]
  const previous = datasets[project][String(Number(year) - 1) as YearKey]

  if (!current || !previous) return null

  return ((current.total - previous.total) / previous.total) * 100
}

const deltaPercent = (a: number, b: number) => {
  if (b === 0) return null

  return ((a - b) / b) * 100
}

// ========================================
// 🎨 PREMIUM DESIGN SYSTEM (Self-contained)
// ========================================
const REG_DESIGN = {
  colors: {
    year1: {
      primary: '#6366f1', // Indigo
      secondary: '#8b5cf6', // Violet
      glow: 'rgba(99, 102, 241, 0.15)'
    },
    year2: {
      primary: '#10b981', // Emerald
      secondary: '#34d399', // Teal
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    success: '#10b981',
    error: '#f43f5e',
    glass: {
      light: 'rgba(255, 255, 255, 0.6)',
      dark: 'rgba(15, 23, 42, 0.4)',
      border: 'rgba(255, 255, 255, 0.1)'
    }
  },
  glass: (theme: any, color: string = '#6366f1') => ({
    backdropFilter: 'blur(20px)',
    backgroundColor: theme.palette.mode === 'dark' ? REG_DESIGN.colors.glass.dark : REG_DESIGN.colors.glass.light,
    border: `1px solid ${alpha(color, 0.1)}`,
    boxShadow: `0 8px 32px 0 ${alpha(color, 0.08)}`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: `0 12px 48px 0 ${alpha(color, 0.15)}`,
      border: `1px solid ${alpha(color, 0.2)}`
    }
  }),
  cardGradient: (color1: string, color2: string) =>
    `linear-gradient(135deg, ${alpha(color1, 0.05)}, ${alpha(color2, 0.02)})`,
  badgeGradient: (color: string) => `linear-gradient(45deg, ${alpha(color, 0.2)}, ${alpha(color, 0.1)})`
}

// ========================================
// 🧩 SUB-COMPONENTS
// ========================================

const YearSummaryCard = ({ year, project, isPrimary }: { year: YearKey; project: ProjectKey; isPrimary?: boolean }) => {
  const theme = useTheme()
  const snapshot = datasets[project][year]
  const yoy = calcYoY(year, project)

  const config = isPrimary ? REG_DESIGN.colors.year1 : REG_DESIGN.colors.year2

  return (
    <Card sx={REG_DESIGN.glass(theme, config.primary)}>
      <CardContent>
        <Stack direction='row' alignItems='flex-start' justifyContent='space-between' gap={2}>
          <div>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}
            >
              ปี {year}
            </Typography>
            <Typography variant='h3' sx={{ my: 2, display: 'flex', alignItems: 'center', gap: 2, fontWeight: 800 }}>
              {formatNumber(snapshot.total)} <span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.6 }}>คน</span>
            </Typography>
            <Typography variant='body1' sx={{ opacity: 0.8, fontWeight: 500 }}>
              ผู้ลงทะเบียนรวม
            </Typography>
          </div>
          <Stack spacing={2} alignItems='flex-end'>
            {yoy !== null ? (
              <Chip
                size='small'
                sx={{
                  fontWeight: 700,
                  background: REG_DESIGN.badgeGradient(yoy >= 0 ? REG_DESIGN.colors.success : REG_DESIGN.colors.error),
                  border: `1px solid ${alpha(yoy >= 0 ? REG_DESIGN.colors.success : REG_DESIGN.colors.error, 0.3)}`,
                  color: yoy >= 0 ? REG_DESIGN.colors.success : REG_DESIGN.colors.error
                }}
                label={`${yoy >= 0 ? '↑' : '↓'} ${Math.abs(yoy).toFixed(1)}%`}
              />
            ) : null}
            <Avatar
              variant='rounded'
              sx={{
                width: 50,
                height: 50,
                background: `linear-gradient(135deg, ${config.primary}, ${config.secondary})`,
                color: '#fff',
                boxShadow: `0 4px 12px ${alpha(config.primary, 0.4)}`
              }}
            >
              <i className='tabler-users' style={{ fontSize: '1.5rem' }} />
            </Avatar>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3, opacity: 0.1 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography
              variant='subtitle2'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, opacity: 0.7 }}
            >
              <i className='tabler-target' style={{ fontSize: '1rem', color: config.primary }} /> โครงการ
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              {snapshot.projects}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.6 }}>
              โครงการที่เปิด
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant='subtitle2'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, opacity: 0.7 }}
            >
              <i className='tabler-calendar-event' style={{ fontSize: '1rem', color: config.primary }} /> กิจกรรม
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 700 }}>
              {snapshot.events}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.6 }}>
              กิจกรรมย่อย
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography
              variant='subtitle2'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, opacity: 0.7 }}
            >
              <i className='tabler-check' style={{ fontSize: '1rem', color: config.primary }} /> Attendance
            </Typography>
            <Typography variant='h5' sx={{ fontWeight: 700, mb: 1.5 }}>
              {snapshot.attendance}%
            </Typography>
            <LinearProgress
              variant='determinate'
              value={snapshot.attendance}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(config.primary, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${config.primary}, ${config.secondary})`
                }
              }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}

const DeltaChip = ({ value, showIcon = true }: { value: number | null; showIcon?: boolean }) => {
  if (value === null || Number.isNaN(value)) return <Typography sx={{ opacity: 0.3 }}>—</Typography>

  const isPositive = value >= 0
  const color = isPositive ? REG_DESIGN.colors.success : REG_DESIGN.colors.error
  const bgColor = alpha(color, 0.1)

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: '50px',
        backgroundColor: bgColor,
        color: color,
        fontWeight: 700,
        fontSize: '0.8125rem',
        border: `1px solid ${alpha(color, 0.2)}`
      }}
    >
      {showIcon && (isPositive ? '↑' : '↓')} {Math.abs(value).toFixed(1)}%
    </Box>
  )
}

// ========================================
// 🎯 MAIN COMPONENT
// ========================================
const RegistrationComparisonPortable = () => {
  // Hooks
  const theme = useTheme()

  // State
  const [year1, setYear1] = useState<YearKey>('2024')
  const [year2, setYear2] = useState<YearKey>('2023')
  const [project, setProject] = useState<ProjectKey>('all')

  const snapshot1 = datasets[project][year1]
  const snapshot2 = datasets[project][year2]

  const monthlySeries = useMemo(
    () => [
      { name: `ปี ${year1}`, data: snapshot1.monthly },
      { name: `ปี ${year2}`, data: snapshot2.monthly }
    ],
    [year1, year2, snapshot1.monthly, snapshot2.monthly]
  )

  const provinceSeries = useMemo(() => {
    const provinceNames = Array.from(
      new Set([...snapshot1.provinces, ...snapshot2.provinces].map(province => province.name))
    )

    const rows = provinceNames
      .map(name => {
        const year1Val = snapshot1.provinces.find(p => p.name === name)?.value ?? 0
        const year2Val = snapshot2.provinces.find(p => p.name === name)?.value ?? 0

        return { name, year1Val, year2Val, max: Math.max(year1Val, year2Val) }
      })
      .sort((a, b) => b.max - a.max)
      .slice(0, 5)

    return {
      categories: rows.map(row => row.name),
      series: [
        { name: `ปี ${year1}`, data: rows.map(row => row.year1Val) },
        { name: `ปี ${year2}`, data: rows.map(row => row.year2Val) }
      ]
    }
  }, [snapshot1.provinces, snapshot2.provinces, year1, year2])

  const monthlyOptions: ApexOptions = useMemo(() => {
    return {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false },
        dropShadow: { enabled: true, top: 3, blur: 4, opacity: 0.1 }
      },
      stroke: { curve: 'smooth', width: 4 },
      markers: {
        size: 5,
        strokeWidth: 3,
        hover: { size: 7 },
        colors: ['#fff', '#fff'], // ระบุให้ครบ 2 series
        strokeColors: [REG_DESIGN.colors.year1.primary, REG_DESIGN.colors.year2.primary]
      },
      colors: [REG_DESIGN.colors.year1.primary, REG_DESIGN.colors.year2.primary],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        strokeDashArray: 5,
        padding: { left: 15, right: 15 }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: months,
        labels: {
          offsetY: 5,
          style: {
            fontSize: '0.85rem',
            fontWeight: 500,
            colors: theme.palette.text.disabled || '#999'
          }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          formatter: value => formatNumber(value),
          style: { colors: theme.palette.text.disabled || '#999', fontWeight: 500 }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontSize: '14px',
        fontWeight: 600,
        markers: { radius: 12, size: 8 }
      }
    }
  }, [theme])

  const provinceOptions: ApexOptions = useMemo(() => {
    return {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '60%',
          borderRadius: 8,
          borderRadiusApplication: 'end'
        }
      },
      grid: {
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        strokeDashArray: 7,
        padding: { left: 12, right: 12 }
      },
      colors: [REG_DESIGN.colors.year1.primary, REG_DESIGN.colors.year2.primary],
      dataLabels: {
        enabled: true,
        formatter: val => `${val}`,
        style: { fontSize: '11px', fontWeight: 700, colors: ['#fff', '#fff'] }
      },
      xaxis: {
        categories: provinceSeries.categories,
        labels: { style: { colors: theme.palette.text.disabled || '#999', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { fontWeight: 600, fontSize: '0.9rem', colors: theme.palette.text.primary || '#fff' } }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '13px',
        fontWeight: 500,
        markers: { radius: 12 }
      }
    }
  }, [provinceSeries.categories, theme])

  const comparisonRows = [
    {
      label: 'ผู้ลงทะเบียน',
      value1: snapshot1.total,
      value2: snapshot2.total,
      formatter: (value: number) => formatNumber(value)
    },
    {
      label: 'อัตราเข้าร่วม',
      value1: snapshot1.attendance,
      value2: snapshot2.attendance,
      formatter: (value: number) => `${value}%`
    },
    { label: 'โครงการ', value1: snapshot1.projects, value2: snapshot2.projects, formatter: (value: number) => value },
    { label: 'กิจกรรม', value1: snapshot1.events, value2: snapshot2.events, formatter: (value: number) => value }
  ]

  const totalDelta = deltaPercent(snapshot1.total, snapshot2.total)

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card
          sx={{
            ...REG_DESIGN.glass(theme, '#ccc'),
            transform: 'none !important',
            '&:hover': { transform: 'none !important' }
          }}
        >
          <CardHeader
            title='📊 เปรียบเทียบข้อมูลการลงทะเบียนรายปี'
            subheader='มองภาพรวม 2 ปีพร้อมกัน ปรับเลือกปีและโครงการได้'
            action={
              <Stack
                direction='row'
                spacing={2}
                alignItems='center'
                sx={{
                  background: alpha(theme.palette.background.paper, 0.4),
                  backdropFilter: 'blur(10px)',
                  p: 1.5,
                  borderRadius: '16px',
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Select
                  size='small'
                  variant='standard'
                  disableUnderline
                  value={year1}
                  onChange={event => setYear1(event.target.value as YearKey)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: REG_DESIGN.colors.year1.primary,
                    '& .MuiSelect-select': { py: 0.5, px: 2 }
                  }}
                >
                  {yearOptions.map(option => (
                    <MenuItem key={option} value={option} disabled={option === year2}>
                      ปี {option}
                    </MenuItem>
                  ))}
                </Select>

                <IconButton
                  size='small'
                  onClick={() => {
                    setYear1(year2)
                    setYear2(year1)
                  }}
                  sx={{
                    backgroundColor: alpha(REG_DESIGN.colors.year1.primary, 0.1),
                    color: REG_DESIGN.colors.year1.primary,
                    '&:hover': { backgroundColor: REG_DESIGN.colors.year1.primary, color: '#fff' }
                  }}
                >
                  <i className='tabler-arrows-left-right' style={{ fontSize: '1rem' }} />
                </IconButton>

                <Select
                  size='small'
                  variant='standard'
                  disableUnderline
                  value={year2}
                  onChange={event => setYear2(event.target.value as YearKey)}
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: REG_DESIGN.colors.year2.primary,
                    '& .MuiSelect-select': { py: 0.5, px: 2 }
                  }}
                >
                  {yearOptions.map(option => (
                    <MenuItem key={option} value={option} disabled={option === year1}>
                      ปี {option}
                    </MenuItem>
                  ))}
                </Select>

                <Divider orientation='vertical' flexItem sx={{ mx: 1, opacity: 0.2 }} />

                <Select
                  size='small'
                  variant='standard'
                  disableUnderline
                  value={project}
                  onChange={event => setProject(event.target.value as ProjectKey)}
                  sx={{
                    fontWeight: 600,
                    '& .MuiSelect-select': { py: 0.5, px: 2, pr: '32px !important' }
                  }}
                >
                  {projectOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            }
          />
          <CardContent>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent='space-between'
            >
              <Stack spacing={0.5}>
                <Typography color='text.secondary'>รวมผู้ลงทะเบียน (ปี {year1})</Typography>
                <Typography variant='h5' sx={{ fontWeight: 700 }}>
                  {formatNumber(snapshot1.total)} คน
                </Typography>
              </Stack>
              <Divider flexItem orientation='vertical' sx={{ display: { xs: 'none', md: 'block' } }} />
              <Stack spacing={0.5}>
                <Typography color='text.secondary'>เทียบกับปี {year2}</Typography>
                <Stack direction='row' alignItems='center' spacing={1}>
                  <Typography variant='h5' sx={{ fontWeight: 700 }}>
                    {formatNumber(snapshot2.total)} คน
                  </Typography>
                  <DeltaChip value={totalDelta} />
                </Stack>
              </Stack>
              <Divider flexItem orientation='vertical' sx={{ display: { xs: 'none', md: 'block' } }} />
              <Stack direction='row' spacing={1} alignItems='center'>
                <Avatar
                  variant='rounded'
                  sx={{
                    backgroundColor: alpha(REG_DESIGN.colors.year1.primary, 0.1),
                    color: REG_DESIGN.colors.year1.primary
                  }}
                >
                  <i className='tabler-filter' style={{ fontSize: '1.2rem' }} />
                </Avatar>
                <div>
                  <Typography variant='body2' color='text.secondary'>
                    โครงการที่เลือก
                  </Typography>
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    {projectOptions.find(option => option.value === project)?.label}
                  </Typography>
                </div>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <YearSummaryCard year={year1} project={project} isPrimary />
      </Grid>
      <Grid item xs={12} md={6}>
        <YearSummaryCard year={year2} project={project} />
      </Grid>

      <Grid item xs={12} lg={8}>
        <Card sx={REG_DESIGN.glass(theme, REG_DESIGN.colors.year1.primary)}>
          <CardHeader
            title='กราฟเปรียบเทียบรายเดือน'
            subheader='Trend analysis: Area chart showing registration volume'
          />
          <CardContent>
            <ReactApexcharts type='area' height={380} series={monthlySeries} options={monthlyOptions} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card sx={REG_DESIGN.glass(theme, REG_DESIGN.colors.year2.primary)}>
          <CardHeader title='Top 5 จังหวัด' subheader='Geographic distribution comparison' />
          <CardContent>
            <ReactApexcharts type='bar' height={380} series={provinceSeries.series} options={provinceOptions} />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card
          sx={{
            ...REG_DESIGN.glass(theme, '#ccc'),
            overflow: 'hidden',
            transform: 'none !important',
            '&:hover': { transform: 'none !important' }
          }}
        >
          <CardHeader
            title='📋 ตารางเปรียบเทียบรายละเอียด'
            subheader='Deep dive into key metrics and percentage deltas'
          />
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Table>
              <TableHead sx={{ backgroundColor: alpha(REG_DESIGN.colors.year1.primary, 0.03) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1rem', pl: 6 }}>หมวดหมู่</TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    ปี {year1}
                  </TableCell>
                  <TableCell align='right' sx={{ fontWeight: 700, fontSize: '1rem' }}>
                    ปี {year2}
                  </TableCell>
                  <TableCell align='center' sx={{ fontWeight: 700, fontSize: '1rem', pr: 6 }}>
                    แนวโน้ม (+/- %)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonRows.map(row => {
                  const percent = deltaPercent(row.value1, row.value2)

                  return (
                    <TableRow key={row.label} sx={{ '&:last-child td': { border: 0 } }} hover>
                      <TableCell sx={{ pl: 6 }}>
                        <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{row.label}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography sx={{ fontWeight: 700 }}>{row.formatter(row.value1)}</Typography>
                      </TableCell>
                      <TableCell align='right'>
                        <Typography sx={{ fontWeight: 500, opacity: 0.7 }}>{row.formatter(row.value2)}</Typography>
                      </TableCell>
                      <TableCell align='center' sx={{ pr: 6 }}>
                        <DeltaChip value={percent} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default RegistrationComparisonPortable
