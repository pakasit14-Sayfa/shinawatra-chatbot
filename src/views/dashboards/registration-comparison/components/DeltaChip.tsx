'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'

type DeltaChipProps = {
  value: number | null
  showIcon?: boolean
}

const DeltaChip = ({ value, showIcon = true }: DeltaChipProps) => {
  if (value === null || Number.isNaN(value)) return <Typography sx={{ opacity: 0.3, display: 'inline' }}>—</Typography>

  const isPositive = value >= 0
  const color = isPositive ? '#10b981' : '#f43f5e'
  const bgColor = alpha(color, 0.1)

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: '50px',
        backgroundColor: bgColor,
        color: color,
        fontWeight: 700,
        fontSize: '0.8125rem',
        border: `1px solid ${alpha(color, 0.2)}`
      }}
    >
      {showIcon && (isPositive ? '↑' : '↓')} {Math.abs(value).toFixed(1)}%
    </Box>
  )
}

export default DeltaChip
