'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import { useTheme, alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

// **********************************************
// NOTE: นำเข้า Autocomplete เพื่อให้พิมพ์และเลือกได้
import Autocomplete from '@mui/material/Autocomplete'

// **********************************************
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'

// Icons Imports
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'

// Types
import type { Locale } from '@/configs/i18n'
import CustomTextField from '@/@core/components/mui/TextField'

type LoginContentProps = {
  dictionary: any
  lang: Locale
  ui: {
    navProduct: string
    navHome: string
    navUp: string
    navDesc: string
    navAdmin: string
    schoolLabel: string
    schoolPlaceholder: string
    passwordLabel: string
    passwordPlaceholder: string
    buttonText: string
  }
  contactLine1: string
  contactLine2: string
}

// ข้อมูลจำลองสำหรับ Autocomplete (รายการโรงเรียน)
const SCHOOL_OPTIONS = [
  'โรงเรียนตัวอย่าง 1',
  'โรงเรียนตัวอย่าง 2',
  'โรงเรียนเมตตา',
  'โรงเรียนพะเยาพิทยาคม',
  'โรงเรียนเฉลิมขวัญสตรี',
  'โรงเรียนเตรียมอุดมศึกษา'
]

const LoginContent = ({ dictionary, lang, ui, contactLine1, contactLine2 }: LoginContentProps) => {
  // Hook เรียกใช้ Theme
  const theme = useTheme()
  const overlayColor = alpha(theme.palette.primary.main, 0.6)
  const headerColor = alpha(theme.palette.primary.dark, 0.9)
  const iconColor = theme.palette.primary.main

  // State สำหรับ Show/Hide Password
  const [showPassword, setShowPassword] = useState(false)

  // State สำหรับเก็บค่าโรงเรียนที่ถูกเลือก
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)

  // ฟังก์ชันกดปุ่มลูกตา
  const handleClickShowPassword = () => setShowPassword(show => !show)

  // ป้องกัน Focus หลุดตอนกดปุ่ม
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
  }

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* ================= Background Section ================= */}
      <Box sx={{ position: 'absolute', inset: 0, zIndex: -1 }}>
        <img
          src='/images/front-pages/up.png' // พื้นหลัง
          alt='Background'
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute', // เพิ่ม position: 'absolute' เพื่อความชัวร์
            inset: 0
          }}
        />
        {/* Overlay สีตามที่คุณกำหนดเอง */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,

            backgroundColor: overlayColor
          }}
        />
      </Box>

      {/* ================= Header / Navbar ================= */}
      <Box component='header' sx={{ width: '100%', px: { xs: 2, lg: 8 }, pt: { xs: 2, lg: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '50px',

            backgroundColor: headerColor,
            px: 3,
            py: 1,
            color: 'common.white',
            boxShadow: theme.shadows[4]
          }}
        >
          {/* Menu Left */}
          <Stack direction='row' alignItems='center' spacing={2}>
            {/* โค้ด Overlay ที่ผิดพลาดถูกลบออกจาก Stack นี้แล้ว */}

            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                px: 2,
                py: 0.5,
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {ui.navProduct}
            </Box>
            <Button color='inherit' sx={{ fontSize: '0.75rem', minWidth: 'auto' }}>
              {ui.navHome}
            </Button>
            <Button color='inherit' sx={{ fontSize: '0.75rem', minWidth: 'auto' }}>
              {ui.navUp}
            </Button>
            <Typography
              variant='caption'
              sx={{
                borderLeft: '1px solid rgba(255,255,255,0.3)',
                pl: 2,
                opacity: 0.8,
                display: { xs: 'none', md: 'block' }
              }}
            >
              {ui.navDesc}
            </Typography>
          </Stack>

          {/* Menu Right */}
          <Stack direction='row' alignItems='center' spacing={1}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.4)',
                fontSize: '13px'
              }}
            >
              <PersonOutlineIcon fontSize='small' />
            </Box>
            <Typography variant='caption' fontWeight='bold'>
              {ui.navAdmin}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* ================= Main Content / Login Card ================= */}
      <Box
        component='section'
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 8,
            p: { xs: 4, sm: 5 },
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Logo & Welcome Text */}
          <Stack alignItems='center' spacing={1} mb={4}>
            <img
              src='/images/front-pages/logo.png' // โลโก้
              alt='Logo'
              width={130}
              height={100}
              style={{ marginBottom: theme.spacing(1) }}
            />
            <Typography variant='h5' fontWeight={600} color='text.primary'>
              {dictionary.welcome}
            </Typography>
            <Typography variant='body2' color='text.secondary' align='center'>
              {dictionary.loginToUPPSF}
            </Typography>
          </Stack>

          {/* Form Area */}
          <Box component='form' noValidate autoComplete='off'>
            <Stack spacing={3}>
              {/* Select School -> Autocomplete (พิมพ์และเลือกได้) */}
              <Autocomplete
                options={SCHOOL_OPTIONS} // ใช้รายการโรงเรียนที่กำหนดไว้
                value={selectedSchool}
                onChange={(event, newValue) => {
                  setSelectedSchool(newValue) // อัปเดต State เมื่อมีการเลือก
                }}
                size='small'
                renderInput={params => (
                  <CustomTextField
                    {...params}
                    fullWidth
                    color='primary'
                    label={ui.schoolLabel}
                    placeholder={ui.schoolPlaceholder}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position='start'>
                          <SchoolOutlinedIcon fontSize='small' sx={{ color: iconColor }} />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />

              {/* Password Field (Updated with Show/Hide Logic) */}
              <CustomTextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                color='primary'
                label={ui.passwordLabel}
                placeholder={ui.passwordPlaceholder}
                InputProps={{
                  // รูปกุญแจด้านหน้า
                  startAdornment: (
                    <InputAdornment position='start'>
                      <LockOutlinedIcon fontSize='small' sx={{ color: iconColor }} />
                    </InputAdornment>
                  ),

                  // ปุ่มลูกตาด้านหลัง
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        aria-label='toggle password visibility'
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        color='primary'
                        edge='end'
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Submit Button */}
              <Button
                type='submit'
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,

                  // ปุ่มยังคงใช้สี Primary ของ Theme เพื่อให้เข้ากับระบบ
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.24)}`
                }}
              >
                {ui.buttonText}
              </Button>
            </Stack>
          </Box>

          {/* Footer Contact */}
          <Box mt={4} textAlign='center'>
            <Typography variant='caption' color='text.secondary' display='block'>
              {contactLine1}
            </Typography>
            {contactLine2 && (
              <Typography variant='caption' color='text.secondary' display='block'>
                {contactLine2}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default LoginContent
