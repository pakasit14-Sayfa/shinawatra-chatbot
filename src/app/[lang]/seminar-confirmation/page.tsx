'use client'

import React from 'react'

// Next
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
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
import { alpha, useTheme } from '@mui/material/styles'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import EventIcon from '@mui/icons-material/Event'

// ------- Mock Data & Helper (แก้ไข: นำมาไว้ที่นี่เพื่อให้ใช้งานได้เลย) -------

// 1. Mock Dictionary (แทนการ import)
const dictionaries = {
  th: {
    nav: { home: 'หน้าหลัก', up: 'ม.พะเยา', login: 'เข้าสู่ระบบ' }
  },
  en: {
    nav: { home: 'Home', up: 'UP Web', login: 'Login' }
  }
}

// 2. Mock Languages (แทนการ import)
const locales = ['th', 'en']

// 3. Helper Function สร้าง URL (แทนการ import)
const getLocalizedUrl = (path: string, lang: string) => {
  // ถ้า path เริ่มต้นด้วย / ให้ตัดออกเพื่อกันเบิ้ล
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`
}

type Participant = {
  id: number
  prefix: string
  fullName: string
  position: string
  email: string
  phone: string
}

const mockSchoolName = 'ทดสอบระบบ'
const mockProvinceName = 'พะเยา'

const mockParticipants: Participant[] = [
  {
    id: 1,
    prefix: 'นาย',
    fullName: 'มีใจ สมดี',
    position: 'ผ.อ',
    email: '123456@gmail.com',
    phone: '08-222-2222'
  },
  {
    id: 2,
    prefix: 'นาย',
    fullName: 'สมปอง สมใจ',
    position: 'รอง ผ.อ',
    email: '123456@gmail.com',
    phone: '08-222-2222'
  },
  {
    id: 3,
    prefix: 'นาย',
    fullName: 'สมหมาย หายใจ',
    position: 'รอง ผ.อ',
    email: '123456@gmail.com',
    phone: '08-222-2222'
  }
]

// ข้อมูลวัน–สถานที่ (ตัวอย่าง)
const eventDate = '12 ธ.ค. 2568'
const eventPlace = 'มหาวิทยาลัยพะเยา อาคาร 99 ปี จุลสารญปัญทราชย์'

const SelectSessionPage = () => {
  const theme = useTheme()
  const router = useRouter()
  const params = useParams()

  // ดึงค่าภาษาจาก URL หรือ default เป็น 'th'
  const lang = (params?.lang as string) || 'th'

  // เลือกคำศัพท์ตามภาษา
  const copy = dictionaries[lang as keyof typeof dictionaries] || dictionaries.th

  // hero background
  const heroBg = '/images/front-pages/landing-page/up-campus-bg.jpg'

  const handleEdit = () => {
    router.push(getLocalizedUrl('/', lang))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleLogout = () => {
    router.push(getLocalizedUrl('/login', lang))
  }

  return (
    <Box component='main' sx={{ bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box
        sx={{
          backgroundImage: `linear-gradient(
            120deg,
            ${alpha(theme.palette.primary.main, 0.75)},
            ${alpha(theme.palette.primary.dark, 0.75)}
          ), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          color: theme.palette.common.white
        }}
      >
        <Container maxWidth='lg' sx={{ py: { xs: 6, md: 8 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Top bar */}
          <Paper
            elevation={8}
            sx={theme2 => ({
              px: { xs: 2.5, sm: 3.5, md: 4 },
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              borderRadius: 999,
              bgcolor: alpha(theme2.palette.primary.dark, 0.92),
              color: theme2.palette.common.white,
              boxShadow: `0 18px 60px ${alpha(theme2.palette.common.black, 0.25)}`
            })}
          >
            <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap'>
              <Chip label='PRODUCT' color='secondary' sx={{ color: theme.palette.common.white, fontWeight: 700 }} />
              <Divider orientation='vertical' flexItem sx={{ borderColor: alpha(theme.palette.common.white, 0.4) }} />
              <Button component={Link} href={getLocalizedUrl('/', lang)} color='inherit'>
                {copy.nav.home}
              </Button>
              <Button component='a' href='https://www.up.ac.th/' target='_blank' rel='noreferrer' color='inherit'>
                {copy.nav.up}
              </Button>
              <Button
                component={Link}
                href={getLocalizedUrl('/login', lang)}
                color='inherit'
                sx={{ textDecoration: 'underline' }}
              >
                {copy.nav.login}
              </Button>
            </Stack>

            <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap'>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                {locales.map(language => (
                  <Chip
                    key={language}
                    label={language === 'th' ? 'TH' : 'EN'}
                    color={lang === language ? 'success' : 'default'}
                    variant={lang === language ? 'filled' : 'outlined'}
                    component={Link}
                    href={getLocalizedUrl('/seminar-confirmation', language)} // ลิงก์ไปหน้าเดิมแต่เปลี่ยนภาษา
                    clickable
                    sx={{ color: lang === language ? 'common.white' : 'inherit' }}
                  />
                ))}
              </Stack>
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.18), color: 'white' }}>
                <i className='tabler-user' />
              </Avatar>
            </Stack>
          </Paper>

          {/* Title */}
          <Stack spacing={1} textAlign='center' alignItems='center'>
            <Typography variant='h4' fontWeight={800}>
              แบบตอบรับการเข้าสัมมนาครูแนะแนว
            </Typography>
            <Typography variant='h6' fontWeight={600}>
              การเข้าเรียนต่อในมหาวิทยาลัยพะเยา
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Main content */}
      <Container maxWidth='lg' sx={{ mt: { xs: -8, md: -10 }, pb: 10 }}>
        <Paper
          elevation={10}
          sx={theme2 => ({
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: 4,
            boxShadow: `0 24px 80px ${alpha(theme2.palette.common.black, 0.12)}`,
            position: 'relative'
          })}
        >
          {/* ข้อมูลสถานศึกษา */}
          <Paper
            sx={{
              borderRadius: 3,
              border: '2px solid',
              borderColor: 'primary.main',
              overflow: 'hidden',
              mb: 6
            }}
            variant='outlined'
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                px: 3,
                py: 1.5
              }}
            >
              <Typography fontWeight={700}>ข้อมูลสถานศึกษา</Typography>
            </Box>
            <Box sx={{ px: 4, py: 3 }}>
              <Stack spacing={1}>
                <Typography>
                  <strong>โรงเรียน :</strong> {mockSchoolName}
                </Typography>
                <Typography>
                  <strong>จังหวัด :</strong> {mockProvinceName}
                </Typography>
              </Stack>
            </Box>
          </Paper>

          {/* รายชื่อผู้เข้าร่วมโครงการ */}
          <Box mb={4}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>
              รายชื่อผู้เข้าร่วมโครงการ
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              การเข้าร่วมโครงการ : สามารถเข้าร่วมได้
            </Typography>
          </Box>

          <TableContainer
            component={Paper}
            sx={theme2 => ({
              borderRadius: 3,
              mb: 6,
              boxShadow: `0 18px 45px ${alpha(theme2.palette.common.black, 0.08)}`
            })}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>ลำดับที่</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>คำนำหน้า</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ชื่อ-สกุล</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>ตำแหน่ง</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>โทรศัพท์มือถือ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockParticipants.map((p, index) => (
                  <TableRow key={p.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{p.prefix}</TableCell>
                    <TableCell>{p.fullName}</TableCell>
                    <TableCell>{p.position}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{p.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* กล่องวันที่ + สถานที่ + ปุ่มแก้ไข */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'stretch', md: 'center' }}
            justifyContent='space-between'
            mb={5}
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Paper
                variant='outlined'
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  minWidth: 220,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <EventIcon color='primary' />
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    วันที่จัดโครงการ
                  </Typography>
                  <Typography fontWeight={600}>{eventDate}</Typography>
                </Box>
              </Paper>

              <Paper
                variant='outlined'
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  minWidth: 260,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <LocationOnIcon color='primary' />
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    สถานที่จัดโครงการ
                  </Typography>
                  <Typography fontWeight={600}>{eventPlace}</Typography>
                </Box>
              </Paper>
            </Stack>

            {/* ปุ่มแก้ไขข้อมูล */}
            <Button
              variant='contained'
              color='primary'
              onClick={handleEdit}
              sx={theme2 => ({
                borderRadius: 999,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: `0 10px 25px ${alpha(theme2.palette.primary.main, 0.25)}`
              })}
            >
              แก้ไขข้อมูล
            </Button>
          </Stack>

          {/* ปุ่มล่าง */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent='space-between'
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            {/* ปุ่มพิมพ์ */}
            <Button
              variant='contained'
              color='primary'
              onClick={handlePrint}
              sx={theme2 => ({
                borderRadius: 999,
                px: 5,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: `0 10px 25px ${alpha(theme2.palette.primary.main, 0.25)}`
              })}
            >
              พิมพ์แบบฟอร์มตอบรับ
            </Button>

            {/* ปุ่มออกจากระบบ */}
            <Button
              variant='outlined'
              color='secondary'
              onClick={handleLogout}
              sx={{
                borderRadius: 999,
                px: 5,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700
              }}
            >
              ออกจากระบบ
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default SelectSessionPage
