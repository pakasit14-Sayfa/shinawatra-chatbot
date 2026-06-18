'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { ComparisonTable } from './Tables'
import type { BeforeAfterComparison } from '../types'

type Props = {
  data: BeforeAfterComparison
}

const BeforeAfterComparisonCard = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader title='Before vs After Comparison' />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={4}>
          <Stack spacing={2}>
            <Typography variant='subtitle2'>Province Comparison</Typography>
            <ComparisonTable rows={data.provinces} />
          </Stack>
          <Stack spacing={2}>
            <Typography variant='subtitle2'>School Comparison</Typography>
            <ComparisonTable rows={data.schools} />
          </Stack>
          <Stack spacing={1}>
            <Typography variant='subtitle2'>Teacher Summary</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' color='text.secondary'>
                    Registered
                  </Typography>
                  <Typography variant='h6'>{data.teachers.registered}</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' color='text.secondary'>
                    Attended
                  </Typography>
                  <Typography variant='h6'>{data.teachers.attended}</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' color='text.secondary'>
                    Absent
                  </Typography>
                  <Typography variant='h6'>{data.teachers.absent}</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Stack spacing={0.5}>
                  <Typography variant='body2' color='text.secondary'>
                    Onsite
                  </Typography>
                  <Typography variant='h6'>{data.teachers.onsite}</Typography>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default BeforeAfterComparisonCard
