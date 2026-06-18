'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { OnlineRegistrationSummary } from '../types'

type Props = {
  date: string
  eventName: string
  data: OnlineRegistrationSummary
}

const OnlineRegistrationSummaryCard = ({ date, eventName, data }: Props) => {
  const diffPrev = data.totalOnlineRegistrations - data.previousEventCount
  const diffAvg = data.totalOnlineRegistrations - data.projectAverage

  return (
    <Card>
      <CardHeader title='Online Registration Summary' subheader={`${date} • ${eventName}`} />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={2}>
          <Stack direction='row' justifyContent='space-between'>
            <Typography variant='body2' color='text.secondary'>
              Total Online Registrations
            </Typography>
            <Typography variant='h6'>{data.totalOnlineRegistrations}</Typography>
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body2'>Advance Registration</Typography>
              <Typography variant='body2' color='text.secondary'>
                {data.advanceRegistrations}
              </Typography>
            </Stack>
            <Stack direction='row' justifyContent='space-between'>
              <Typography variant='body2'>Same-day Registration</Typography>
              <Typography variant='body2' color='text.secondary'>
                {data.sameDayRegistrations}
              </Typography>
            </Stack>
          </Stack>
          <Divider />
          <Stack spacing={1.5}>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='body2' color='text.secondary'>
                Previous Event
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Typography variant='body2'>{data.previousEventCount}</Typography>
                <Chip
                  size='small'
                  color={diffPrev >= 0 ? 'success' : 'error'}
                  variant='tonal'
                  label={`${diffPrev >= 0 ? '+' : ''}${diffPrev}`}
                />
              </Stack>
            </Stack>
            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography variant='body2' color='text.secondary'>
                Project Average
              </Typography>
              <Stack direction='row' spacing={1} alignItems='center'>
                <Typography variant='body2'>{data.projectAverage}</Typography>
                <Chip
                  size='small'
                  color={diffAvg >= 0 ? 'success' : 'error'}
                  variant='tonal'
                  label={`${diffAvg >= 0 ? '+' : ''}${diffAvg}`}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default OnlineRegistrationSummaryCard
