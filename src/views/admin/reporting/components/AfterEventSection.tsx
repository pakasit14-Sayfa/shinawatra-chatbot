'use client'

import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import ActualAttendanceSummary from './ActualAttendanceSummary'
import BeforeAfterComparison from './BeforeAfterComparison'
import IncreasedProvinces from './IncreasedProvinces'
import type { DailyEventReportData } from '../types'

type Props = {
  data: DailyEventReportData
}

const AfterEventSection = ({ data }: Props) => {
  return (
    <Stack spacing={3}>
      <Typography variant='h5'>After Event</Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ActualAttendanceSummary
            date={data.date}
            eventName={data.eventName}
            data={data.actualAttendanceSummary}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <IncreasedProvinces data={data.increasedProvinces} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <BeforeAfterComparison data={data.beforeAfterComparison} />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default AfterEventSection
