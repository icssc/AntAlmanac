import { ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material'
import { HistoryOutlined as RewindIcon } from '@mui/icons-material'

/**
 * button that opens a modal with information about the project
 */
export default function Old() {
  return (
    <Tooltip title="Go back to original website" placement="right">
      <ListItem disablePadding>
        <ListItemButton href="https://antalmanac.com" target="_blank">
          <ListItemIcon>
            <RewindIcon />
          </ListItemIcon>
          <ListItemText>Old Website</ListItemText>
        </ListItemButton>
      </ListItem>
    </Tooltip>
  )
}
