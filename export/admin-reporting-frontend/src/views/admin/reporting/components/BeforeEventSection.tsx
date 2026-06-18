'use client'

import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import OnlineRegistrationSummary from './OnlineRegistrationSummary'
import ProvinceRegistrationSummary from './ProvinceRegistrationSummary'
import SchoolTeacherSummary from './SchoolTeacherSummary'
import type { DailyEventReportData } from '../types'

type Props = {
  data: DailyEventReportData
}

const BeforeEventSection = ({ data }: Props) => {
  return (
    <Stack spacing={3}>
      <Typography variant='h5'>Before Event</Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <OnlineRegistrationSummary
            date={data.date}
            eventName={data.eventName}
            data={data.onlineRegistrationSummary}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <ProvinceRegistrationSummary data={data.provinceRegistrationSummary} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SchoolTeacherSummary data={data.schoolTeacherSummary} />
        </Grid>
      </Grid>
    </Stack>
  )
}

export default BeforeEventSection
