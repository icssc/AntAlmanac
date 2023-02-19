import { useState } from 'react'
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material'
import { CloudDownload as CloudDownloadIcon, PostAdd as PostAddIcon, Save as SaveIcon } from '@mui/icons-material'
import LoadDialog from './Dialog/Load'
import ImportDialog from './Dialog/Import'
import SaveDialog from './Dialog/Save'

/**
 * speed dial that can trigger dialogs to perform actions on the schedule
 */
export default function Actions() {
  const [loadOpen, setLoadOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)

  function handleLoadClick() {
    setLoadOpen(true)
  }

  function handleImportClick() {
    setImportOpen(true)
  }

  function handleSaveClick() {
    setSaveOpen(true)
  }

  return (
    <>
      <SpeedDial
        ariaLabel="Schedule Actions"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction onClick={handleLoadClick} icon={<CloudDownloadIcon />} tooltipTitle="Load" tooltipOpen />
        <SpeedDialAction onClick={handleSaveClick} icon={<SaveIcon />} tooltipTitle="Save" tooltipOpen />
        <SpeedDialAction onClick={handleImportClick} icon={<PostAddIcon />} tooltipTitle="Import" tooltipOpen />
      </SpeedDial>

      <LoadDialog open={loadOpen} setOpen={setLoadOpen} />
      <ImportDialog open={importOpen} setOpen={setImportOpen} />
      <SaveDialog open={saveOpen} setOpen={setSaveOpen} />
    </>
  )
}
