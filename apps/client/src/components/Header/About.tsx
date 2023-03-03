import { ListItemButton, ListItemIcon, Tooltip } from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'

export default function About() {
  return (
    <Tooltip title="About">
      <ListItemButton>
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>
  )
}
