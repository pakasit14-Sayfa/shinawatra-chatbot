'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

import ReportDropdown from './components/ReportDropdown'
import SummaryCards from './components/SummaryCards'
import FilterPanel from './components/FilterPanel'
import ExportButton from './components/ExportButton'
import DailyEventReport from './components/DailyEventReport'
import ProjectReport from './components/ProjectReport'

import { dailyReportMock, projectReportMock, dailySummaryCards, projectSummaryCards } from './data'
import type { ReportSection, ReportType } from './types'

const AdminReportingView = () => {
  const [reportType, setReportType] = useState<ReportType>('daily')
  const [reportSection, setReportSection] = useState<ReportSection>('all')

  const handleReportTypeChange = (value: ReportType) => {
    setReportType(value)
    setReportSection('all')
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-col gap-1'>
                <Typography variant='h4'>Admin Reporting</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Complete overview for daily events and project performance
                </Typography>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                <ReportDropdown
                  value={reportType}
                  section={reportSection}
                  onChange={handleReportTypeChange}
                  onSectionChange={setReportSection}
                />
                <ExportButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FilterPanel />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <SummaryCards items={reportType === 'daily' ? dailySummaryCards : projectSummaryCards} />
      </Grid>

      <Grid size={{ xs: 12 }}>
        {reportType === 'daily' ? (
          <DailyEventReport data={dailyReportMock} section={reportSection} />
        ) : (
          <ProjectReport data={projectReportMock} section={reportSection} />
        )}
      </Grid>
    </Grid>
  )
}

export default AdminReportingView
