import { ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material'
import { AssignmentOutlined as AssignmentIcon } from '@mui/icons-material'

/**
 * button that opens a modal with information about the project
 */
export default function Feedback() {
  return (
    <Tooltip title="Give us feedback" placement="right">
      <ListItem disablePadding>
        <ListItemButton href="https://forms.gle/k81f2aNdpdQYeKK8A" target="_blank">
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText>Feedback</ListItemText>
        </ListItemButton>
      </ListItem>
    </Tooltip>
  )
}
