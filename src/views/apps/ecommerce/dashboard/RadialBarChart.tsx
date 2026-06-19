'use client'

// Next Imports
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'

// Third-party Imports
import type { ApexOptions } from 'apexcharts'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

const RadialBarChart = () => {
  const [resolutionRate, setResolutionRate] = useState(0)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('/api/dashboard/charts')
        if (response.ok) {
          const data = await response.json()
          setResolutionRate(data.aiResolutionRate)
        }
      } catch (error) {
        console.error('Failed to fetch chart data', error)
      }
    }
    fetchChartData()
    const interval = setInterval(fetchChartData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Vars
  const options: ApexOptions = {
    chart: {
      sparkline: { enabled: true },
      parentHeightOffset: 0
    },
    grid: {
      padding: {
        bottom: 5
      }
    },
    stroke: {
      lineCap: 'round',
      curve: 'smooth'
    },
    colors: ['var(--mui-palette-success-main)'],
    plotOptions: {
      radialBar: {
        endAngle: 90,
        startAngle: -90,
        hollow: { size: '60%' },
        track: { background: 'var(--mui-palette-divider)', strokeWidth: '40%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 0,
            fontWeight: 500,
            fontSize: '1.5rem',
            color: 'var(--mui-palette-text-primary)'
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 1200,
        options: {
          chart: {
            width: 190,
            height: 132
          },
          plotOptions: {
            radialBar: {
              dataLabels: {
                value: {
                  fontSize: '1.5rem'
                }
              }
            }
          }
        }
      },
      {
        breakpoint: 900,
        options: {
          chart: {
            width: 195,
            height: 232
          },
          plotOptions: {
            radialBar: {
              dataLabels: {
                value: {
                  fontSize: '1.5rem'
                }
              }
            }
          }
        }
      }
    ]
  }

  return (
    <Card className='h-full'>
      <CardHeader title='AI Resolution' subheader='Success Rate' className='pbe-0' />
      <CardContent className='flex flex-col gap-3 items-center'>
        <AppReactApexCharts type='radialBar' height={148} width='100%' options={options} series={[resolutionRate]} />
        <Typography variant='body2' color='text.disabled' className='sm:mbs-2 lg:mbs-0 text-center'>
          Chats handled by AI without Admin intervention
        </Typography>
      </CardContent>
    </Card>
  )
}

export default RadialBarChart
