'use client'

import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import ActivityComparison from './ActivityComparison'
import ProvinceRanking from './ProvinceRanking'
import TopSchoolsByLocation from './TopSchoolsByLocation'
import type { ProjectReportData, ProjectReportSection, ReportSection } from '../types'

type Props = {
  data: ProjectReportData
  section: ReportSection
}

const ProjectReport = ({ data, section }: Props) => {
  const activeSection = section as ProjectReportSection

  return (
    <Stack spacing={3}>
      <Typography variant='h5'>Project Summary Report</Typography>
      <Grid container spacing={4}>
        {(activeSection === 'all' || activeSection === 'activity') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <ActivityComparison data={data.activityComparison} />
          </Grid>
        )}
        {(activeSection === 'all' || activeSection === 'province') && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <ProvinceRanking data={data.provinceRanking} />
          </Grid>
        )}
        {(activeSection === 'all' || activeSection === 'schools') && (
          <Grid size={{ xs: 12 }}>
            <TopSchoolsByLocation data={data.topSchoolsByLocation} />
          </Grid>
        )}
      </Grid>
    </Stack>
  )
}

export default ProjectReport
