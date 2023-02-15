import { AppBar, Toolbar } from '@mui/material'
import LoadButton from '$components/Buttons/Load'
import SaveScheduleButton from '$components/Buttons/Save'
import ImportScheduleButton from '$components/Buttons/Import'

export default function ActionsBar() {
  return (
    <AppBar position="static">
      <Toolbar variant="dense" sx={{ justifyContent: 'space-evenly' }}>
        <SaveScheduleButton />
        <LoadButton />
        <ImportScheduleButton />
      </Toolbar>
    </AppBar>
  )
}
