'use client'

// React Imports
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import FormHelperText from '@mui/material/FormHelperText'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Autocomplete from '@mui/material/Autocomplete'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Radio from '@mui/material/Radio'
import { alpha, useTheme } from '@mui/material/styles'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// 1️⃣ Import Dictionary Files
import dictEn from '@/data/dictionaries/en.json'
import dictTh from '@/data/dictionaries/th.json'

// ==========================================
// 1. DATA & MOCKUP SECTION
// ==========================================

type HomeLocale = 'th' | 'en'
type LocalizedOption = {
  code: string
  th: string
  en: string
  [key: string]: string
}

const homeLocales: HomeLocale[] = ['th', 'en']

const provinces: LocalizedOption[] = [
  { code: 'BKK', th: 'กรุงเทพมหานคร', en: 'Bangkok' },
  { code: 'CNX', th: 'เชียงใหม่', en: 'Chiang Mai' },
  { code: 'PYO', th: 'พะเยา', en: 'Phayao' },
  { code: 'CRI', th: 'เชียงราย', en: 'Chiang Rai' }
]

const schools: (LocalizedOption & { provinceCode: string })[] = [
  { code: 'S001', th: 'โรงเรียนเตรียมอุดมศึกษา', en: 'Triam Udom Suksa School', provinceCode: 'BKK' },
  { code: 'S002', th: 'โรงเรียนสาธิต มช.', en: 'Satit CMU', provinceCode: 'CNX' },
  { code: 'S003', th: 'โรงเรียนพะเยาพิทยาคม', en: 'Phayao Pittayakom School', provinceCode: 'PYO' },
  { code: 'S004', th: 'โรงเรียนสาธิต มพ.', en: 'Satit UP', provinceCode: 'PYO' },
  { code: 'S005', th: 'โรงเรียนสามัคคีวิทยาคม', en: 'Samakkhi Wittayakhom School', provinceCode: 'CRI' }
]

const getLocalizedUrl = (path: string, lang: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`

  return `/${lang}${cleanPath === '/' ? '' : cleanPath}`
}

// ==========================================
// 2. TYPES
// ==========================================

type HomeProps = {
  locale: HomeLocale
}

type Participant = {
  id: number
  prefix: string
  fullName: string
  position: string
  email: string
  phone: string
}

type ParticipantFormErrors = {
  prefix: boolean
  fullName: boolean
  position: boolean
  email: boolean
  phone: boolean
}

type EventOption = {
  id: string
  date: string
  location: string
}

type DownloadItem = {
  id: string
  title: string
  href: string
}

// ==========================================
// 3. COMPONENT LOGIC
// ==========================================

// 1. แก้ไข Type ให้รองรับ 2 ภาษา
type EventOption = {
  id: string

  // วันที่และสถานที่ แยกภาษา
  date_th: string
  date_en: string
  location_th: string
  location_en: string
}

// 2. แก้ไขข้อมูล Mock Data (สมมติว่าดึงมาจาก Admin/DB)
const eventOptions: EventOption[] = [
  {
    id: '1',
    date_th: '9 ธันวาคม 2568',
    date_en: '9 December 2025',
    location_th: 'โรงเรียนร้อยเอ็ด โปลด',
    location_en: 'Roi Et Polod School'
  },
  {
    id: '2',
    date_th: '12 ธันวาคม 2568',
    date_en: '12 December 2025',
    location_th: 'มหาวิทยาลัยพะเยา',
    location_en: 'University of Phayao'
  },
  {
    id: '3',
    date_th: '16 ธันวาคม 2568',
    date_en: '16 December 2025',
    location_th: 'โรงเรียนชลบุรีสุขบท',
    location_en: 'Chonburi Sukkhabot School'
  },
  {
    id: '4',
    date_th: '19 ธันวาคม 2568',
    date_en: '19 December 2025',
    location_th: 'โรงแรมริมกรี ซิตี้ รีสอร์ท เชียงใหม่',
    location_en: 'Rim Glee City Resort, Chiang Mai'
  }
]

const PDF_LINK = 'https://admission.up.ac.th/uploads/admission/document/68b80175b03f2heNJR.pdf'

const downloadItems: DownloadItem[] = [
  {
    id: '1',
    title: 'หนังสือเชิญ ขอเชิญเข้าร่วมสัมมนาครูแนะแนวและการรับนักศึกษาของมหาวิทยาลัยพะเยา ประจำปีการศึกษา 2569',
    href: PDF_LINK
  },
  {
    id: '2',
    title: 'หนังสือ ขอแจ้งเงื่อนไขแสดงกำหนดการสัมมนาครูแนะแนวและการรับนักศึกษาของมหาวิทยาลัยพะเยา ประจำปีการศึกษา 2569',
    href: PDF_LINK
  }
]

const initialParticipants: Participant[] = [
  {
    id: 1,
    prefix: 'นาย',
    fullName: 'มีใจ สมดี',
    position: 'ผ.อ',
    email: '12345@gmail.com',
    phone: '08-222-2222'
  },
  {
    id: 2,
    prefix: 'นาย',
    fullName: 'สมปอง สมใจ',
    position: 'รอง ผ.อ',
    email: '12345@gmail.com',
    phone: '08-222-2222'
  },
  {
    id: 3,
    prefix: 'นาย',
    fullName: 'สมหมาย หายใจ',
    position: 'รอง ผ.อ',
    email: '12345@gmail.com',
    phone: '08-222-2222'
  }
]

const RegistrationForm = ({ locale }: HomeProps) => {
  // Vars
  // 2️⃣ สร้างตัวแปร dict เพื่อเลือกภาษา (แทน copy เดิม)
  const dict = locale === 'th' ? dictTh : dictEn

  const theme = useTheme()
  const router = useRouter()

  const heroBg = '/images/front-pages/landing-page/hero-bg-dark.png'

  // States
  const [selectedProvince, setSelectedProvince] = useState<LocalizedOption | null>(null)
  const [selectedSchool, setSelectedSchool] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const [formPrefix, setFormPrefix] = useState('')
  const [formFullName, setFormFullName] = useState('')
  const [formPosition, setFormPosition] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')

  const [formErrors, setFormErrors] = useState<ParticipantFormErrors>({
    prefix: false,
    fullName: false,
    position: false,
    email: false,
    phone: false
  })

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [studentCount, setStudentCount] = useState<string>('')
  const selectedEvent = eventOptions.find(e => e.id === selectedEventId)

  // Hooks
  const { updatePageSettings } = useSettings()

  useEffect(() => {
    return updatePageSettings({ skin: 'default' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredSchools = useMemo(() => {
    if (!selectedProvince) return schools

    return schools.filter(school => school.provinceCode === selectedProvince.code)
  }, [selectedProvince])

  useEffect(() => {
    setSubmitted(false)
  }, [selectedProvince, selectedSchool, password, confirmPassword])

  useEffect(() => {
    if (!selectedSchool) return
    const stillExists = filteredSchools.some(school => school.code === selectedSchool)

    if (!stillExists) setSelectedSchool('')
  }, [filteredSchools, selectedSchool])

  const passwordMismatch = password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword
  const passwordReady = password.length >= 8 && confirmPassword.length >= 8 && password === confirmPassword

  // 3️⃣ ใช้ Text จาก dict สำหรับสถานะ Password (ถ้าคุณเพิ่ม key เหล่านี้ใน json แล้ว ถ้ายัง ให้ใช้ hardcode ไปก่อนหรือเพิ่มใน json)
  // สมมติว่ายังไม่มีใน JSON ที่ให้มา ผมจะใช้ hardcode ไปก่อนหรือคุณต้องเพิ่ม key: password_ready, password_mismatch, password_hint
  const passwordStatus = passwordReady ? dict.pass_ready : passwordMismatch ? dict.pass_mismatch : dict.pass_hint

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    router.push(getLocalizedUrl('/teacher/select-session', locale as string))
  }

  const optionLabel = (option: LocalizedOption) => option[locale] ?? option.en

  const handleOpenDialog = () => {
    setEditId(null)
    setFormPrefix('')
    setFormFullName('')
    setFormPosition('')
    setFormEmail('')
    setFormPhone('')
    setFormErrors({ prefix: false, fullName: false, position: false, email: false, phone: false })
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditId(null)
  }

  const handleSaveParticipant = () => {
    const newErrors: ParticipantFormErrors = {
      prefix: formPrefix.trim() === '',
      fullName: formFullName.trim() === '',
      position: formPosition.trim() === '',
      email: formEmail.trim() === '',
      phone: formPhone.trim() === ''
    }

    if (newErrors.prefix || newErrors.fullName || newErrors.position || newErrors.email || newErrors.phone) {
      setFormErrors(newErrors)

      return
    }

    if (editId !== null) {
      setParticipants(prev =>
        prev.map(item =>
          item.id === editId
            ? {
                ...item,
                prefix: formPrefix,
                fullName: formFullName,
                position: formPosition,
                email: formEmail,
                phone: formPhone
              }
            : item
        )
      )
      setDialogOpen(false)
      setEditId(null)

      return
    }

    const nextId = participants.length + 1

    setParticipants(prev => [
      ...prev,
      {
        id: nextId,
        prefix: formPrefix,
        fullName: formFullName,
        position: formPosition,
        email: formEmail,
        phone: formPhone
      }
    ])
    setDialogOpen(false)
  }

  const handleEditParticipant = (id: number) => {
    const p = participants.find(item => item.id === id)

    if (!p) return
    setFormPrefix(p.prefix)
    setFormFullName(p.fullName)
    setFormPosition(p.position)
    setFormEmail(p.email)
    setFormPhone(p.phone)
    setFormErrors({ prefix: false, fullName: false, position: false, email: false, phone: false })
    setEditId(id)
    setDialogOpen(true)
  }

  const handleDeleteParticipant = (id: number) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
  }

  return (
    <Box component='main' sx={{ bgcolor: 'background.default' }}>
      <Box
        sx={{
          backgroundImage: `linear-gradient(120deg, ${alpha(theme.palette.primary.main, 0.75)}, ${alpha(theme.palette.primary.dark, 0.75)}), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          color: theme.palette.common.white,
          position: 'relative'
        }}
      >
        <Container maxWidth='lg' sx={{ py: { xs: 6, md: 8 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
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
              <Button component={Link} href={getLocalizedUrl('/', locale as string)} color='inherit'>
                {/* 4️⃣ เปลี่ยน Nav Link */}
                {dict.nav_home}
              </Button>
              <Button component='a' href='https://www.up.ac.th/' target='_blank' rel='noreferrer' color='inherit'>
                UP Web
              </Button>
              <Button
                component={Link}
                href={getLocalizedUrl('/login', locale as string)}
                color='inherit'
                sx={{ textDecoration: 'underline' }}
              >
                {/* 4️⃣ เปลี่ยน Nav Link */}
                {dict.nav_login}
              </Button>
            </Stack>

            <Stack direction='row' spacing={1.5} alignItems='center' flexWrap='wrap'>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                {homeLocales.map(language => (
                  <Chip
                    key={language}
                    label={language === 'th' ? 'TH' : 'EN'}
                    color={locale === language ? 'success' : 'default'}
                    variant={locale === language ? 'filled' : 'outlined'}
                    component={Link}
                    href={getLocalizedUrl('/home', language as string)}
                    clickable
                    sx={{ color: locale === language ? 'common.white' : 'inherit' }}
                  />
                ))}
              </Stack>
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.18), color: 'white' }}>
                <i className='tabler-user' />
              </Avatar>
            </Stack>
          </Paper>

          <Stack spacing={1} textAlign='center' alignItems='center'>
            <Typography variant='h4' fontWeight={800} sx={{ letterSpacing: 0.4 }}>
              Admission System
            </Typography>
            <Typography variant='h5' fontWeight={800}>
              University of Phayao
            </Typography>
            <Typography variant='subtitle1' sx={{ maxWidth: 720, opacity: 0.9 }}>
              Welcome to Guidance Teacher Seminar & Open House 2025 Registration System
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth='lg' sx={{ mt: { xs: -8, md: -10 }, pb: 12 }}>
        <Paper
          component='form'
          onSubmit={handleSubmit}
          elevation={10}
          sx={theme2 => ({
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: { xs: 3, md: 4 },
            boxShadow: `0 24px 80px ${alpha(theme2.palette.common.black, 0.12)}`,
            position: 'relative'
          })}
        >
          <Stack spacing={3} alignItems='center' textAlign='center'>
            <Typography variant='h5' fontWeight={800}>
              {/* 5️⃣ ใช้ dict.form_title */}
              {dict.form_title}
            </Typography>
            <Divider sx={{ width: '100%', maxWidth: 480 }}>
              <Typography variant='body2' color='text.secondary'>
                {/* 5️⃣ ใช้ dict.form_subtitle */}
                {dict.form_subtitle}
              </Typography>
            </Divider>
          </Stack>

          <Box mt={4} mb={2}>
            <Typography variant='subtitle1' fontWeight={700}>
              {dict.form_title} (ข้อมูลสถานศึกษา)
            </Typography>
            <Divider sx={{ mt: 1 }} />
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mt={1}>
            <Box flex={1}>
              <Autocomplete
                autoHighlight
                options={provinces}
                value={selectedProvince}
                onChange={(_, value) => setSelectedProvince(value)}
                isOptionEqualToValue={(option, value) => (value ? option.code === value.code : false)}
                getOptionLabel={optionLabel}
                fullWidth
                renderInput={params => (
                  <TextField
                    {...params}
                    fullWidth
                    // 6️⃣ ใช้ dict.form_province
                    label={dict.form_province}
                    placeholder={dict.form_province}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position='start'>
                            <i className='tabler-map-pin text-base text-primary' />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            </Box>

            <Box flex={1}>
              <TextField
                select
                fullWidth
                // 6️⃣ ใช้ dict.form_school
                label={dict.form_school}
                placeholder={dict.form_school}
                value={selectedSchool}
                onChange={event => setSelectedSchool(event.target.value)}
              >
                {filteredSchools.map(school => (
                  <MenuItem key={school.code} value={school.code}>
                    {optionLabel(school)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mt={3}>
            <Box flex={1}>
              <CustomTextField
                fullWidth
                // 7️⃣ ใช้ dict.form_password
                label={dict.form_password}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={event => setPassword(event.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowPassword(prev => !prev)} edge='end'>
                          <i className={showPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Box>

            <Box flex={1}>
              <CustomTextField
                fullWidth
                // 7️⃣ ใช้ dict.form_confirm_pass
                label={dict.form_confirm_pass}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setShowConfirmPassword(prev => !prev)} edge='end'>
                          <i className={showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Stack direction='row' spacing={1.5} alignItems='center' mt={1}>
                <Chip
                  icon={<i className={passwordReady ? 'tabler-shield-check' : 'tabler-shield'} />}
                  label={passwordStatus}
                  color={passwordReady ? 'success' : 'default'}
                  variant={passwordReady ? 'filled' : 'outlined'}
                  sx={{ minWidth: 160 }}
                />
                <FormHelperText
                  sx={{ color: passwordReady ? 'success.main' : passwordMismatch ? 'error.main' : 'text.secondary' }}
                >
                  {passwordStatus}
                </FormHelperText>
              </Stack>
            </Box>
          </Stack>

          <Stack direction='row' alignItems='center' justifyContent='flex-start' mt={6} mb={3}>
            <Button
              variant='contained'
              onClick={handleOpenDialog}
              sx={theme2 => ({
                borderRadius: 999,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: `0 10px 25px ${alpha(theme2.palette.primary.main, 0.25)}`
              })}
            >
              {/* 8️⃣ ใช้ dict.btn_add */}+ {dict.btn_add}
            </Button>
          </Stack>

          <TableContainer
            component={Paper}
            sx={theme2 => ({ borderRadius: 4, boxShadow: `0 18px 45px ${alpha(theme2.palette.common.black, 0.08)}` })}
          >
            <Table>
              <TableHead>
                <TableRow>
                  {/* 9️⃣ เปลี่ยนหัวตารางเป็น dict */}
                  <TableCell sx={{ fontWeight: 700 }}>{dict.col_seq}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{dict.col_prefix}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{dict.col_name}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{dict.col_position}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{dict.col_email}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{dict.col_phone}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align='center'>
                    แก้ไข
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align='center'>
                    ลบ
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 0 }}>
                    <Divider />
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {participants.map((row, index) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{row.prefix}</TableCell>
                    <TableCell>{row.fullName}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell align='center'>
                      <IconButton
                        size='small'
                        onClick={() => handleEditParticipant(row.id)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <i className='tabler-edit' />
                      </IconButton>
                    </TableCell>
                    <TableCell align='center'>
                      <IconButton
                        size='small'
                        onClick={() => handleDeleteParticipant(row.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <i className='tabler-trash' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {participants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography variant='body2' color='text.secondary' align='center' sx={{ py: 3 }}>
                        {dict.oh_title}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box mt={6}>
            <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
              {dict.oh_title}
            </Typography>

            {/* กล่องตัวเลือกวันและสถานที่ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
              {eventOptions.map(event => {
                // 👇 สร้างตัวแปรดึงค่าตามภาษา
                const dateShow = locale === 'th' ? event.date_th : event.date_en
                const locationShow = locale === 'th' ? event.location_th : event.location_en

                return (
                  <Paper
                    key={event.id} // ... (props เดิม ไม่ต้องแก้) ...
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <Stack direction='row' spacing={2} alignItems='center'>
                      {/* ไอคอนปฏิทิน */}
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      >
                        <Typography variant='caption' sx={{ fontSize: 11 }}>
                          {/* ตรงนี้อาจจะใช้ dict.month หรือ hardcode ไปก่อน */}
                          {locale === 'th' ? 'เดือน' : 'Month'}
                        </Typography>
                        <Typography variant='h6' sx={{ lineHeight: 1 }}>
                          12
                        </Typography>
                      </Box>

                      <Box>
                        {/* 👇 แสดงผลข้อมูลตามภาษาที่เลือกไว้ */}
                        <Typography fontWeight={600}>{dateShow}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {locationShow}
                        </Typography>
                      </Box>
                    </Stack>

                    <Radio
                      checked={selectedEventId === event.id}
                      onChange={() => setSelectedEventId(event.id)}
                      color='primary'
                    />
                  </Paper>
                )
              })}
            </Box>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
              {selectedEvent
                ? `${dict.oh_msg_part1} ${selectedEvent.date} ${dict.oh_msg_part2} ${selectedEvent.location} ${dict.oh_msg_part3}`
                : dict.oh_msg_default}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Typography variant='subtitle1' fontWeight={700} sx={{ mb: 2 }}>
              {dict.oh_schedule}
            </Typography>

            <Stack spacing={2}>
              {downloadItems.map(item => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Typography variant='body2'>
                    {item.title} :{' '}
                    <Link
                      href={item.href}
                      style={{ textDecoration: 'underline' }}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      {dict.oh_download}
                    </Link>
                  </Typography>
                  <IconButton
                    component='a'
                    href={item.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={dict.oh_download}
                    sx={{ ml: 2 }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Stack spacing={2.5} mt={4} alignItems='center'>
            <Button type='submit' variant='contained' size='large' sx={{ px: 6 }}>
              {/* 🔟 ใช้ dict.btn_save */}
              {dict.btn_save}
            </Button>
            <Typography variant='body2' color={submitted ? 'success.main' : 'text.secondary'} textAlign='center'>
              {dict.oh_msg_part3}
            </Typography>
          </Stack>
        </Paper>
      </Container>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth='sm'
        PaperProps={{ sx: { borderRadius: 4, p: 1.5 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: '1.35rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          {editId === null ? 'เพิ่มข้อมูลผู้ร่วมงาน' : 'แก้ไขข้อมูลผู้ร่วมงาน'}
          <IconButton onClick={handleCloseDialog} sx={{ color: 'error.main' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            {/* 1️⃣1️⃣ ใน Modal ก็ควรใช้ dict ถ้ามี key รองรับ (ตอนนี้ผมใช้ key จาก table header ไปก่อน) */}
            <TextField
              label={`${dict.col_prefix} *`}
              fullWidth
              value={formPrefix}
              onChange={e => {
                setFormPrefix(e.target.value)
                if (formErrors.prefix) setFormErrors(prev => ({ ...prev, prefix: false }))
              }}
              error={formErrors.prefix}
              helperText={formErrors.prefix ? 'กรุณากรอกคำนำหน้า' : ''}
            />
            <TextField
              label={`${dict.col_name} *`}
              fullWidth
              value={formFullName}
              onChange={e => {
                setFormFullName(e.target.value)
                if (formErrors.fullName) setFormErrors(prev => ({ ...prev, fullName: false }))
              }}
              error={formErrors.fullName}
              helperText={formErrors.fullName ? 'กรุณากรอกชื่อ-สกุล' : ''}
            />
            <TextField
              label={`${dict.col_position} *`}
              fullWidth
              value={formPosition}
              onChange={e => {
                setFormPosition(e.target.value)
                if (formErrors.position) setFormErrors(prev => ({ ...prev, position: false }))
              }}
              error={formErrors.position}
              helperText={formErrors.position ? 'กรุณากรอกตำแหน่ง' : ''}
            />
            <TextField
              label={`${dict.col_email} *`}
              fullWidth
              value={formEmail}
              onChange={e => {
                setFormEmail(e.target.value)
                if (formErrors.email) setFormErrors(prev => ({ ...prev, email: false }))
              }}
              error={formErrors.email}
              helperText={formErrors.email ? 'กรุณากรอกอีเมล' : ''}
            />
            <TextField
              label={`${dict.col_phone} *`}
              fullWidth
              value={formPhone}
              onChange={e => {
                setFormPhone(e.target.value)
                if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: false }))
              }}
              error={formErrors.phone}
              helperText={formErrors.phone ? 'กรุณากรอกเบอร์โทรศัพท์มือถือ' : '*ใช้สำหรับการลงทะเบียนเข้างาน'}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseDialog} variant='outlined' sx={{ width: 120, borderRadius: 2 }}>
            {/* 1️⃣2️⃣ ใช้ dict.btn_cancel */}
            {dict.btn_cancel}
          </Button>
          <Button onClick={handleSaveParticipant} variant='contained' sx={{ width: 120, borderRadius: 2 }}>
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default RegistrationForm
