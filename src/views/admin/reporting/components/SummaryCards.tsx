'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import CustomAvatar from '@core/components/mui/Avatar'

import type { SummaryCardItem } from '../types'

type Props = {
  items: SummaryCardItem[]
}

const toneToColor = (tone?: SummaryCardItem['tone']) => {
  if (!tone) return 'text.primary'

  switch (tone) {
    case 'success':
      return 'success.main'
    case 'warning':
      return 'warning.main'
    case 'error':
      return 'error.main'
    case 'info':
    default:
      return 'info.main'
  }
}

const SummaryCards = ({ items }: Props) => {
  return (
    <Grid container spacing={4}>
      {items.map(item => (
        <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card>
            <CardContent className='flex items-start justify-between gap-4'>
              <div className='flex items-start justify-between gap-4 is-full'>
                <Stack spacing={1}>
                  <Typography variant='body2' color='text.secondary'>
                    {item.label}
                  </Typography>
                  <Typography variant='h4' color={toneToColor(item.tone)}>
                    {item.value}
                  </Typography>
                  {item.caption ? (
                    <Typography variant='body2' color='text.disabled'>
                      {item.caption}
                    </Typography>
                  ) : null}
                </Stack>
                <CustomAvatar variant='rounded' skin='light' color={item.tone ?? 'primary'} size={40}>
                  <i className={item.icon ?? 'tabler-chart-bar'} />
                </CustomAvatar>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default SummaryCards
