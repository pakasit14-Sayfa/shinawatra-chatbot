'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import type { SchoolTeacherSummary } from '../types'

type Props = {
  data: SchoolTeacherSummary
}

const SchoolTeacherSummaryCard = ({ data }: Props) => {
  return (
    <Card>
      <CardHeader title='School & Teacher Summary' />
      <CardContent className='flex flex-col gap-4'>
        <Stack spacing={3}>
          <Stack direction='row' spacing={3} divider={<Divider flexItem orientation='vertical' />}>
            <Stack spacing={0.5}>
              <Typography variant='body2' color='text.secondary'>
                Total Schools
              </Typography>
              <Typography variant='h6'>{data.totalSchools}</Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant='body2' color='text.secondary'>
                Total Teachers
              </Typography>
              <Typography variant='h6'>{data.totalTeachers}</Typography>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant='body2' color='text.secondary'>
                Avg Teachers/School
              </Typography>
              <Typography variant='h6'>{data.averageTeachersPerSchool.toFixed(1)}</Typography>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography variant='subtitle2'>Top Schools</Typography>
            {data.topSchools.map(school => (
              <Stack key={school.name} direction='row' justifyContent='space-between'>
                <Typography variant='body2'>{school.name}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  {school.teacherCount} teachers
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Stack spacing={1}>
            <Typography variant='subtitle2'>By Province</Typography>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Province</TableCell>
                    <TableCell align='right'>Schools</TableCell>
                    <TableCell align='right'>Teachers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.byProvince.map(row => (
                    <TableRow key={row.province}>
                      <TableCell>{row.province}</TableCell>
                      <TableCell align='right'>{row.schoolCount}</TableCell>
                      <TableCell align='right'>{row.teacherCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default SchoolTeacherSummaryCard
