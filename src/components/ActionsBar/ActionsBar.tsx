import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialIcon from '@mui/material/SpeedDialIcon'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined'
import SaveIcon from '@mui/icons-material/Save'
import PrintIcon from '@mui/icons-material/Print'
import ShareIcon from '@mui/icons-material/Share'

import { MenuItem } from '@mui/material'
import LoadButton from '$components/Buttons/Load'
import SaveScheduleButton from '$components/Buttons/Save'
import ImportScheduleButton from '$components/Buttons/Import'

const actions = [
  { icon: <FileCopyIcon />, name: 'Copy' },
  { icon: <SaveIcon />, name: 'Save' },
  { icon: <PrintIcon />, name: 'Print' },
  { icon: <ShareIcon />, name: 'Share' },
]

export default function BasicSpeedDial() {
  return (
    <SpeedDial
      ariaLabel="Schedule Actions"
      sx={{ position: 'absolute', bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
    >
      <LoadButton component={SpeedDialAction} />
    </SpeedDial>
  )
}
