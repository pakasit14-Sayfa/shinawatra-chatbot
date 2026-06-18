'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { RankingTable } from './Tables'
import type { ProvinceRanking } from '../types'

type Props = {
  data: ProvinceRanking
}

const ProvinceRankingCard = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader title='Province Ranking' subheader={data.projectName} />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={3}>
          <RankingTable rows={data.topProvinces} />
          <Divider />
          <Stack spacing={1}>
            <Typography variant='subtitle2'>Compared to Previous Project</Typography>
            {data.comparison.map(item => (
              <Stack key={item.province} direction='row' justifyContent='space-between'>
                <Typography variant='body2'>{item.province}</Typography>
                <Chip
                  size='small'
                  color={item.change >= 0 ? 'success' : 'error'}
                  variant='tonal'
                  label={`${item.change >= 0 ? '+' : ''}${item.change} teachers`}
                />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default ProvinceRankingCard
