'use client'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { TopSchoolsByLocation } from '../types'

type Props = {
  data: TopSchoolsByLocation
}

const TopSchoolsByLocationCard = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader title='Top Schools by Location' />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={2}>
          {data.byProvince.map(province => (
            <Accordion key={province.province} defaultExpanded={province.province === data.byProvince[0]?.province}>
              <AccordionSummary expandIcon={<i className='tabler-chevron-down' />}>
                <Typography variant='subtitle2'>{province.province}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  {province.topSchools.map(school => (
                    <Stack key={school.name} direction='row' justifyContent='space-between'>
                      <Typography variant='body2'>{school.name}</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {school.teacherCount} teachers
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </AccordionDetails>
              <Divider />
            </Accordion>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default TopSchoolsByLocationCard
