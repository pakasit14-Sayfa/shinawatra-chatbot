'use client'

import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'

import CustomTextField from '@core/components/mui/TextField'

import type { ReportSection, ReportType } from '../types'

type Props = {
  value: ReportType
  section: ReportSection
  onChange: (value: ReportType) => void
  onSectionChange: (value: ReportSection) => void
}

const ReportDropdown = ({ value, section, onChange, onSectionChange }: Props) => {
  const dailySections: { value: ReportSection; label: string }[] = [
    { value: 'all', label: 'All Sections' },
    { value: 'before', label: 'Before Event' },
    { value: 'after', label: 'After Event' }
  ]

  const projectSections: { value: ReportSection; label: string }[] = [
    { value: 'all', label: 'All Sections' },
    { value: 'activity', label: 'Activity Comparison' },
    { value: 'province', label: 'Province Ranking' },
    { value: 'schools', label: 'Top Schools by Location' }
  ]

  const sectionOptions = value === 'daily' ? dailySections : projectSections

  return (
    <Stack spacing={1} sx={{ minWidth: 260 }}>
      <CustomTextField
        select
        size='small'
        label='Report Type'
        value={value}
        onChange={event => onChange(event.target.value as ReportType)}
        slotProps={{ select: { displayEmpty: true } }}
      >
        <MenuItem value='daily'>Daily Event Overview</MenuItem>
        <MenuItem value='project'>Project Summary Report</MenuItem>
      </CustomTextField>
      <CustomTextField
        select
        size='small'
        label={value === 'daily' ? 'Daily Sections' : 'Project Sections'}
        value={section}
        onChange={event => onSectionChange(event.target.value as ReportSection)}
        slotProps={{ select: { displayEmpty: true } }}
      >
        {sectionOptions.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </CustomTextField>
    </Stack>
  )
}

export default ReportDropdown
