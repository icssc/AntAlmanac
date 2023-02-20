import { Fragment, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import { analyticsEnum, logAnalytics } from '$lib/analytics'

interface Props {
  /**
   * whether this button is in a MUI List; otherwise assumed to be in Menu
   */
  list?: boolean
}

/**
 * button that opens a modal with information about the app
 */
export default function About(props?: Props) {
  const [open, setOpen] = useState(false)

  function handleOpen(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
    logAnalytics({
      category: analyticsEnum.nav.title,
      action: analyticsEnum.nav.actions.CLICK_ABOUT,
    })
  }

  function handleClose(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()
    e.stopPropagation()
    setOpen(false)
  }

  const WrapperElement = props?.list ? ListItem : Fragment
  const ClickElement = props?.list ? ListItemButton : MenuItem

  return (
    <WrapperElement>
      <Tooltip title="About Us">
        <ClickElement onClick={handleOpen} dense={!props?.list} href="">
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText>About</ListItemText>
        </ClickElement>
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
              <img
                src="https://contrib.rocks/image?repo=icssc/antalmanac"
                width={'100%'}
                alt="AntAlmanac Contributors"
              />
            </Link>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </WrapperElement>
  )
}
