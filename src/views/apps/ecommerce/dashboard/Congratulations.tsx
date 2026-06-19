'use client'

// React/Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'

const CongratulationsJohn = () => {
  const params = useParams()
  const { lang: locale } = params

  return (
    <Card>
      <Grid container>
        <Grid size={{ xs: 8 }}>
          <CardContent>
            <Typography variant='h5' className='mbe-0.5'>
              Welcome Admin 🤖
            </Typography>
            <Typography variant='subtitle1' className='mbe-2'>
              Today's AI Performance
            </Typography>
            <Typography variant='h4' color='primary.main' className='mbe-1'>
              982 Chats
            </Typography>
            <Button component={Link} href={`/${locale}/apps/chat`} variant='contained' color='primary'>
              View Active Chats
            </Button>
          </CardContent>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <div className='relative bs-full is-full'>
            <img
              alt='Congratulations John'
              src='/images/illustrations/characters/8.png'
              className='max-bs-[150px] absolute block-end-0 inline-end-6 max-is-full'
            />
          </div>
        </Grid>
      </Grid>
    </Card>
  )
}

export default CongratulationsJohn
