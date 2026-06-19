'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useEffect, useState } from 'react'

// Type Imports
import type { ThemeColor } from '@core/types'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type DataType = {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}

const StatisticsCard = () => {
  const [statsData, setStatsData] = useState<DataType[]>([
    { stats: '0', title: 'Total Chats', color: 'primary', icon: 'tabler-message-circle' },
    { stats: '0', title: 'AI Handled', color: 'success', icon: 'tabler-robot' },
    { stats: '0', title: 'Escalated', color: 'error', icon: 'tabler-user-exclamation' },
    { stats: '0', title: 'Closed Deals', color: 'warning', icon: 'tabler-currency-dollar' }
  ])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStatsData([
            { stats: data.totalChats.toString(), title: 'Total Chats', color: 'primary', icon: 'tabler-message-circle' },
            { stats: data.aiHandled.toString(), title: 'AI Handled', color: 'success', icon: 'tabler-robot' },
            { stats: data.escalated.toString(), title: 'Escalated', color: 'error', icon: 'tabler-user-exclamation' },
            { stats: data.closedDeals.toString(), title: 'Closed Deals', color: 'warning', icon: 'tabler-currency-dollar' }
          ])
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      }
    }
    fetchStats()
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader
        title='Chatbot Overview'
        action={
          <Typography variant='subtitle2' color='text.disabled'>
            Real-time Updates
          </Typography>
        }
      />
      <CardContent className='flex justify-between flex-wrap gap-4 md:pbs-10 max-md:pbe-6 max-[1060px]:pbe-[74px] max-[1200px]:pbe-[52px] max-[1320px]:pbe-[74px] max-[1501px]:pbe-[52px]'>
        <Grid container spacing={4} sx={{ inlineSize: '100%' }}>
          {statsData.map((item, index) => (
            <Grid key={index} size={{ xs: 6, sm: 3 }} className='flex items-center gap-4'>
              <CustomAvatar color={item.color} variant='rounded' size={40} skin='light'>
                <i className={item.icon}></i>
              </CustomAvatar>
              <div className='flex flex-col'>
                <Typography variant='h5'>{item.stats}</Typography>
                <Typography variant='body2'>{item.title}</Typography>
              </div>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
