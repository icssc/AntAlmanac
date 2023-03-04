import { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  ListItem,
  ListItemButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

/**
 * button that opens a modal with information about the project
 */
export default function Beta() {
  const [open, setOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleOpen = () => {
    setOpen(true)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_ABOUT,
    })
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Tooltip title="Learn about us" placement={isMobile ? 'right' : 'bottom'}>
        <ListItem onClick={handleOpen}>
          <ListItemButton>Beta</ListItemButton>
        </ListItem>
      </Tooltip>

      <Dialog open={open}>
        <DialogTitle variant="h4" align="center" color="primary" fontWeight="600">Beta Website</DialogTitle>

        <DialogContent>
          <Box
            sx={{ width: 300, height: 400 }}
            component="img"
            src="https://imgs.search.brave.com/1STD62jqpCVsPWc9ophclCBdoLlch-43XFMQTYCj3fM/rs:fit:220:316:1/g:ce/aHR0cHM6Ly9jLnRl/bm9yLmNvbS90UGYt/VXc3RnN5RUFBQUFN/L2VseXNpYS1jaGli/aS1hbmltZS5naWY.gif"
            alt="Elysia my beloved"
          ></Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="outlined" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
