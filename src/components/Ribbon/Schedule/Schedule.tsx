import { useState } from 'react'
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material'
import { CloudDownload as CloudDownloadIcon, PostAdd as PostAddIcon, Save as SaveIcon } from '@mui/icons-material'
import ImportDialog from '$components/Dialog/Import'
import SaveDialog from '$components/Dialog/Save'
import LoadDialog from '$components/Dialog/Load'

export default function ScheduleMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>()
  const [importOpen, setImportOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [loadOpen, setLoadOpen] = useState(false)

  function handleOpen(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
  }

  function handleClose(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setAnchorEl(undefined)
  }

  function handleImportOpen(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setImportOpen(true)
  }

  function handleSaveOpen(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setSaveOpen(true)
  }

  function handleLoadOpen(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation()
    setLoadOpen(true)
  }

  return (
    <>
      <MenuItem onClick={handleOpen} disableRipple>
        <ListItemText>Schedule</ListItemText>

        <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose} transitionDuration={0}>
          <MenuItem onClick={handleSaveOpen} dense>
            <ListItemIcon>
              <SaveIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Save</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleLoadOpen} dense>
            <ListItemIcon>
              <CloudDownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Load</ListItemText>
          </MenuItem>

          <MenuItem onClick={handleImportOpen} sx={{ width: 200 }} dense>
            <ListItemIcon>
              <PostAddIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Import</ListItemText>
          </MenuItem>
        </Menu>
      </MenuItem>

      <ImportDialog open={importOpen} setOpen={setImportOpen} />
      <SaveDialog open={saveOpen} setOpen={setSaveOpen} />
      <LoadDialog open={loadOpen} setOpen={setLoadOpen} />
    </>
  )
}
