'use client'

import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { BarItem } from '../types'

type BarListProps = {
  items: BarItem[]
  caption?: string
  showPercentage?: boolean
}

const BarList = ({ items, caption, showPercentage = true }: BarListProps) => {
  const maxValue = Math.max(...items.map(item => item.value), 1)

  return (
    <Stack spacing={2}>
      {caption ? (
        <Typography variant='body2' color='text.secondary'>
          {caption}
        </Typography>
      ) : null}
      {items.map(item => {
        const progressValue = item.percentage ?? Math.round((item.value / maxValue) * 100)

        return (
          <Stack key={item.label} spacing={1}>
            <Box display='flex' alignItems='center' justifyContent='space-between'>
              <Typography variant='body2'>{item.label}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {item.value}
                {showPercentage && item.percentage !== undefined ? ` (${item.percentage}%)` : ''}
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={progressValue}
              sx={{ height: 8, borderRadius: 4, backgroundColor: 'action.hover' }}
            />
          </Stack>
        )
      })}
    </Stack>
  )
}

export default BarList
