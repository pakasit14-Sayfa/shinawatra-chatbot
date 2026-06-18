'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import BarList from './Charts'
import type { ActivityComparison } from '../types'

type Props = {
  data: ActivityComparison
}

const ActivityComparisonCard = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader title='Activity Comparison' />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant='body2' color='text.secondary'>
              Project
            </Typography>
            <Typography variant='h6'>{data.projectName}</Typography>
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            Total Activities: {data.totalActivities}
          </Typography>
          <BarList
            items={data.topActivities.map(activity => ({
              label: activity.name,
              value: activity.count,
              percentage: activity.percentage
            }))}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ActivityComparisonCard
