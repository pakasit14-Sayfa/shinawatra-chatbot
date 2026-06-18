'use client'

import { useState, type MouseEvent } from 'react'

import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

const ExportButton = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleExport = (format: string) => {
    handleClose()
    // Placeholder for export handler
    // eslint-disable-next-line no-console
    console.log(`Exporting report as ${format}`)
  }

  return (
    <>
      <Button variant='contained' onClick={handleOpen} endIcon={<i className='tabler-download' />}>
        Export
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleExport('PDF')}>PDF</MenuItem>
        <MenuItem onClick={() => handleExport('Excel')}>Excel</MenuItem>
        <MenuItem onClick={() => handleExport('CSV')}>CSV</MenuItem>
        <MenuItem onClick={() => handleExport('JSON')}>JSON</MenuItem>
      </Menu>
    </>
  )
}

export default ExportButton
