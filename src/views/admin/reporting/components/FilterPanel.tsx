'use client'

import { useState, type ChangeEvent } from 'react'

import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'

import CustomTextField from '@core/components/mui/TextField'

const FilterPanel = () => {
  const [filters, setFilters] = useState({
    dateFrom: '2026-01-15',
    dateTo: '2026-01-15',
    event: 'react-fundamentals',
    project: 'digital-skills',
    province: 'all',
    status: 'all',
    query: ''
  })

  const handleChange = (key: keyof typeof filters) => (event: ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [key]: event.target.value }))
  }

  const handleReset = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      event: 'all',
      project: 'all',
      province: 'all',
      status: 'all',
      query: ''
    })
  }

  return (
    <Card>
      <CardHeader title='Filters' />
      <CardContent className='pt-0'>
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                label='From'
                type='date'
                fullWidth
                value={filters.dateFrom}
                onChange={handleChange('dateFrom')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                label='To'
                type='date'
                fullWidth
                value={filters.dateTo}
                onChange={handleChange('dateTo')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                select
                label='Event'
                fullWidth
                value={filters.event}
                onChange={handleChange('event')}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value='all'>All events</MenuItem>
                <MenuItem value='react-fundamentals'>React Fundamentals Training</MenuItem>
                <MenuItem value='uiux'>UI/UX Workshop</MenuItem>
                <MenuItem value='python-basics'>Python Basics</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                select
                label='Project'
                fullWidth
                value={filters.project}
                onChange={handleChange('project')}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value='all'>All projects</MenuItem>
                <MenuItem value='digital-skills'>Digital Skills Development</MenuItem>
                <MenuItem value='teacher-innovation'>Teacher Innovation</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                select
                label='Province'
                fullWidth
                value={filters.province}
                onChange={handleChange('province')}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value='all'>All provinces</MenuItem>
                <MenuItem value='bangkok'>Bangkok</MenuItem>
                <MenuItem value='chiang-mai'>Chiang Mai</MenuItem>
                <MenuItem value='khon-kaen'>Khon Kaen</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <CustomTextField
                select
                label='Status'
                fullWidth
                value={filters.status}
                onChange={handleChange('status')}
                slotProps={{ select: { displayEmpty: true } }}
              >
                <MenuItem value='all'>All statuses</MenuItem>
                <MenuItem value='scheduled'>Scheduled</MenuItem>
                <MenuItem value='completed'>Completed</MenuItem>
                <MenuItem value='cancelled'>Cancelled</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 12, md: 6 }}>
              <CustomTextField
                label='Search'
                fullWidth
                placeholder='Search by activity, province, or school'
                value={filters.query}
                onChange={handleChange('query')}
              />
            </Grid>
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='flex-end'>
            <Button variant='outlined' color='secondary' onClick={handleReset}>
              Reset
            </Button>
            <Button variant='outlined'>Save Filter</Button>
            <Button variant='contained'>Apply Filters</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default FilterPanel
