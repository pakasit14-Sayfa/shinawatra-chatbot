'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import BarList from './Charts'
import type { ProvinceRegistrationSummary } from '../types'

type Props = {
  data: ProvinceRegistrationSummary
}

const ProvinceRegistrationSummaryCard = ({ data }: Props) => {
  const topProvince = data.provinces[0]

  return (
    <Card>
      <CardHeader title='Province Registration Summary' />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={3}>
          {topProvince ? (
            <Stack spacing={0.5}>
              <Typography variant='body2' color='text.secondary'>
                Top Province
              </Typography>
              <Typography variant='h6'>
                {topProvince.name} • {topProvince.count} teachers ({topProvince.percentage}%)
              </Typography>
            </Stack>
          ) : null}
          <BarList
            items={data.provinces.map(item => ({
              label: item.name,
              value: item.count,
              percentage: item.percentage
            }))}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ProvinceRegistrationSummaryCard
