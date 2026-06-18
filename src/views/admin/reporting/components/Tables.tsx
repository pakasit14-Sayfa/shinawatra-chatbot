'use client'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

import type { ComparisonRow } from '../types'

type ComparisonTableProps = {
  rows: ComparisonRow[]
}

const changeChip = (change: number) => {
  if (change > 0) return <Chip size='small' color='success' variant='tonal' label={`+${change}`} />
  if (change < 0) return <Chip size='small' color='error' variant='tonal' label={`${change}`} />

  return <Chip size='small' label='0' variant='outlined' />
}

export const ComparisonTable = ({ rows }: ComparisonTableProps) => {
  return (
    <TableContainer component={Paper} variant='outlined'>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align='right'>Before</TableCell>
            <TableCell align='right'>After</TableCell>
            <TableCell align='right'>Change</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell align='right'>{row.before}</TableCell>
              <TableCell align='right'>{row.after}</TableCell>
              <TableCell align='right'>{changeChip(row.change)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

type RankingRow = {
  name: string
  teacherCount: number
  schoolCount: number
  attendanceRate: number
}

type RankingTableProps = {
  rows: RankingRow[]
}

export const RankingTable = ({ rows }: RankingTableProps) => {
  return (
    <TableContainer component={Paper} variant='outlined'>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Province</TableCell>
            <TableCell align='right'>Teachers</TableCell>
            <TableCell align='right'>Schools</TableCell>
            <TableCell align='right'>Attendance Rate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => (
            <TableRow key={row.name}>
              <TableCell>{row.name}</TableCell>
              <TableCell align='right'>{row.teacherCount}</TableCell>
              <TableCell align='right'>{row.schoolCount}</TableCell>
              <TableCell align='right'>
                <Box display='flex' justifyContent='flex-end' alignItems='center' gap={1}>
                  <Typography variant='body2'>{row.attendanceRate}%</Typography>
                  <Chip size='small' label={row.attendanceRate >= 90 ? 'High' : 'Medium'} color='info' variant='tonal' />
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
