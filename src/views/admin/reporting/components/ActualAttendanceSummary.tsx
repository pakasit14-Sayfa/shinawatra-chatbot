'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { ActualAttendanceSummary } from '../types'

type Props = {
  date: string
  eventName: string
  data: ActualAttendanceSummary
}

const ActualAttendanceSummaryCard = ({ date, eventName, data }: Props) => {
  const attendanceDiff = data.attendanceRate - data.previousEventRate

  return (
    <Card>
      <CardHeader title='Actual Attendance Summary' subheader={`${date} • ${eventName}`} />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            <Typography variant='body2' color='text.secondary'>
              Total Online Registrations
            </Typography>
            <Typography variant='h6'>{data.totalOnlineRegistrations}</Typography>
            <LinearProgress
              variant='determinate'
              value={data.attendanceRate}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Box display='flex' justifyContent='space-between'>
              <Typography variant='body2'>Attendance Rate</Typography>
              <Typography variant='body2' color={attendanceDiff >= 0 ? 'success.main' : 'error.main'}>
                {data.attendanceRate}% ({attendanceDiff >= 0 ? '+' : ''}{attendanceDiff} vs prev)
              </Typography>
            </Box>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body2'>Attended</Typography>
              <Typography variant='body2' color='text.secondary'>
                {data.actualAttendance}
              </Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body2'>Absent</Typography>
              <Typography variant='body2' color='text.secondary'>
                {data.absent}
              </Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body2'>Onsite Registrations</Typography>
              <Typography variant='body2' color='text.secondary'>
                {data.onsiteRegistrations}
              </Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body2'>Total Participants</Typography>
              <Typography variant='body2' color='text.secondary'>
                {data.totalParticipants}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ActualAttendanceSummaryCard
