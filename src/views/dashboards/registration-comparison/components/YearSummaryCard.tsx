'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import { alpha, useTheme } from '@mui/material/styles'

// Import DeltaChip (Local)
// Note: In destination project, adjust this path
import DeltaChip from './DeltaChip'

// 🎨 DESIGN CONSTANTS
const REG_DESIGN = {
  colors: {
    year1: { primary: '#6366f1', secondary: '#8b5cf6' },
    year2: { primary: '#10b981', secondary: '#34d399' },
    success: '#10b981',
    error: '#f43f5e',
    glass: { light: 'rgba(255, 255, 255, 0.6)', dark: 'rgba(15, 23, 42, 0.4)' }
  }
}

type YearSummaryCardProps = {
  year: string
  snapshot: {
    total: number
    projects: number
    events: number
    attendance: number
  }
  yoy: number | null
  isPrimary?: boolean
}

const YearSummaryCard = ({ year, snapshot, yoy, isPrimary }: YearSummaryCardProps) => {
  const theme = useTheme()
  const config = isPrimary ? REG_DESIGN.colors.year1 : REG_DESIGN.colors.year2
  const formatNumber = (val: number) => new Intl.NumberFormat('th-TH').format(val)

  const glassStyle = {
    backdropFilter: 'blur(20px)',
    backgroundColor: theme.palette.mode === 'dark' ? REG_DESIGN.colors.glass.dark : REG_DESIGN.colors.glass.light,
    border: `1px solid ${alpha(config.primary, 0.1)}`,
    boxShadow: `0 8px 32px 0 ${alpha(config.primary, 0.08)}`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: `0 12px 48px 0 ${alpha(config.primary, 0.15)}`,
      border: `1px solid ${alpha(config.primary, 0.2)}`
    }
  }

  return (
    <Card sx={glassStyle}>
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
              {' '}
              ผู้ลงทะเบียนรวม{' '}
            </Typography>
          </div>
          <Stack spacing={2} alignItems='flex-end'>
            {yoy !== null && <DeltaChip value={yoy} />}
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
              {' '}
              {snapshot.projects}{' '}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.6 }}>
              {' '}
              โครงการที่เปิด{' '}
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
              {' '}
              {snapshot.events}{' '}
            </Typography>
            <Typography variant='caption' sx={{ opacity: 0.6 }}>
              {' '}
              กิจกรรมย่อย{' '}
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
              {' '}
              {snapshot.attendance}%{' '}
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

export default YearSummaryCard
