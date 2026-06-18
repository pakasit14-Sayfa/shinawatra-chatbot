'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { IncreasedProvinces } from '../types'

type Props = {
  data: IncreasedProvinces
}

const IncreasedProvincesCard = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader title='Increased Provinces' />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant='subtitle2'>Province Growth</Typography>
            {data.provinces.map(item => (
              <Stack key={item.name} direction='row' justifyContent='space-between'>
                <Typography variant='body2'>{item.name}</Typography>
                <Chip
                  size='small'
                  color='success'
                  variant='tonal'
                  label={`+${item.increase} (from ${item.from} to ${item.to})`}
                />
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack spacing={1}>
            <Typography variant='subtitle2'>New Schools</Typography>
            {data.schools.map(item => (
              <Stack key={item.name} direction='row' justifyContent='space-between'>
                <Typography variant='body2'>{item.name}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.teacherCount} teachers
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Chip label={`${data.summary.provinceCount} provinces`} color='primary' variant='outlined' />
            <Chip label={`${data.summary.schoolCount} schools`} color='primary' variant='outlined' />
            <Chip label={`${data.summary.teacherCount} teachers`} color='primary' variant='outlined' />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default IncreasedProvincesCard
