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
export default function About() {
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
          <ListItemButton>About</ListItemButton>
        </ListItem>
      </Tooltip>

      <Dialog open={open}>
        <DialogTitle>About</DialogTitle>

        <DialogContent>
          <DialogContentText>
            AntAlmanac is a schedule planning tool for UCI students.
            <br />
            <br />
            Interested in helping out? Join our{' '}
            <Link target="_blank" href="https://discord.gg/GzF76D7UhY" color="secondary">
              Discord
            </Link>{' '}
            or checkout the{' '}
            <Link target="_blank" href="https://github.com/icssc/AntAlmanac" color="secondary">
              code on GitHub
            </Link>
            .
            <br />
            <br />
            This website is maintained by the{' '}
            <Link target="_blank" href="https://studentcouncil.ics.uci.edu/" color="secondary">
              ICS Student Council
            </Link>{' '}
            Projects Committee and built by students from the UCI community.
            <br />
            <br />
            <Link target="_blank" href="https://github.com/icssc/AntAlmanac/contributors">
              <Box
                component="img"
                src="https://contrib.rocks/image?repo=icssc/antalmanac"
                width={'100%'}
                alt="AntAlmanac Contributors"
              />
            </Link>
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
