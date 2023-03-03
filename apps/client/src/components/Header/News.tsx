import { ListItemButton, ListItemIcon, Tooltip } from '@mui/material'
import { RssFeed as RssFeedIcon } from '@mui/icons-material'

export default function News() {
  return (
    <Tooltip title="News">
      <ListItemButton>
        <ListItemIcon>
          <RssFeedIcon />
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>
  )
}
