import { ListItem, ListItemButton, Tooltip, useTheme, useMediaQuery } from '@mui/material'

/**
 * button that links to a feedback form
 */
export default function Feedback() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Tooltip title="Give us feedback" placement={isMobile ? 'right' : 'bottom'}>
      <ListItem>
        <ListItemButton href="https://forms.gle/k81f2aNdpdQYeKK8A" target="_blank">
          Feedback
        </ListItemButton>
      </ListItem>
    </Tooltip>
  )
}
