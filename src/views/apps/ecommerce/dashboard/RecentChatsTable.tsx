'use client'

// React Imports
import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Avatar from '@mui/material/Avatar'

type RecentChatType = {
  id: number
  user: string
  platform: string
  status: string
  lastMessage: string
  time: string
  avatar: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'bot_handling':
      return 'success'
    case 'admin_handling':
      return 'warning'
    case 'closed':
      return 'default'
    default:
      return 'primary'
  }
}

const RecentChatsTable = () => {
  const [chats, setChats] = useState<RecentChatType[]>([])

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/dashboard/charts')
        if (response.ok) {
          const data = await response.json()
          setChats(data.recentChats || [])
        }
      } catch (error) {
        console.error('Failed to fetch recent chats', error)
      }
    }
    fetchChats()
    const interval = setInterval(fetchChats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader title='Recent Chat Sessions' />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Last Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {chats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No recent chats found.
                </TableCell>
              </TableRow>
            ) : (
              chats.map((chat) => (
                <TableRow key={chat.id} hover>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar src={chat.avatar} alt={chat.user} sx={{ width: 34, height: 34 }} />
                      <Typography color='text.primary' className='font-medium'>
                        {chat.user}
                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography>{chat.platform.toUpperCase()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography noWrap sx={{ maxWidth: 250 }} color="text.secondary">
                      {chat.lastMessage}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={chat.status.replace('_', ' ')} 
                      color={getStatusColor(chat.status) as any}
                      size='small' 
                      variant='tonal'
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {new Date(chat.time).toLocaleString()}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default RecentChatsTable
