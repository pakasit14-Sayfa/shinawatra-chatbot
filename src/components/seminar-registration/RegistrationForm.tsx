'use client'

import { useState } from 'react'

import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

// Import จากไฟล์ที่เราสร้างไว้ก่อนหน้านี้
import type { SchoolOption } from './SchoolSearch'
import SchoolSearch from './SchoolSearch'
import type { TeacherInput } from '@/actions/seminarActions'
import { submitSeminarRegistration } from '@/actions/seminarActions'

// Type ของกิจกรรม
export type EventOption = { id: number; name: string; date: Date | null }

interface Props {
  schools: SchoolOption[]
  events: EventOption[]
}

export default function RegistrationForm({ schools, events }: Props) {
  // State ข้อมูลหลัก
  const [selectedSchool, setSelectedSchool] = useState<SchoolOption | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)

  // State รหัสผ่าน
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // State สำหรับครู
  const [teachers, setTeachers] = useState<TeacherInput[]>([])

  const [newTeacher, setNewTeacher] = useState<TeacherInput>({
    title: 'นาย',
    firstName: '',
    lastName: '',
    position: 'ครูแนะแนว',
    email: '',
    phone: ''
  })

  // State สถานะการบันทึก
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // ฟังก์ชันเพิ่มครู
  const addTeacher = () => {
    if (!newTeacher.firstName || !newTeacher.lastName) return alert('กรุณากรอกชื่อ-สกุล')
    setTeachers([...teachers, newTeacher])
    setNewTeacher({ title: 'นาย', firstName: '', lastName: '', position: 'ครูแนะแนว', email: '', phone: '' }) // Reset
  }

  // ฟังก์ชันลบครู
  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index))
  }

  // ฟังก์ชันกดบันทึก
  const handleSubmit = async () => {
    // Validation
    if (!selectedSchool || !selectedEventId || teachers.length === 1) {
      return alert('กรุณากรอกข้อมูลให้ครบถ้วน (โรงเรียน, กิจกรรม, และรายชื่อครู)')
    }

    if (!password || !confirmPassword) {
      return alert('กรุณากำหนดรหัสผ่าน')
    }

    if (password !== confirmPassword) {
      return alert('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน')
    }

    setLoading(true)

    const res = await submitSeminarRegistration({
      schoolId: selectedSchool.id,
      eventId: selectedEventId,
      teachers: teachers,
      password: password // ส่งรหัสผ่านไปด้วย
    })

    setLoading(false)
    setResult(res)

    if (res.success) {
      // เคลียร์ค่าเมื่อสำเร็จ
      setTeachers([])
      setSelectedSchool(null)
      setSelectedEventId(null)
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <Card sx={{ p: 6, maxWidth: 1000, margin: '0 auto' }}>
      <CardContent>
        <Typography variant='h5' color='primary' gutterBottom align='center' fontWeight='bold'>
          ลงทะเบียนเข้าร่วมสัมมนาครูแนะแนว
        </Typography>

        {/* --- ส่วนที่ 1: โรงเรียน --- */}
        <Typography variant='h6' sx={{ mt: 3, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          1. ข้อมูลสถานศึกษา
        </Typography>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <SchoolSearch schools={schools} onSelect={setSelectedSchool} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label='โรงเรียนที่เลือก' disabled value={selectedSchool ? selectedSchool.name : '-'} />
          </Grid>
        </Grid>

        {/* --- ส่วนที่ 1.1: กำหนดรหัสผ่าน (NEW) --- */}
        <Typography variant='h6' sx={{ mt: 3, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          2. กำหนดรหัสผ่าน (สำหรับตรวจสอบสถานะ)
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='รหัสผ่าน'
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge='end'>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label='ยืนยันรหัสผ่าน'
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={confirmPassword !== '' && password !== confirmPassword}
              helperText={confirmPassword !== '' && password !== confirmPassword ? 'รหัสผ่านไม่ตรงกัน' : ''}
            />
          </Grid>
        </Grid>

        {/* --- ส่วนที่ 2: ข้อมูลครู --- */}
        <Typography variant='h6' sx={{ mt: 4, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          3. รายชื่อครูผู้เข้าร่วม
        </Typography>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={2}>
            <TextField
              select
              fullWidth
              label='คำนำหน้า'
              SelectProps={{ native: true }}
              value={newTeacher.title}
              onChange={e => setNewTeacher({ ...newTeacher, title: e.target.value })}
            >
              <option value='นาย'>นาย</option>
              <option value='นาง'>นาง</option>
              <option value='นางสาว'>นางสาว</option>
            </TextField>
          </Grid>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label='ชื่อ'
              value={newTeacher.firstName}
              onChange={e => setNewTeacher({ ...newTeacher, firstName: e.target.value })}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              fullWidth
              label='นามสกุล'
              value={newTeacher.lastName}
              onChange={e => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label='ตำแหน่ง'
              value={newTeacher.position}
              onChange={e => setNewTeacher({ ...newTeacher, position: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label='เบอร์โทร'
              value={newTeacher.phone}
              onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label='Email'
              value={newTeacher.email}
              onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant='outlined' fullWidth onClick={addTeacher}>
              + เพิ่มรายชื่อครู
            </Button>
          </Grid>
        </Grid>

        {/* ตารางแสดงครูที่เพิ่มแล้ว */}
        {teachers.length > 0 && (
          <Table sx={{ mt: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>ชื่อ-สกุล</TableCell>
                <TableCell>เบอร์โทร</TableCell>
                <TableCell>ลบ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teachers.map((t, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {t.title}
                    {t.firstName} {t.lastName}
                  </TableCell>
                  <TableCell>{t.phone}</TableCell>
                  <TableCell>
                    <IconButton color='error' size='small' onClick={() => removeTeacher(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* --- ส่วนที่ 3: เลือกวัน --- */}
        <Typography variant='h6' sx={{ mt: 4, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          4. เลือกรอบกิจกรรม
        </Typography>
        <RadioGroup value={selectedEventId} onChange={e => setSelectedEventId(Number(e.target.value))}>
          {events.map(ev => (
            <FormControlLabel
              key={ev.id}
              value={ev.id}
              control={<Radio />}
              label={`${ev.name} (${ev.date ? ev.date.toLocaleDateString('th-TH') : '-'})`}
              sx={{ mb: 1, border: 1, borderColor: 'divider', p: 1, borderRadius: 1, width: '100%' }}
            />
          ))}
        </RadioGroup>

        {/* --- ปุ่มบันทึก --- */}
        <div style={{ marginTop: 30 }}>
          {result && (
            <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 2 }}>
              {result.message}
            </Alert>
          )}

          <Button
            variant='contained'
            color='primary'
            size='large'
            fullWidth
            onClick={handleSubmit}
            disabled={loading || !selectedSchool || teachers.length === 0 || !selectedEventId}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : 'ยืนยันการลงทะเบียน'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
