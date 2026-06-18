'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import AfterEventSection from './AfterEventSection'
import BeforeEventSection from './BeforeEventSection'
import type { DailyEventReportData, DailyReportSection, ReportSection } from '../types'

type Props = {
  data: DailyEventReportData
  section: ReportSection
}

const DailyEventReport = ({ data, section }: Props) => {
  const activeSection = section as DailyReportSection

  return (
    <Stack spacing={4}>
      <Card>
        <CardHeader title='Daily Event Overview' />
        <CardContent className='flex flex-col gap-3'>
          <Stack spacing={1}>
            <Typography variant='subtitle2' color='text.secondary'>
              Date
            </Typography>
            <Typography variant='h6'>{data.date}</Typography>
            <Divider />
            <Typography variant='subtitle2' color='text.secondary'>
              Event
            </Typography>
            <Typography variant='h6'>{data.eventName}</Typography>
          </Stack>
        </CardContent>
      </Card>
      {(activeSection === 'all' || activeSection === 'before') && <BeforeEventSection data={data} />}
      {(activeSection === 'all' || activeSection === 'after') && <AfterEventSection data={data} />}
    </Stack>
  )
}

export default DailyEventReport
