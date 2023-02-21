import { useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import { Edit as EditIcon } from '@mui/icons-material'
import RenameScheduleDialog from '$components/Dialog/RenameSchedule'

/**
 * button that opens up the rename schedule dialog
 */
export default function RenameScheduleButton() {
  const [open, setOpen] = useState(false)

  function handleOpen() {
    setOpen(true)
  }

  return (
    <>
      <Tooltip title="Rename Schedule">
        <IconButton onClick={handleOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <RenameScheduleDialog open={open} setOpen={setOpen} />
    </>
  )
}
